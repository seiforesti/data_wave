"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Network, TrendingUp, TrendingDown, Activity, Target, Gauge, Cpu, Database, Server, Clock, BarChart3, Settings, Play, Pause, Stop, RefreshCw, Download, Upload, Filter, Search, Eye, EyeOff, MoreHorizontal, ChevronDown, ChevronUp, Plus, Minus, Edit, Trash2, Save, X, ExternalLink, History, Bell, Lightbulb, Rocket, AlertTriangle, CheckCircle, XCircle, AlertCircle, Calendar, User, Users, Globe, Monitor, Shield, Lock, Unlock, Power, PowerOff, Maximize2, Minimize2, Info, HelpCircle, Star, Bookmark, Flag, Tag, Archive, FileText, PieChart as PieChartIcon, LineChart as LineChartIcon, GitBranch, Package, Layers, Zap, Workflow } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, ReferenceLine, Treemap, FunnelChart, Funnel, LabelList } from 'recharts'
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Enhanced Types for Unified Orchestration Engine
interface OrchestrationEngine {
  id: string
  engine_id: string
  engine_name: string
  orchestration_type: 'unified' | 'distributed' | 'hybrid' | 'federated' | 'hierarchical' | 'mesh'
  orchestration_strategy: 'intelligent' | 'rule_based' | 'ml_driven' | 'adaptive' | 'priority_based' | 'load_balanced'
  status: 'active' | 'inactive' | 'running' | 'paused' | 'error' | 'maintenance' | 'scaling'
  orchestration_scope: 'global' | 'regional' | 'local' | 'cross_platform' | 'multi_cloud' | 'edge'
  configuration: {
    max_concurrent_workflows: number
    resource_allocation_strategy: 'dynamic' | 'static' | 'predictive' | 'adaptive'
    load_balancing_algorithm: 'round_robin' | 'weighted' | 'least_connections' | 'resource_based' | 'intelligent'
    auto_scaling: boolean
    scaling_thresholds: {
      cpu_threshold: number
      memory_threshold: number
      queue_length_threshold: number
      response_time_threshold: number
    }
    failure_handling: {
      retry_strategy: 'exponential_backoff' | 'linear' | 'custom'
      max_retries: number
      timeout_seconds: number
      circuit_breaker_enabled: boolean
    }
    monitoring: {
      health_check_interval: number
      metrics_collection_enabled: boolean
      alerting_enabled: boolean
      log_level: 'debug' | 'info' | 'warn' | 'error'
    }
    integration: {
      data_sources: string[]
      external_systems: string[]
      api_endpoints: string[]
      webhook_urls: string[]
    }
  }
  performance_metrics: {
    total_workflows_executed: number
    active_workflows: number
    completed_workflows: number
    failed_workflows: number
    avg_execution_time: number
    throughput_per_minute: number
    success_rate: number
    resource_utilization: {
      cpu_usage: number
      memory_usage: number
      storage_usage: number
      network_usage: number
    }
    sla_compliance: number
    cost_efficiency: number
  }
  resource_allocation: {
    allocated_cpu_cores: number
    allocated_memory_gb: number
    allocated_storage_gb: number
    allocated_network_bandwidth: number
    peak_resource_usage: Record<string, number>
    resource_pools: ResourcePool[]
    scaling_history: ScalingEvent[]
  }
  orchestration_workflows: OrchestrationWorkflow[]
  dependencies: OrchestrationDependency[]
  integration_status: IntegrationStatus[]
  audit_log: OrchestrationAuditEntry[]
  created_at: string
  updated_at: string
  created_by: string
}

interface OrchestrationWorkflow {
  id: string
  workflow_id: string
  workflow_name: string
  workflow_type: 'scan_orchestration' | 'data_pipeline' | 'ml_workflow' | 'compliance_check' | 'custom'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused'
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent'
  execution_context: {
    trigger_type: 'manual' | 'scheduled' | 'event_driven' | 'api_call' | 'webhook'
    trigger_source: string
    execution_environment: string
    resource_requirements: {
      cpu_cores: number
      memory_gb: number
      storage_gb: number
      estimated_duration: number
    }
    dependencies: string[]
    constraints: Record<string, any>
  }
  workflow_definition: {
    steps: WorkflowStep[]
    parallel_execution: boolean
    failure_strategy: 'stop' | 'continue' | 'retry' | 'rollback'
    rollback_strategy?: RollbackStrategy
    validation_rules: ValidationRule[]
    output_specifications: OutputSpecification[]
  }
  execution_state: {
    current_step: number
    steps_completed: number
    steps_failed: number
    execution_start: string
    execution_end?: string
    duration?: number
    progress_percentage: number
    last_checkpoint: string
    intermediate_results: Record<string, any>
  }
  resource_usage: {
    allocated_resources: Record<string, number>
    actual_usage: Record<string, number>
    cost_accumulation: number
    efficiency_score: number
  }
  monitoring: {
    real_time_metrics: Record<string, number>
    performance_indicators: Record<string, number>
    health_status: 'healthy' | 'degraded' | 'critical'
    alerts_triggered: string[]
    logs: WorkflowLog[]
  }
  sla_requirements: {
    max_execution_time: number
    availability_requirement: number
    performance_targets: Record<string, number>
    business_criticality: 'low' | 'medium' | 'high' | 'critical'
  }
  compliance_tracking: {
    compliance_requirements: string[]
    audit_trail: string[]
    data_governance_tags: string[]
    security_classification: string
  }
}

interface WorkflowStep {
  id: string
  step_name: string
  step_type: 'data_source_scan' | 'data_processing' | 'compliance_check' | 'ml_inference' | 'notification' | 'approval' | 'custom'
  execution_order: number
  dependencies: string[]
  configuration: Record<string, any>
  timeout_seconds: number
  retry_configuration: {
    max_retries: number
    retry_delay: number
    backoff_strategy: 'linear' | 'exponential' | 'fixed'
  }
  validation: {
    pre_conditions: string[]
    post_conditions: string[]
    success_criteria: string[]
  }
  resource_requirements: {
    cpu: number
    memory: number
    storage: number
    network: number
  }
  monitoring: {
    metrics_to_collect: string[]
    alerts_configuration: Record<string, any>
    logging_level: string
  }
}

interface ResourcePool {
  id: string
  pool_name: string
  pool_type: 'compute' | 'storage' | 'network' | 'mixed'
  total_capacity: Record<string, number>
  available_capacity: Record<string, number>
  allocated_capacity: Record<string, number>
  utilization_percentage: number
  cost_per_hour: number
  geographic_location: string
  availability_zone: string
  resource_tags: Record<string, string>
  scaling_policy: {
    auto_scaling_enabled: boolean
    min_capacity: Record<string, number>
    max_capacity: Record<string, number>
    scaling_triggers: Record<string, number>
  }
}

interface ScalingEvent {
  id: string
  timestamp: string
  event_type: 'scale_up' | 'scale_down' | 'scale_out' | 'scale_in'
  trigger_reason: string
  resources_affected: Record<string, number>
  duration: number
  cost_impact: number
  success: boolean
  metrics_before: Record<string, number>
  metrics_after: Record<string, number>
}

interface OrchestrationDependency {
  id: string
  dependency_type: 'service' | 'data_source' | 'external_api' | 'resource' | 'workflow'
  dependency_name: string
  dependency_url?: string
  status: 'available' | 'unavailable' | 'degraded' | 'unknown'
  health_check: {
    last_check: string
    response_time: number
    status_code?: number
    error_message?: string
  }
  sla_requirements: {
    availability_target: number
    response_time_target: number
    throughput_target: number
  }
  criticality: 'low' | 'medium' | 'high' | 'critical'
  fallback_configuration?: {
    fallback_enabled: boolean
    fallback_endpoint?: string
    degraded_mode_config?: Record<string, any>
  }
}

interface IntegrationStatus {
  id: string
  integration_name: string
  integration_type: 'data_source' | 'external_api' | 'messaging_queue' | 'database' | 'cloud_service'
  endpoint_url: string
  status: 'connected' | 'disconnected' | 'error' | 'authenticating'
  last_connection: string
  connection_health: {
    latency_ms: number
    success_rate: number
    error_rate: number
    throughput: number
  }
  authentication: {
    auth_type: 'api_key' | 'oauth' | 'certificate' | 'basic' | 'jwt'
    auth_status: 'valid' | 'expired' | 'invalid' | 'pending'
    expires_at?: string
  }
  data_flow: {
    inbound_volume: number
    outbound_volume: number
    processing_rate: number
    queue_depth: number
  }
  error_tracking: {
    recent_errors: string[]
    error_patterns: Record<string, number>
    mitigation_actions: string[]
  }
}

interface OrchestrationAuditEntry {
  id: string
  timestamp: string
  event_type: 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 'resource_allocated' | 'scaling_event' | 'configuration_changed'
  actor: string
  target_resource: string
  action_performed: string
  details: Record<string, any>
  impact_assessment: {
    affected_workflows: string[]
    resource_impact: Record<string, number>
    performance_impact: string
    compliance_impact: string
  }
  security_context: {
    user_id: string
    ip_address: string
    user_agent: string
    authorization_level: string
  }
}

interface WorkflowLog {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical'
  component: string
  message: string
  metadata: Record<string, any>
  correlation_id: string
}

interface ValidationRule {
  id: string
  rule_name: string
  rule_type: 'data_quality' | 'business_logic' | 'compliance' | 'security' | 'performance'
  validation_expression: string
  error_message: string
  severity: 'warning' | 'error' | 'critical'
  auto_remediation?: {
    enabled: boolean
    remediation_action: string
    rollback_on_failure: boolean
  }
}

interface RollbackStrategy {
  enabled: boolean
  rollback_triggers: string[]
  rollback_steps: string[]
  data_preservation: boolean
  notification_recipients: string[]
}

interface OutputSpecification {
  output_name: string
  output_type: 'data' | 'report' | 'notification' | 'metric' | 'artifact'
  format: string
  destination: string
  retention_policy: {
    retention_days: number
    archive_location?: string
    deletion_policy: string
  }
}

interface OrchestrationMetrics {
  timestamp: string
  global_metrics: {
    total_active_engines: number
    total_running_workflows: number
    total_pending_workflows: number
    total_completed_workflows: number
    total_failed_workflows: number
    overall_success_rate: number
    avg_workflow_duration: number
    system_throughput: number
    resource_utilization: Record<string, number>
    cost_metrics: {
      total_cost: number
      cost_per_workflow: number
      cost_efficiency_score: number
    }
  }
  performance_trends: {
    throughput_trend: number[]
    latency_trend: number[]
    success_rate_trend: number[]
    resource_usage_trend: number[]
    cost_trend: number[]
  }
  orchestration_health: {
    system_health_score: number
    bottlenecks_identified: string[]
    performance_recommendations: string[]
    capacity_warnings: string[]
    sla_violations: string[]
  }
  integration_status: {
    healthy_integrations: number
    degraded_integrations: number
    failed_integrations: number
    total_data_volume: number
    integration_latency: Record<string, number>
  }
}

const ORCHESTRATION_TYPES = [
  { value: 'unified', label: 'Unified Orchestration', icon: Network, color: 'blue', description: 'Single point of control for all workflows' },
  { value: 'distributed', label: 'Distributed Orchestration', icon: GitBranch, color: 'green', description: 'Distributed workflow management across nodes' },
  { value: 'hybrid', label: 'Hybrid Orchestration', icon: Layers, color: 'purple', description: 'Combination of unified and distributed approaches' },
  { value: 'federated', label: 'Federated Orchestration', icon: Globe, color: 'orange', description: 'Cross-organizational workflow coordination' },
  { value: 'hierarchical', label: 'Hierarchical Orchestration', icon: Package, color: 'cyan', description: 'Multi-level workflow management hierarchy' },
  { value: 'mesh', label: 'Mesh Orchestration', icon: Network, color: 'red', description: 'Service mesh based workflow orchestration' }
]

const ORCHESTRATION_STRATEGIES = [
  { value: 'intelligent', label: 'Intelligent', description: 'AI-powered workflow optimization and resource allocation' },
  { value: 'rule_based', label: 'Rule-Based', description: 'Predefined rules and policies for orchestration' },
  { value: 'ml_driven', label: 'ML-Driven', description: 'Machine learning powered workflow optimization' },
  { value: 'adaptive', label: 'Adaptive', description: 'Dynamic adaptation based on system conditions' },
  { value: 'priority_based', label: 'Priority-Based', description: 'Resource allocation based on workflow priorities' },
  { value: 'load_balanced', label: 'Load-Balanced', description: 'Even distribution of workloads across resources' }
]

const WORKFLOW_TYPES = [
  { value: 'scan_orchestration', label: 'Scan Orchestration', icon: Target, color: 'blue' },
  { value: 'data_pipeline', label: 'Data Pipeline', icon: Database, color: 'green' },
  { value: 'ml_workflow', label: 'ML Workflow', icon: Zap, color: 'purple' },
  { value: 'compliance_check', label: 'Compliance Check', icon: Shield, color: 'orange' },
  { value: 'custom', label: 'Custom Workflow', icon: Settings, color: 'gray' }
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' },
  { value: 'urgent', label: 'Urgent', color: 'purple' }
]

const TIME_RANGES = [
  { value: '1h', label: '1 Hour', hours: 1 },
  { value: '6h', label: '6 Hours', hours: 6 },
  { value: '1d', label: '1 Day', hours: 24 },
  { value: '3d', label: '3 Days', hours: 72 },
  { value: '1w', label: '1 Week', hours: 168 },
  { value: '2w', label: '2 Weeks', hours: 336 },
  { value: '1m', label: '1 Month', hours: 720 }
]

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

export default function UnifiedOrchestrationEngine() {
  // State management
  const [engines, setEngines] = useState<OrchestrationEngine[]>([])
  const [workflows, setWorkflows] = useState<OrchestrationWorkflow[]>([])
  const [resourcePools, setResourcePools] = useState<ResourcePool[]>([])
  const [metrics, setMetrics] = useState<OrchestrationMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [orchestrating, setOrchestrating] = useState(false)
  const [scaling, setScaling] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedEngine, setSelectedEngine] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('1d')
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [autoScaling, setAutoScaling] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<string>('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedEngine, setExpandedEngine] = useState<string | null>(null)
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null)
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([])
  const [showCreateEngineModal, setShowCreateEngineModal] = useState(false)
  const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false)
  const [showResourcePoolModal, setShowResourcePoolModal] = useState(false)
  const [showOrchestrationDetailsModal, setShowOrchestrationDetailsModal] = useState(false)

  // Refs for real-time updates
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Form state for new engine
  const [newEngine, setNewEngine] = useState({
    engine_name: '',
    orchestration_type: 'unified' as const,
    orchestration_strategy: 'intelligent' as const,
    orchestration_scope: 'global' as const,
    max_concurrent_workflows: 100,
    resource_allocation_strategy: 'dynamic' as const,
    load_balancing_algorithm: 'intelligent' as const,
    auto_scaling: true,
    scaling_thresholds: {
      cpu_threshold: 80,
      memory_threshold: 75,
      queue_length_threshold: 50,
      response_time_threshold: 5000
    },
    failure_handling: {
      retry_strategy: 'exponential_backoff' as const,
      max_retries: 3,
      timeout_seconds: 300,
      circuit_breaker_enabled: true
    },
    monitoring_enabled: true,
    alerting_enabled: true
  })

  // API functions
  const fetchEngines = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-orchestration/engines')
      if (!response.ok) throw new Error('Failed to fetch orchestration engines')
      const data = await response.json()
      setEngines(data.engines || [])
    } catch (error) {
      console.error('Error fetching engines:', error)
      toast({
        title: "Error",
        description: "Failed to fetch orchestration engines",
        variant: "destructive"
      })
    }
  }, [])

  const fetchWorkflows = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        engine_id: selectedEngine !== 'all' ? selectedEngine : '',
        workflow_type: selectedType !== 'all' ? selectedType : '',
        status: selectedStatus !== 'all' ? selectedStatus : '',
        priority: selectedPriority !== 'all' ? selectedPriority : ''
      })

      const response = await fetch(`/api/v1/scan-orchestration/workflows?${params}`)
      if (!response.ok) throw new Error('Failed to fetch workflows')
      const data = await response.json()
      setWorkflows(data.workflows || [])
    } catch (error) {
      console.error('Error fetching workflows:', error)
    }
  }, [timeRange, selectedEngine, selectedType, selectedStatus, selectedPriority])

  const fetchResourcePools = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-orchestration/resources/pools')
      if (!response.ok) throw new Error('Failed to fetch resource pools')
      const data = await response.json()
      setResourcePools(data.pools || [])
    } catch (error) {
      console.error('Error fetching resource pools:', error)
    }
  }, [])

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-orchestration/metrics')
      if (!response.ok) throw new Error('Failed to fetch orchestration metrics')
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }, [])

  const createEngine = async () => {
    if (!newEngine.engine_name.trim()) {
      toast({
        title: "Error",
        description: "Engine name is required",
        variant: "destructive"
      })
      return
    }

    setOrchestrating(true)
    try {
      const response = await fetch('/api/v1/scan-orchestration/engines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEngine)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create orchestration engine')
      }

      toast({
        title: "Success",
        description: `Orchestration engine "${newEngine.engine_name}" created successfully`,
      })

      setShowCreateEngineModal(false)
      setNewEngine({
        engine_name: '',
        orchestration_type: 'unified',
        orchestration_strategy: 'intelligent',
        orchestration_scope: 'global',
        max_concurrent_workflows: 100,
        resource_allocation_strategy: 'dynamic',
        load_balancing_algorithm: 'intelligent',
        auto_scaling: true,
        scaling_thresholds: {
          cpu_threshold: 80,
          memory_threshold: 75,
          queue_length_threshold: 50,
          response_time_threshold: 5000
        },
        failure_handling: {
          retry_strategy: 'exponential_backoff',
          max_retries: 3,
          timeout_seconds: 300,
          circuit_breaker_enabled: true
        },
        monitoring_enabled: true,
        alerting_enabled: true
      })

      await fetchEngines()
    } catch (error) {
      console.error('Error creating engine:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create engine",
        variant: "destructive"
      })
    } finally {
      setOrchestrating(false)
    }
  }

  const startOrchestration = async (workflowId: string) => {
    setOrchestrating(true)
    try {
      const response = await fetch(`/api/v1/scan-orchestration/workflows/${workflowId}/start`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start workflow orchestration')
      }

      toast({
        title: "Success",
        description: "Workflow orchestration started successfully",
      })

      await fetchWorkflows()
    } catch (error) {
      console.error('Error starting orchestration:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start orchestration",
        variant: "destructive"
      })
    } finally {
      setOrchestrating(false)
    }
  }

  const pauseOrchestration = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/v1/scan-orchestration/workflows/${workflowId}/pause`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to pause workflow')
      }

      toast({
        title: "Success",
        description: "Workflow paused successfully",
      })

      await fetchWorkflows()
    } catch (error) {
      console.error('Error pausing workflow:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to pause workflow",
        variant: "destructive"
      })
    }
  }

  const stopOrchestration = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/v1/scan-orchestration/workflows/${workflowId}/stop`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to stop workflow')
      }

      toast({
        title: "Success",
        description: "Workflow stopped successfully",
      })

      await fetchWorkflows()
    } catch (error) {
      console.error('Error stopping workflow:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to stop workflow",
        variant: "destructive"
      })
    }
  }

  const scaleResources = async (engineId: string, scaleType: 'up' | 'down') => {
    setScaling(true)
    try {
      const response = await fetch(`/api/v1/scan-orchestration/engines/${engineId}/scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scale_type: scaleType })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to scale resources')
      }

      toast({
        title: "Success",
        description: `Resources scaled ${scaleType} successfully`,
      })

      await fetchEngines()
      await fetchMetrics()
    } catch (error) {
      console.error('Error scaling resources:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to scale resources",
        variant: "destructive"
      })
    } finally {
      setScaling(false)
    }
  }

  const toggleEngineStatus = async (engineId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const response = await fetch(`/api/v1/scan-orchestration/engines/${engineId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to update engine status')
      }

      toast({
        title: "Success",
        description: `Engine ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      })

      await fetchEngines()
    } catch (error) {
      console.error('Error updating engine status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update engine status",
        variant: "destructive"
      })
    }
  }

  const optimizeOrchestration = async () => {
    setOrchestrating(true)
    try {
      const response = await fetch('/api/v1/scan-orchestration/optimize', {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to optimize orchestration')
      }

      toast({
        title: "Success",
        description: "Orchestration optimization started successfully",
      })

      await fetchEngines()
      await fetchMetrics()
    } catch (error) {
      console.error('Error optimizing orchestration:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to optimize orchestration",
        variant: "destructive"
      })
    } finally {
      setOrchestrating(false)
    }
  }

  // Real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    if (!realTimeUpdates) return

    const ws = new WebSocket(`wss://${window.location.host}/api/v1/scan-orchestration/ws`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'workflow_started') {
        setWorkflows(prev => prev.map(workflow => 
          workflow.workflow_id === data.workflow_id ? { ...workflow, status: 'running' } : workflow
        ))
      } else if (data.type === 'workflow_completed') {
        setWorkflows(prev => prev.map(workflow => 
          workflow.workflow_id === data.workflow_id ? { ...workflow, ...data.updates } : workflow
        ))
        toast({
          title: "Workflow Completed",
          description: `${data.workflow_name} completed successfully`,
        })
      } else if (data.type === 'workflow_failed') {
        setWorkflows(prev => prev.map(workflow => 
          workflow.workflow_id === data.workflow_id ? { ...workflow, status: 'failed' } : workflow
        ))
        toast({
          title: "Workflow Failed",
          description: `${data.workflow_name} execution failed: ${data.error}`,
          variant: "destructive"
        })
      } else if (data.type === 'resource_scaled') {
        setEngines(prev => prev.map(engine => 
          engine.engine_id === data.engine_id ? { ...engine, ...data.updates } : engine
        ))
      } else if (data.type === 'metrics_updated') {
        setMetrics(data.metrics)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [realTimeUpdates])

  // Effects
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchEngines(),
        fetchWorkflows(),
        fetchResourcePools(),
        fetchMetrics()
      ])
      setLoading(false)
    }

    loadData()
  }, [fetchEngines, fetchWorkflows, fetchResourcePools, fetchMetrics])

  useEffect(() => {
    return setupRealTimeUpdates()
  }, [setupRealTimeUpdates])

  useEffect(() => {
    if (!realTimeUpdates) return

    intervalRef.current = setInterval(() => {
      fetchMetrics()
    }, 30000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [realTimeUpdates, fetchMetrics])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  // Derived data
  const filteredWorkflows = useMemo(() => {
    let filtered = workflows

    if (searchTerm) {
      filtered = filtered.filter(workflow => 
        workflow.workflow_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.workflow_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(workflow => workflow.workflow_type === selectedType)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(workflow => workflow.status === selectedStatus)
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(workflow => workflow.priority === selectedPriority)
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof OrchestrationWorkflow]
      const bValue = b[sortBy as keyof OrchestrationWorkflow]
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [workflows, searchTerm, selectedType, selectedStatus, selectedPriority, sortBy, sortOrder])

  const chartData = useMemo(() => {
    if (!metrics) return []
    return metrics.performance_trends.throughput_trend.map((value, index) => ({
      time: index,
      throughput: value,
      latency: metrics.performance_trends.latency_trend[index],
      success_rate: metrics.performance_trends.success_rate_trend[index],
      resource_usage: metrics.performance_trends.resource_usage_trend[index],
      cost: metrics.performance_trends.cost_trend[index]
    }))
  }, [metrics])

  const workflowDistributionData = useMemo(() => {
    const distribution = workflows.reduce((acc, workflow) => {
      acc[workflow.workflow_type] = (acc[workflow.workflow_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(distribution).map(([type, count]) => ({
      name: type,
      value: count,
      color: WORKFLOW_TYPES.find(t => t.value === type)?.color || 'gray'
    }))
  }, [workflows])

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'running': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'paused': return 'bg-blue-500'
      case 'completed': return 'bg-purple-500'
      case 'failed': case 'error': return 'bg-red-500'
      case 'cancelled': case 'inactive': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = ORCHESTRATION_TYPES.find(t => t.value === type)
    return typeConfig?.icon || Network
  }

  const getTypeColor = (type: string) => {
    const typeConfig = ORCHESTRATION_TYPES.find(t => t.value === type)
    return typeConfig?.color || 'gray'
  }

  const getPriorityColor = (priority: string) => {
    const priorityConfig = PRIORITY_LEVELS.find(p => p.value === priority)
    return priorityConfig?.color || 'gray'
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading unified orchestration engine...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Unified Orchestration Engine</h2>
          <p className="text-muted-foreground">
            Core orchestration engine with intelligent workflow management and resource allocation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="real-time-updates"
              checked={realTimeUpdates}
              onCheckedChange={setRealTimeUpdates}
            />
            <Label htmlFor="real-time-updates" className="text-sm">Real-time</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="auto-scaling"
              checked={autoScaling}
              onCheckedChange={setAutoScaling}
            />
            <Label htmlFor="auto-scaling" className="text-sm">Auto-scale</Label>
          </div>
          <Button onClick={() => setShowCreateEngineModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Engine
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.global_metrics.total_running_workflows}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.global_metrics.total_pending_workflows} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(metrics.global_metrics.overall_success_rate)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.global_metrics.total_completed_workflows} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.global_metrics.system_throughput.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                workflows/min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(metrics.orchestration_health.system_health_score)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.orchestration_health.bottlenecks_identified.length} bottlenecks
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="engine-select">Engine</Label>
                <Select value={selectedEngine} onValueChange={setSelectedEngine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select engine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Engines</SelectItem>
                    {engines.map(engine => (
                      <SelectItem key={engine.id} value={engine.id}>
                        {engine.engine_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-select">Workflow Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {WORKFLOW_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-select">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority-select">Priority</Label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {PRIORITY_LEVELS.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={optimizeOrchestration} disabled={orchestrating} variant="outline">
                {orchestrating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
                Optimize
              </Button>
              <Button onClick={() => setShowCreateWorkflowModal(true)}>
                <Workflow className="h-4 w-4 mr-2" />
                New Workflow
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engines">Engines</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Orchestration performance metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="throughput" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="Throughput"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="success_rate" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Success Rate"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="latency" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Latency"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Distribution</CardTitle>
                <CardDescription>Distribution of workflows by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={workflowDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {workflowDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Resource Utilization */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Current system resource usage and allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Used</span>
                        <span>{formatPercentage(metrics.global_metrics.resource_utilization.cpu || 0)}</span>
                      </div>
                      <Progress value={metrics.global_metrics.resource_utilization.cpu || 0} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Memory Usage</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Used</span>
                        <span>{formatPercentage(metrics.global_metrics.resource_utilization.memory || 0)}</span>
                      </div>
                      <Progress value={metrics.global_metrics.resource_utilization.memory || 0} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Network Usage</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Used</span>
                        <span>{formatPercentage(metrics.global_metrics.resource_utilization.network || 0)}</span>
                      </div>
                      <Progress value={metrics.global_metrics.resource_utilization.network || 0} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Storage Usage</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Used</span>
                        <span>{formatPercentage(metrics.global_metrics.resource_utilization.storage || 0)}</span>
                      </div>
                      <Progress value={metrics.global_metrics.resource_utilization.storage || 0} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Workflows Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>Currently running workflow orchestrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWorkflows.filter(w => w.status === 'running').slice(0, 5).map(workflow => (
                  <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-${WORKFLOW_TYPES.find(t => t.value === workflow.workflow_type)?.color || 'gray'}-100`}>
                        {React.createElement(WORKFLOW_TYPES.find(t => t.value === workflow.workflow_type)?.icon || Workflow, { 
                          className: `h-5 w-5 text-${WORKFLOW_TYPES.find(t => t.value === workflow.workflow_type)?.color || 'gray'}-600` 
                        })}
                      </div>
                      <div>
                        <h4 className="font-medium">{workflow.workflow_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Step {workflow.execution_state.current_step} of {workflow.workflow_definition.steps.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatPercentage(workflow.execution_state.progress_percentage)}</div>
                        <div className="text-xs text-muted-foreground">
                          {workflow.execution_state.duration ? formatDuration(workflow.execution_state.duration) : 'Running...'}
                        </div>
                      </div>
                      <Progress value={workflow.execution_state.progress_percentage} className="w-24" />
                      <Button variant="outline" size="sm" onClick={() => pauseOrchestration(workflow.workflow_id)}>
                        <Pause className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredWorkflows.filter(w => w.status === 'running').length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No active workflows running</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engines" className="space-y-4">
          {/* Engines Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {engines.map(engine => {
              const TypeIcon = getTypeIcon(engine.orchestration_type)
              const isExpanded = expandedEngine === engine.engine_id
              
              return (
                <Card key={engine.engine_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${getTypeColor(engine.orchestration_type)}-100`}>
                          <TypeIcon className={`h-5 w-5 text-${getTypeColor(engine.orchestration_type)}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{engine.engine_name}</CardTitle>
                          <CardDescription className="text-sm">
                            {ORCHESTRATION_TYPES.find(t => t.value === engine.orchestration_type)?.label}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs", getStatusColor(engine.status))}>
                          {engine.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedEngine(isExpanded ? null : engine.engine_id)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Active Workflows</span>
                        <span className="text-sm font-medium">{engine.performance_metrics.active_workflows}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Success Rate</span>
                        <span className="text-sm font-medium">{formatPercentage(engine.performance_metrics.success_rate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Throughput</span>
                        <span className="text-sm font-medium">{engine.performance_metrics.throughput_per_minute.toFixed(1)}/min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg Execution Time</span>
                        <span className="text-sm font-medium">{formatDuration(engine.performance_metrics.avg_execution_time)}</span>
                      </div>
                    </div>

                    {/* Resource Usage */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resource Usage</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>CPU:</span>
                          <span>{formatPercentage(engine.performance_metrics.resource_utilization.cpu_usage)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Memory:</span>
                          <span>{formatPercentage(engine.performance_metrics.resource_utilization.memory_usage)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="pt-4 border-t space-y-4">
                        {/* Configuration */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Configuration</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Strategy:</span>
                              <span>{engine.orchestration_strategy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Scope:</span>
                              <span>{engine.orchestration_scope}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Workflows:</span>
                              <span>{engine.configuration.max_concurrent_workflows}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Auto Scaling:</span>
                              <span>{engine.configuration.auto_scaling ? 'Enabled' : 'Disabled'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Resource Allocation */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Allocated Resources</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>CPU Cores:</span>
                              <span>{engine.resource_allocation.allocated_cpu_cores}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Memory:</span>
                              <span>{engine.resource_allocation.allocated_memory_gb} GB</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Storage:</span>
                              <span>{engine.resource_allocation.allocated_storage_gb} GB</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleEngineStatus(engine.engine_id, engine.status)}
                        disabled={engine.status === 'running'}
                        className="flex-1"
                      >
                        {engine.status === 'active' ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                        {engine.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => scaleResources(engine.engine_id, 'up')}
                        disabled={scaling}
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Scale
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {engines.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Orchestration Engines Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first orchestration engine to start managing workflows
                </p>
                <Button onClick={() => setShowCreateEngineModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Orchestration Engine
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search workflows..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Workflows List */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Orchestrations</CardTitle>
              <CardDescription>Manage and monitor all workflow executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWorkflows.map(workflow => {
                  const WorkflowIcon = WORKFLOW_TYPES.find(t => t.value === workflow.workflow_type)?.icon || Workflow
                  const isExpanded = expandedWorkflow === workflow.workflow_id
                  
                  return (
                    <div key={workflow.workflow_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg bg-${WORKFLOW_TYPES.find(t => t.value === workflow.workflow_type)?.color || 'gray'}-100`}>
                            <WorkflowIcon className={`h-5 w-5 text-${WORKFLOW_TYPES.find(t => t.value === workflow.workflow_type)?.color || 'gray'}-600`} />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{workflow.workflow_name}</h4>
                              <Badge className={cn("text-xs", getStatusColor(workflow.status))}>
                                {workflow.status}
                              </Badge>
                              <Badge className={cn("text-xs", `bg-${getPriorityColor(workflow.priority)}-100`, `text-${getPriorityColor(workflow.priority)}-700`)}>
                                {workflow.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {workflow.workflow_definition.steps.length} steps • 
                              Step {workflow.execution_state.current_step} of {workflow.workflow_definition.steps.length}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">Progress:</span>{' '}
                                <span className="font-medium">{formatPercentage(workflow.execution_state.progress_percentage)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Duration:</span>{' '}
                                <span className="font-medium">
                                  {workflow.execution_state.duration ? formatDuration(workflow.execution_state.duration) : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Health:</span>{' '}
                                <span className={cn(
                                  "font-medium",
                                  workflow.monitoring.health_status === 'healthy' ? 'text-green-600' :
                                  workflow.monitoring.health_status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                                )}>
                                  {workflow.monitoring.health_status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Progress value={workflow.execution_state.progress_percentage} className="w-24" />
                          {workflow.status === 'running' && (
                            <Button variant="outline" size="sm" onClick={() => pauseOrchestration(workflow.workflow_id)}>
                              <Pause className="h-3 w-3" />
                            </Button>
                          )}
                          {workflow.status === 'paused' && (
                            <Button variant="outline" size="sm" onClick={() => startOrchestration(workflow.workflow_id)}>
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          {(workflow.status === 'running' || workflow.status === 'paused') && (
                            <Button variant="outline" size="sm" onClick={() => stopOrchestration(workflow.workflow_id)}>
                              <Stop className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedWorkflow(isExpanded ? null : workflow.workflow_id)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Execution Context */}
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Execution Context</p>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span>Trigger:</span>
                                  <span>{workflow.execution_context.trigger_type}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Environment:</span>
                                  <span>{workflow.execution_context.execution_environment}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>CPU Required:</span>
                                  <span>{workflow.execution_context.resource_requirements.cpu_cores} cores</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Memory Required:</span>
                                  <span>{workflow.execution_context.resource_requirements.memory_gb} GB</span>
                                </div>
                              </div>
                            </div>

                            {/* Resource Usage */}
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resource Usage</p>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span>Cost Accumulated:</span>
                                  <span>${workflow.resource_usage.cost_accumulation.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Efficiency Score:</span>
                                  <span>{formatPercentage(workflow.resource_usage.efficiency_score)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>CPU Usage:</span>
                                  <span>{formatPercentage(workflow.resource_usage.actual_usage.cpu || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Memory Usage:</span>
                                  <span>{formatPercentage(workflow.resource_usage.actual_usage.memory || 0)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SLA Requirements */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">SLA Requirements</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div className="flex justify-between">
                                <span>Max Execution Time:</span>
                                <span>{formatDuration(workflow.sla_requirements.max_execution_time)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Availability:</span>
                                <span>{formatPercentage(workflow.sla_requirements.availability_requirement)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Business Criticality:</span>
                                <span className={cn(
                                  workflow.sla_requirements.business_criticality === 'critical' ? 'text-red-600' :
                                  workflow.sla_requirements.business_criticality === 'high' ? 'text-orange-600' :
                                  workflow.sla_requirements.business_criticality === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                )}>
                                  {workflow.sla_requirements.business_criticality}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {filteredWorkflows.length === 0 && (
                <div className="text-center py-12">
                  <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Workflows Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No workflows match your current filters or none have been created yet
                  </p>
                  <Button onClick={() => setShowCreateWorkflowModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {/* Resource Pools */}
          <Card>
            <CardContent className="text-center py-12">
              <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Resource Management</h3>
              <p className="text-muted-foreground">
                Advanced resource pools and allocation management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          {/* Monitoring Dashboard */}
          <Card>
            <CardContent className="text-center py-12">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Real-time Monitoring</h3>
              <p className="text-muted-foreground">
                Comprehensive monitoring dashboard and alerting system coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          {/* Integration Status */}
          <Card>
            <CardContent className="text-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">System Integrations</h3>
              <p className="text-muted-foreground">
                External system integrations and API connections coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Engine Modal */}
      {showCreateEngineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Create Orchestration Engine</CardTitle>
                  <CardDescription>Configure a new intelligent orchestration engine</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateEngineModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="engine-name">Engine Name</Label>
                  <Input
                    id="engine-name"
                    placeholder="Enter engine name..."
                    value={newEngine.engine_name}
                    onChange={(e) => setNewEngine(prev => ({ ...prev, engine_name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orchestration-type">Orchestration Type</Label>
                    <Select
                      value={newEngine.orchestration_type}
                      onValueChange={(value: any) => setNewEngine(prev => ({ ...prev, orchestration_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORCHESTRATION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orchestration-strategy">Strategy</Label>
                    <Select
                      value={newEngine.orchestration_strategy}
                      onValueChange={(value: any) => setNewEngine(prev => ({ ...prev, orchestration_strategy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORCHESTRATION_STRATEGIES.map(strategy => (
                          <SelectItem key={strategy.value} value={strategy.value}>
                            {strategy.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Resource Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium">Resource Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-workflows">Max Concurrent Workflows</Label>
                    <Input
                      id="max-workflows"
                      type="number"
                      value={newEngine.max_concurrent_workflows}
                      onChange={(e) => setNewEngine(prev => ({ ...prev, max_concurrent_workflows: parseInt(e.target.value) || 100 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpu-threshold">CPU Threshold: {newEngine.scaling_thresholds.cpu_threshold}%</Label>
                    <Slider
                      id="cpu-threshold"
                      min={50}
                      max={95}
                      step={5}
                      value={[newEngine.scaling_thresholds.cpu_threshold]}
                      onValueChange={(value) => setNewEngine(prev => ({
                        ...prev,
                        scaling_thresholds: {
                          ...prev.scaling_thresholds,
                          cpu_threshold: value[0]
                        }
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="memory-threshold">Memory Threshold: {newEngine.scaling_thresholds.memory_threshold}%</Label>
                    <Slider
                      id="memory-threshold"
                      min={50}
                      max={90}
                      step={5}
                      value={[newEngine.scaling_thresholds.memory_threshold]}
                      onValueChange={(value) => setNewEngine(prev => ({
                        ...prev,
                        scaling_thresholds: {
                          ...prev.scaling_thresholds,
                          memory_threshold: value[0]
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-retries">Max Retries</Label>
                    <Input
                      id="max-retries"
                      type="number"
                      value={newEngine.failure_handling.max_retries}
                      onChange={(e) => setNewEngine(prev => ({
                        ...prev,
                        failure_handling: {
                          ...prev.failure_handling,
                          max_retries: parseInt(e.target.value) || 3
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Configuration Options */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Configuration Options</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-scaling">Auto Scaling</Label>
                    <Switch
                      id="auto-scaling"
                      checked={newEngine.auto_scaling}
                      onCheckedChange={(checked) => setNewEngine(prev => ({ ...prev, auto_scaling: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="monitoring-enabled">Monitoring</Label>
                    <Switch
                      id="monitoring-enabled"
                      checked={newEngine.monitoring_enabled}
                      onCheckedChange={(checked) => setNewEngine(prev => ({ ...prev, monitoring_enabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alerting-enabled">Alerting</Label>
                    <Switch
                      id="alerting-enabled"
                      checked={newEngine.alerting_enabled}
                      onCheckedChange={(checked) => setNewEngine(prev => ({ ...prev, alerting_enabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="circuit-breaker">Circuit Breaker</Label>
                    <Switch
                      id="circuit-breaker"
                      checked={newEngine.failure_handling.circuit_breaker_enabled}
                      onCheckedChange={(checked) => setNewEngine(prev => ({
                        ...prev,
                        failure_handling: {
                          ...prev.failure_handling,
                          circuit_breaker_enabled: checked
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateEngineModal(false)}>
                  Cancel
                </Button>
                <Button onClick={createEngine} disabled={orchestrating}>
                  {orchestrating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Engine
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}