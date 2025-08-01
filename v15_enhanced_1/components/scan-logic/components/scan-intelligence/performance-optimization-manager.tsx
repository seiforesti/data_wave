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
import { Zap, TrendingUp, TrendingDown, Activity, Target, Gauge, Cpu, Database, Network, HardDrive, Clock, BarChart3, Settings, Play, Pause, Stop, RefreshCw, Download, Upload, Filter, Search, Eye, EyeOff, MoreHorizontal, ChevronDown, ChevronUp, Plus, Minus, Edit, Trash2, Save, X, ExternalLink, History, Bell, Lightbulb, Rocket, AlertTriangle, CheckCircle, XCircle, AlertCircle, Calendar, User, Users, Globe, Monitor, Server, Shield, Lock, Unlock, Power, PowerOff, Maximize2, Minimize2, Info, HelpCircle, Star, Bookmark, Flag, Tag, Archive, FileText, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, ReferenceLine, Treemap, FunnelChart, Funnel, LabelList } from 'recharts'
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Enhanced Types for Performance Optimization Manager
interface OptimizationEngine {
  id: string
  engine_id: string
  engine_name: string
  optimization_type: 'performance' | 'resource' | 'cost' | 'throughput' | 'latency' | 'scalability' | 'efficiency' | 'quality'
  optimization_strategy: 'aggressive' | 'conservative' | 'balanced' | 'adaptive' | 'custom' | 'ml_driven' | 'rule_based'
  status: 'active' | 'inactive' | 'optimizing' | 'monitoring' | 'error' | 'maintenance' | 'learning'
  target_metrics: string[]
  baseline_performance: {
    cpu_utilization: number
    memory_usage: number
    disk_io: number
    network_io: number
    scan_throughput: number
    avg_scan_time: number
    success_rate: number
    error_rate: number
    cost_per_scan: number
    resource_efficiency: number
  }
  current_performance: {
    cpu_utilization: number
    memory_usage: number
    disk_io: number
    network_io: number
    scan_throughput: number
    avg_scan_time: number
    success_rate: number
    error_rate: number
    cost_per_scan: number
    resource_efficiency: number
  }
  optimization_goals: {
    target_cpu_utilization: number
    target_memory_usage: number
    target_scan_time: number
    target_throughput: number
    target_cost_reduction: number
    target_efficiency_gain: number
    priority_weights: Record<string, number>
  }
  configuration: {
    auto_optimize: boolean
    optimization_frequency: string
    performance_threshold: number
    resource_limits: {
      max_cpu_percent: number
      max_memory_gb: number
      max_disk_iops: number
      max_network_mbps: number
    }
    optimization_algorithms: string[]
    learning_enabled: boolean
    rollback_enabled: boolean
    safety_checks: boolean
    notification_enabled: boolean
  }
  optimization_history: OptimizationRecord[]
  recommendations: OptimizationRecommendation[]
  created_at: string
  updated_at: string
  last_optimized: string
  next_optimization: string
  created_by: string
}

interface OptimizationRecord {
  id: string
  record_id: string
  optimization_id: string
  optimization_type: string
  strategy_used: string
  execution_start: string
  execution_end: string
  execution_duration: number
  parameters_changed: Record<string, any>
  before_metrics: Record<string, number>
  after_metrics: Record<string, number>
  improvement_percentage: Record<string, number>
  overall_improvement: number
  cost_impact: number
  resource_impact: Record<string, number>
  success: boolean
  rollback_available: boolean
  rollback_executed: boolean
  side_effects: string[]
  confidence_score: number
  validation_results: Record<string, any>
  approval_status: 'pending' | 'approved' | 'rejected' | 'auto_approved'
  approved_by?: string
  notes: string
  metadata: Record<string, any>
}

interface OptimizationRecommendation {
  id: string
  recommendation_id: string
  engine_id: string
  recommendation_type: 'configuration' | 'resource_allocation' | 'algorithm_change' | 'scaling' | 'scheduling' | 'caching' | 'parallelization'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  detailed_analysis: string
  expected_improvement: Record<string, number>
  implementation_effort: 'low' | 'medium' | 'high'
  risk_level: 'low' | 'medium' | 'high'
  estimated_impact: {
    performance_gain: number
    cost_reduction: number
    resource_efficiency: number
    implementation_time: string
    validation_time: string
  }
  prerequisites: string[]
  implementation_steps: string[]
  validation_criteria: string[]
  rollback_plan: string[]
  similar_cases: string[]
  confidence_level: number
  auto_applicable: boolean
  requires_approval: boolean
  status: 'pending' | 'applied' | 'rejected' | 'expired' | 'superseded'
  created_at: string
  expires_at: string
  applied_at?: string
  applied_by?: string
}

interface ResourceProfile {
  id: string
  profile_id: string
  profile_name: string
  profile_type: 'cpu_optimized' | 'memory_optimized' | 'io_optimized' | 'network_optimized' | 'balanced' | 'cost_optimized' | 'custom'
  resource_allocation: {
    cpu_cores: number
    memory_gb: number
    disk_space_gb: number
    disk_iops: number
    network_bandwidth_mbps: number
    concurrent_scans: number
    thread_pool_size: number
    cache_size_gb: number
  }
  performance_characteristics: {
    optimal_workload_size: string
    max_concurrent_operations: number
    avg_processing_time: number
    resource_utilization_target: number
    scaling_behavior: string
  }
  cost_metrics: {
    hourly_cost: number
    cost_per_operation: number
    efficiency_ratio: number
    cost_optimization_potential: number
  }
  usage_statistics: {
    total_usage_hours: number
    operations_processed: number
    avg_utilization: number
    peak_utilization: number
    idle_time_percentage: number
  }
  optimization_suggestions: string[]
  status: 'active' | 'deprecated' | 'experimental' | 'testing'
  created_at: string
  updated_at: string
}

interface PerformanceMetrics {
  timestamp: string
  system_metrics: {
    total_cpu_usage: number
    total_memory_usage: number
    total_disk_io: number
    total_network_io: number
    active_scans: number
    queued_scans: number
    completed_scans: number
    failed_scans: number
  }
  optimization_metrics: {
    total_optimizations: number
    successful_optimizations: number
    active_engines: number
    avg_improvement: number
    cost_savings: number
    efficiency_gain: number
    recommendations_generated: number
    recommendations_applied: number
  }
  performance_trends: {
    throughput_trend: number[]
    latency_trend: number[]
    efficiency_trend: number[]
    cost_trend: number[]
    error_rate_trend: number[]
  }
  resource_utilization: {
    cpu_utilization_by_component: Record<string, number>
    memory_usage_by_component: Record<string, number>
    disk_io_by_operation: Record<string, number>
    network_usage_by_service: Record<string, number>
  }
  optimization_opportunities: {
    identified_bottlenecks: string[]
    improvement_potential: Record<string, number>
    quick_wins: string[]
    long_term_strategies: string[]
  }
}

interface AutoTuningConfig {
  enabled: boolean
  aggressiveness_level: 'conservative' | 'moderate' | 'aggressive' | 'experimental'
  target_metrics: string[]
  optimization_frequency: 'continuous' | 'hourly' | 'daily' | 'weekly' | 'on_demand'
  safety_thresholds: {
    max_performance_degradation: number
    max_cost_increase: number
    max_downtime_minutes: number
    rollback_triggers: string[]
  }
  learning_parameters: {
    enable_ml_optimization: boolean
    training_data_window: string
    model_update_frequency: string
    confidence_threshold: number
    exploration_rate: number
  }
  approval_workflows: {
    require_approval_for_major_changes: boolean
    auto_approve_threshold: number
    approval_timeout_hours: number
    escalation_policy: string
  }
  notification_settings: {
    notify_on_optimization: boolean
    notify_on_errors: boolean
    notify_on_improvements: boolean
    notification_channels: string[]
  }
}

const OPTIMIZATION_TYPES = [
  { value: 'performance', label: 'Performance Optimization', icon: Zap, color: 'green', description: 'Optimize for maximum performance and speed' },
  { value: 'resource', label: 'Resource Optimization', icon: Cpu, color: 'blue', description: 'Optimize resource utilization and allocation' },
  { value: 'cost', label: 'Cost Optimization', icon: TrendingDown, color: 'orange', description: 'Minimize operational costs and expenses' },
  { value: 'throughput', label: 'Throughput Optimization', icon: BarChart3, color: 'purple', description: 'Maximize data processing throughput' },
  { value: 'latency', label: 'Latency Optimization', icon: Clock, color: 'red', description: 'Minimize response times and delays' },
  { value: 'scalability', label: 'Scalability Optimization', icon: TrendingUp, color: 'indigo', description: 'Improve system scalability and capacity' },
  { value: 'efficiency', label: 'Efficiency Optimization', icon: Target, color: 'cyan', description: 'Enhance overall system efficiency' },
  { value: 'quality', label: 'Quality Optimization', icon: Star, color: 'yellow', description: 'Improve output quality and accuracy' }
]

const OPTIMIZATION_STRATEGIES = [
  { value: 'aggressive', label: 'Aggressive', description: 'Maximum optimization with higher risk tolerance' },
  { value: 'conservative', label: 'Conservative', description: 'Safe optimization with minimal risk' },
  { value: 'balanced', label: 'Balanced', description: 'Balance between optimization and stability' },
  { value: 'adaptive', label: 'Adaptive', description: 'Dynamically adjust strategy based on conditions' },
  { value: 'custom', label: 'Custom', description: 'User-defined optimization parameters' },
  { value: 'ml_driven', label: 'ML-Driven', description: 'Machine learning powered optimization' },
  { value: 'rule_based', label: 'Rule-Based', description: 'Predefined rules and thresholds' }
]

const RESOURCE_PROFILES = [
  { value: 'cpu_optimized', label: 'CPU Optimized', description: 'High-performance CPU with moderate memory' },
  { value: 'memory_optimized', label: 'Memory Optimized', description: 'High memory capacity for large datasets' },
  { value: 'io_optimized', label: 'I/O Optimized', description: 'High-speed storage and disk operations' },
  { value: 'network_optimized', label: 'Network Optimized', description: 'High bandwidth and network throughput' },
  { value: 'balanced', label: 'Balanced', description: 'Balanced resources for general workloads' },
  { value: 'cost_optimized', label: 'Cost Optimized', description: 'Minimal resources to reduce costs' },
  { value: 'custom', label: 'Custom', description: 'User-defined resource allocation' }
]

const RECOMMENDATION_TYPES = [
  { value: 'configuration', label: 'Configuration Changes', icon: Settings, color: 'blue' },
  { value: 'resource_allocation', label: 'Resource Allocation', icon: Cpu, color: 'green' },
  { value: 'algorithm_change', label: 'Algorithm Optimization', icon: Lightbulb, color: 'yellow' },
  { value: 'scaling', label: 'Scaling Adjustments', icon: TrendingUp, color: 'purple' },
  { value: 'scheduling', label: 'Scheduling Optimization', icon: Calendar, color: 'orange' },
  { value: 'caching', label: 'Caching Strategy', icon: Database, color: 'cyan' },
  { value: 'parallelization', label: 'Parallelization', icon: Network, color: 'red' }
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

export default function PerformanceOptimizationManager() {
  // State management
  const [engines, setEngines] = useState<OptimizationEngine[]>([])
  const [resourceProfiles, setResourceProfiles] = useState<ResourceProfile[]>([])
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [autoTuningConfig, setAutoTuningConfig] = useState<AutoTuningConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [optimizing, setOptimizing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedEngine, setSelectedEngine] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedProfile, setSelectedProfile] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('1d')
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [autoOptimization, setAutoOptimization] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<string>('last_optimized')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedEngine, setExpandedEngine] = useState<string | null>(null)
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [showCreateEngineModal, setShowCreateEngineModal] = useState(false)
  const [showTuningConfigModal, setShowTuningConfigModal] = useState(false)
  const [showOptimizationDetailsModal, setShowOptimizationDetailsModal] = useState(false)
  const [selectedOptimizationRecord, setSelectedOptimizationRecord] = useState<OptimizationRecord | null>(null)

  // Refs for real-time updates
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Form state for new engine
  const [newEngine, setNewEngine] = useState({
    engine_name: '',
    optimization_type: 'performance' as const,
    optimization_strategy: 'balanced' as const,
    target_metrics: [] as string[],
    optimization_goals: {
      target_cpu_utilization: 80,
      target_memory_usage: 75,
      target_scan_time: 300,
      target_throughput: 100,
      target_cost_reduction: 20,
      target_efficiency_gain: 15,
      priority_weights: {
        performance: 0.3,
        cost: 0.2,
        efficiency: 0.3,
        quality: 0.2
      }
    },
    configuration: {
      auto_optimize: true,
      optimization_frequency: 'daily',
      performance_threshold: 0.1,
      resource_limits: {
        max_cpu_percent: 90,
        max_memory_gb: 32,
        max_disk_iops: 10000,
        max_network_mbps: 1000
      },
      optimization_algorithms: ['gradient_descent', 'genetic_algorithm', 'simulated_annealing'],
      learning_enabled: true,
      rollback_enabled: true,
      safety_checks: true,
      notification_enabled: true
    }
  })

  // API functions
  const fetchEngines = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/optimization/engines')
      if (!response.ok) throw new Error('Failed to fetch optimization engines')
      const data = await response.json()
      setEngines(data.engines || [])
    } catch (error) {
      console.error('Error fetching engines:', error)
      toast({
        title: "Error",
        description: "Failed to fetch optimization engines",
        variant: "destructive"
      })
    }
  }, [])

  const fetchResourceProfiles = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/optimization/profiles')
      if (!response.ok) throw new Error('Failed to fetch resource profiles')
      const data = await response.json()
      setResourceProfiles(data.profiles || [])
    } catch (error) {
      console.error('Error fetching resource profiles:', error)
    }
  }, [])

  const fetchRecommendations = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        engine_id: selectedEngine !== 'all' ? selectedEngine : '',
        recommendation_type: selectedType !== 'all' ? selectedType : '',
        status: 'pending'
      })

      const response = await fetch(`/api/v1/scan-intelligence/optimization/recommendations?${params}`)
      if (!response.ok) throw new Error('Failed to fetch recommendations')
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }, [timeRange, selectedEngine, selectedType])

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/optimization/metrics')
      if (!response.ok) throw new Error('Failed to fetch performance metrics')
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }, [])

  const fetchAutoTuningConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/optimization/auto-tuning/config')
      if (!response.ok) throw new Error('Failed to fetch auto-tuning config')
      const data = await response.json()
      setAutoTuningConfig(data.config)
    } catch (error) {
      console.error('Error fetching auto-tuning config:', error)
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

    setOptimizing(true)
    try {
      const response = await fetch('/api/v1/scan-intelligence/optimization/engines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEngine)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create optimization engine')
      }

      toast({
        title: "Success",
        description: `Optimization engine "${newEngine.engine_name}" created successfully`,
      })

      setShowCreateEngineModal(false)
      setNewEngine({
        engine_name: '',
        optimization_type: 'performance',
        optimization_strategy: 'balanced',
        target_metrics: [],
        optimization_goals: {
          target_cpu_utilization: 80,
          target_memory_usage: 75,
          target_scan_time: 300,
          target_throughput: 100,
          target_cost_reduction: 20,
          target_efficiency_gain: 15,
          priority_weights: {
            performance: 0.3,
            cost: 0.2,
            efficiency: 0.3,
            quality: 0.2
          }
        },
        configuration: {
          auto_optimize: true,
          optimization_frequency: 'daily',
          performance_threshold: 0.1,
          resource_limits: {
            max_cpu_percent: 90,
            max_memory_gb: 32,
            max_disk_iops: 10000,
            max_network_mbps: 1000
          },
          optimization_algorithms: ['gradient_descent', 'genetic_algorithm', 'simulated_annealing'],
          learning_enabled: true,
          rollback_enabled: true,
          safety_checks: true,
          notification_enabled: true
        }
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
      setOptimizing(false)
    }
  }

  const runOptimization = async (engineId: string) => {
    setOptimizing(true)
    try {
      const response = await fetch(`/api/v1/scan-intelligence/optimization/engines/${engineId}/optimize`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start optimization')
      }

      toast({
        title: "Success",
        description: "Optimization process started successfully",
      })

      await fetchEngines()
      await fetchMetrics()
    } catch (error) {
      console.error('Error running optimization:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start optimization",
        variant: "destructive"
      })
    } finally {
      setOptimizing(false)
    }
  }

  const analyzePerformance = async () => {
    setAnalyzing(true)
    try {
      const response = await fetch('/api/v1/scan-intelligence/optimization/analyze', {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start performance analysis')
      }

      toast({
        title: "Success",
        description: "Performance analysis started successfully",
      })

      await fetchRecommendations()
    } catch (error) {
      console.error('Error analyzing performance:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start analysis",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const applyRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch(`/api/v1/scan-intelligence/optimization/recommendations/${recommendationId}/apply`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to apply recommendation')
      }

      toast({
        title: "Success",
        description: "Recommendation applied successfully",
      })

      await fetchRecommendations()
      await fetchEngines()
    } catch (error) {
      console.error('Error applying recommendation:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply recommendation",
        variant: "destructive"
      })
    }
  }

  const toggleEngineStatus = async (engineId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const response = await fetch(`/api/v1/scan-intelligence/optimization/engines/${engineId}/status`, {
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

  const updateAutoTuning = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/optimization/auto-tuning', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to update auto-tuning')
      }

      setAutoOptimization(enabled)
      toast({
        title: "Success",
        description: `Auto-optimization ${enabled ? 'enabled' : 'disabled'} successfully`,
      })

      await fetchAutoTuningConfig()
    } catch (error) {
      console.error('Error updating auto-tuning:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update auto-tuning",
        variant: "destructive"
      })
    }
  }

  // Real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    if (!realTimeUpdates) return

    const ws = new WebSocket(`wss://${window.location.host}/api/v1/scan-intelligence/optimization/ws`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'optimization_started') {
        setEngines(prev => prev.map(engine => 
          engine.engine_id === data.engine_id ? { ...engine, status: 'optimizing' } : engine
        ))
      } else if (data.type === 'optimization_completed') {
        setEngines(prev => prev.map(engine => 
          engine.engine_id === data.engine_id ? { ...engine, ...data.updates } : engine
        ))
        toast({
          title: "Optimization Completed",
          description: `${data.engine_name} optimization completed with ${data.improvement}% improvement`,
        })
      } else if (data.type === 'recommendation_generated') {
        setRecommendations(prev => [data.recommendation, ...prev])
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
        fetchResourceProfiles(),
        fetchRecommendations(),
        fetchMetrics(),
        fetchAutoTuningConfig()
      ])
      setLoading(false)
    }

    loadData()
  }, [fetchEngines, fetchResourceProfiles, fetchRecommendations, fetchMetrics, fetchAutoTuningConfig])

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
  const filteredEngines = useMemo(() => {
    let filtered = engines

    if (searchTerm) {
      filtered = filtered.filter(engine => 
        engine.engine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        engine.optimization_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(engine => engine.optimization_type === selectedType)
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof OptimizationEngine]
      const bValue = b[sortBy as keyof OptimizationEngine]
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [engines, searchTerm, selectedType, sortBy, sortOrder])

  const chartData = useMemo(() => {
    if (!metrics) return []
    return metrics.performance_trends.throughput_trend.map((value, index) => ({
      time: index,
      throughput: value,
      latency: metrics.performance_trends.latency_trend[index],
      efficiency: metrics.performance_trends.efficiency_trend[index],
      cost: metrics.performance_trends.cost_trend[index]
    }))
  }, [metrics])

  const utilizationData = useMemo(() => {
    if (!metrics) return []
    return Object.entries(metrics.resource_utilization.cpu_utilization_by_component).map(([component, usage]) => ({
      component,
      cpu: usage,
      memory: metrics.resource_utilization.memory_usage_by_component[component] || 0,
      disk: metrics.resource_utilization.disk_io_by_operation[component] || 0,
      network: metrics.resource_utilization.network_usage_by_service[component] || 0
    }))
  }, [metrics])

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'optimizing': return 'bg-blue-500'
      case 'monitoring': return 'bg-yellow-500'
      case 'learning': return 'bg-purple-500'
      case 'error': return 'bg-red-500'
      case 'inactive': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = OPTIMIZATION_TYPES.find(t => t.value === type)
    return typeConfig?.icon || Zap
  }

  const getTypeColor = (type: string) => {
    const typeConfig = OPTIMIZATION_TYPES.find(t => t.value === type)
    return typeConfig?.color || 'gray'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
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

  const calculateImprovement = (baseline: number, current: number) => {
    if (baseline === 0) return 0
    return ((current - baseline) / baseline) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading performance optimization manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Optimization Manager</h2>
          <p className="text-muted-foreground">
            Intelligent performance optimization with resource management and adaptive tuning
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
              id="auto-optimization"
              checked={autoOptimization}
              onCheckedChange={updateAutoTuning}
            />
            <Label htmlFor="auto-optimization" className="text-sm">Auto-optimize</Label>
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
              <CardTitle className="text-sm font-medium">Active Engines</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.optimization_metrics.active_engines}</div>
              <p className="text-xs text-muted-foreground">
                {engines.length} total engines
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Improvement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(metrics.optimization_metrics.avg_improvement)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.optimization_metrics.successful_optimizations} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.optimization_metrics.cost_savings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(metrics.optimization_metrics.efficiency_gain)} efficiency gain
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Utilization</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(metrics.system_metrics.total_cpu_usage)}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(metrics.system_metrics.total_memory_usage)} memory usage
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
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
                <Label htmlFor="type-select">Optimization Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {OPTIMIZATION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-range">Time Range</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_RANGES.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button 
                onClick={analyzePerformance}
                disabled={analyzing}
                variant="outline"
              >
                {analyzing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
                Analyze Performance
              </Button>
              <Button 
                onClick={() => runOptimization('all')}
                disabled={optimizing}
              >
                {optimizing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Rocket className="h-4 w-4 mr-2" />}
                Optimize All
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
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tuning">Auto-Tuning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>System performance metrics over time</CardDescription>
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
                      dataKey="efficiency" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Efficiency"
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
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Current resource usage by component</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="component" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="cpu" fill="#22c55e" name="CPU %" />
                    <Bar dataKey="memory" fill="#3b82f6" name="Memory %" />
                    <Bar dataKey="disk" fill="#f59e0b" name="Disk I/O" />
                    <Bar dataKey="network" fill="#ef4444" name="Network" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system performance and health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Active Scans</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.system_metrics.active_scans}</div>
                    <div className="text-xs text-muted-foreground">
                      {metrics.system_metrics.queued_scans} queued
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.system_metrics.completed_scans}</div>
                    <div className="text-xs text-muted-foreground">
                      {metrics.system_metrics.failed_scans} failed
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Recommendations</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.optimization_metrics.recommendations_generated}</div>
                    <div className="text-xs text-muted-foreground">
                      {metrics.optimization_metrics.recommendations_applied} applied
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Opportunities</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.optimization_opportunities.identified_bottlenecks.length}</div>
                    <div className="text-xs text-muted-foreground">
                      {metrics.optimization_opportunities.quick_wins.length} quick wins
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimization Opportunities */}
          {metrics && metrics.optimization_opportunities.quick_wins.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Optimization Wins</CardTitle>
                <CardDescription>Immediate optimization opportunities with high impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.optimization_opportunities.quick_wins.slice(0, 5).map((opportunity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{opportunity}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="engines" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search engines..."
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

          {/* Engines Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEngines.map(engine => {
              const TypeIcon = getTypeIcon(engine.optimization_type)
              const isExpanded = expandedEngine === engine.engine_id
              
              return (
                <Card key={engine.engine_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${getTypeColor(engine.optimization_type)}-100`}>
                          <TypeIcon className={`h-5 w-5 text-${getTypeColor(engine.optimization_type)}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{engine.engine_name}</CardTitle>
                          <CardDescription className="text-sm">
                            {OPTIMIZATION_TYPES.find(t => t.value === engine.optimization_type)?.label}
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
                    {/* Performance Comparison */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">CPU Utilization</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatPercentage(engine.baseline_performance.cpu_utilization)}
                          </span>
                          <span className="text-xs">→</span>
                          <span className="text-xs font-medium">
                            {formatPercentage(engine.current_performance.cpu_utilization)}
                          </span>
                          <span className={cn(
                            "text-xs",
                            calculateImprovement(engine.baseline_performance.cpu_utilization, engine.current_performance.cpu_utilization) < 0 ? "text-green-600" : "text-red-600"
                          )}>
                            ({formatPercentage(Math.abs(calculateImprovement(engine.baseline_performance.cpu_utilization, engine.current_performance.cpu_utilization)))})
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Scan Throughput</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {engine.baseline_performance.scan_throughput.toFixed(1)}
                          </span>
                          <span className="text-xs">→</span>
                          <span className="text-xs font-medium">
                            {engine.current_performance.scan_throughput.toFixed(1)}
                          </span>
                          <span className={cn(
                            "text-xs",
                            calculateImprovement(engine.baseline_performance.scan_throughput, engine.current_performance.scan_throughput) > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            ({formatPercentage(Math.abs(calculateImprovement(engine.baseline_performance.scan_throughput, engine.current_performance.scan_throughput)))})
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Cost per Scan</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            ${engine.baseline_performance.cost_per_scan.toFixed(2)}
                          </span>
                          <span className="text-xs">→</span>
                          <span className="text-xs font-medium">
                            ${engine.current_performance.cost_per_scan.toFixed(2)}
                          </span>
                          <span className={cn(
                            "text-xs",
                            calculateImprovement(engine.baseline_performance.cost_per_scan, engine.current_performance.cost_per_scan) < 0 ? "text-green-600" : "text-red-600"
                          )}>
                            ({formatPercentage(Math.abs(calculateImprovement(engine.baseline_performance.cost_per_scan, engine.current_performance.cost_per_scan)))})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Strategy and Goals */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Strategy & Goals</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Strategy:</span>
                          <span>{engine.optimization_strategy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target CPU:</span>
                          <span>{formatPercentage(engine.optimization_goals.target_cpu_utilization)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Cost Reduction:</span>
                          <span>{formatPercentage(engine.optimization_goals.target_cost_reduction)}</span>
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
                              <span>Auto Optimize:</span>
                              <span>{engine.configuration.auto_optimize ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Frequency:</span>
                              <span>{engine.configuration.optimization_frequency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Learning:</span>
                              <span>{engine.configuration.learning_enabled ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Safety Checks:</span>
                              <span>{engine.configuration.safety_checks ? 'Enabled' : 'Disabled'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Recent Optimizations */}
                        {engine.optimization_history.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Optimizations</p>
                            <div className="space-y-1">
                              {engine.optimization_history.slice(0, 3).map(record => (
                                <div key={record.id} className="flex justify-between text-xs">
                                  <span>{record.optimization_type}</span>
                                  <span className={cn(
                                    record.overall_improvement > 0 ? "text-green-600" : "text-red-600"
                                  )}>
                                    {record.overall_improvement > 0 ? '+' : ''}{record.overall_improvement.toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {engine.recommendations.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Recommendations</p>
                            <div className="space-y-1">
                              {engine.recommendations.slice(0, 2).map(rec => (
                                <div key={rec.id} className="flex items-start gap-2">
                                  <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-muted-foreground">{rec.title}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleEngineStatus(engine.engine_id, engine.status)}
                        disabled={engine.status === 'optimizing'}
                        className="flex-1"
                      >
                        {engine.status === 'active' ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                        {engine.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runOptimization(engine.engine_id)}
                        disabled={optimizing || engine.status !== 'active'}
                      >
                        <Rocket className="h-3 w-3 mr-1" />
                        Optimize
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

          {filteredEngines.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Optimization Engines Found</h3>
                <p className="text-muted-foreground mb-4">
                  {engines.length === 0 
                    ? "Create your first optimization engine to start improving performance"
                    : "No engines match your current filters"
                  }
                </p>
                <Button onClick={() => setShowCreateEngineModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Optimization Engine
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {/* Recommendations List */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>AI-generated recommendations for performance improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map(rec => {
                  const TypeIcon = RECOMMENDATION_TYPES.find(t => t.value === rec.recommendation_type)?.icon || Lightbulb
                  
                  return (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <TypeIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{rec.title}</h4>
                              <Badge className={cn("text-xs", getPriorityColor(rec.priority))}>
                                {rec.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {rec.recommendation_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">Expected Improvement:</span>
                                <div className="space-y-1">
                                  {Object.entries(rec.expected_improvement).slice(0, 2).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium">{key}:</span> {typeof value === 'number' ? formatPercentage(value) : value}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Implementation:</span>
                                <div className="space-y-1">
                                  <div><span className="font-medium">Effort:</span> {rec.implementation_effort}</div>
                                  <div><span className="font-medium">Risk:</span> {rec.risk_level}</div>
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Impact:</span>
                                <div className="space-y-1">
                                  <div><span className="font-medium">Performance:</span> {formatPercentage(rec.estimated_impact.performance_gain)}</div>
                                  <div><span className="font-medium">Cost:</span> {formatPercentage(rec.estimated_impact.cost_reduction)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right text-xs">
                            <div className="font-medium">Confidence: {formatPercentage(rec.confidence_level)}</div>
                            <div className="text-muted-foreground">
                              {rec.auto_applicable ? 'Auto-applicable' : 'Manual review required'}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyRecommendation(rec.id)}
                            disabled={!rec.auto_applicable || rec.status !== 'pending'}
                          >
                            {rec.auto_applicable ? 'Apply' : 'Review'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {recommendations.length === 0 && (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Recommendations Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Run performance analysis to generate optimization recommendations
                  </p>
                  <Button onClick={analyzePerformance} disabled={analyzing}>
                    {analyzing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
                    Analyze Performance
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {/* Resource Profiles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {resourceProfiles.map(profile => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{profile.profile_name}</CardTitle>
                      <CardDescription>{RESOURCE_PROFILES.find(p => p.value === profile.profile_type)?.label}</CardDescription>
                    </div>
                    <Badge className={cn(
                      profile.status === 'active' ? 'bg-green-500' :
                      profile.status === 'experimental' ? 'bg-yellow-500' :
                      profile.status === 'testing' ? 'bg-blue-500' : 'bg-gray-500'
                    )}>
                      {profile.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Resource Allocation */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resource Allocation</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>CPU: {profile.resource_allocation.cpu_cores} cores</div>
                      <div>Memory: {profile.resource_allocation.memory_gb} GB</div>
                      <div>Storage: {profile.resource_allocation.disk_space_gb} GB</div>
                      <div>Network: {profile.resource_allocation.network_bandwidth_mbps} Mbps</div>
                    </div>
                  </div>

                  {/* Performance Characteristics */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Performance</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Max Concurrent Ops:</span>
                        <span>{profile.performance_characteristics.max_concurrent_operations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Processing Time:</span>
                        <span>{profile.performance_characteristics.avg_processing_time.toFixed(1)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Utilization:</span>
                        <span>{formatPercentage(profile.performance_characteristics.resource_utilization_target)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cost Metrics */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cost Analysis</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Hourly Cost:</span>
                        <span>${profile.cost_metrics.hourly_cost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost per Operation:</span>
                        <span>${profile.cost_metrics.cost_per_operation.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency Ratio:</span>
                        <span>{profile.cost_metrics.efficiency_ratio.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Statistics */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Usage Statistics</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Total Usage:</span>
                        <span>{profile.usage_statistics.total_usage_hours.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operations Processed:</span>
                        <span>{profile.usage_statistics.operations_processed.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Utilization:</span>
                        <span>{formatPercentage(profile.usage_statistics.avg_utilization)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Optimization Suggestions */}
                  {profile.optimization_suggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Suggestions</p>
                      <div className="space-y-1">
                        {profile.optimization_suggestions.slice(0, 2).map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {resourceProfiles.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Resource Profiles Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create resource profiles to optimize resource allocation for different workloads.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Resource Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics Content */}
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Comprehensive performance analytics and optimization insights coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tuning" className="space-y-4">
          {/* Auto-Tuning Configuration */}
          <Card>
            <CardContent className="text-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Auto-Tuning Configuration</h3>
              <p className="text-muted-foreground">
                Advanced auto-tuning settings and configuration coming soon...
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
                  <CardTitle>Create Optimization Engine</CardTitle>
                  <CardDescription>Configure a new performance optimization engine</CardDescription>
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
                    <Label htmlFor="optimization-type">Optimization Type</Label>
                    <Select
                      value={newEngine.optimization_type}
                      onValueChange={(value: any) => setNewEngine(prev => ({ ...prev, optimization_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPTIMIZATION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="optimization-strategy">Strategy</Label>
                    <Select
                      value={newEngine.optimization_strategy}
                      onValueChange={(value: any) => setNewEngine(prev => ({ ...prev, optimization_strategy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPTIMIZATION_STRATEGIES.map(strategy => (
                          <SelectItem key={strategy.value} value={strategy.value}>
                            {strategy.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Optimization Goals */}
              <div className="space-y-4">
                <h4 className="font-medium">Optimization Goals</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-cpu">Target CPU Utilization: {newEngine.optimization_goals.target_cpu_utilization}%</Label>
                    <Slider
                      id="target-cpu"
                      min={50}
                      max={95}
                      step={5}
                      value={[newEngine.optimization_goals.target_cpu_utilization]}
                      onValueChange={(value) => setNewEngine(prev => ({
                        ...prev,
                        optimization_goals: {
                          ...prev.optimization_goals,
                          target_cpu_utilization: value[0]
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-memory">Target Memory Usage: {newEngine.optimization_goals.target_memory_usage}%</Label>
                    <Slider
                      id="target-memory"
                      min={50}
                      max={90}
                      step={5}
                      value={[newEngine.optimization_goals.target_memory_usage]}
                      onValueChange={(value) => setNewEngine(prev => ({
                        ...prev,
                        optimization_goals: {
                          ...prev.optimization_goals,
                          target_memory_usage: value[0]
                        }
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost-reduction">Target Cost Reduction: {newEngine.optimization_goals.target_cost_reduction}%</Label>
                    <Slider
                      id="cost-reduction"
                      min={5}
                      max={50}
                      step={5}
                      value={[newEngine.optimization_goals.target_cost_reduction]}
                      onValueChange={(value) => setNewEngine(prev => ({
                        ...prev,
                        optimization_goals: {
                          ...prev.optimization_goals,
                          target_cost_reduction: value[0]
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="efficiency-gain">Target Efficiency Gain: {newEngine.optimization_goals.target_efficiency_gain}%</Label>
                    <Slider
                      id="efficiency-gain"
                      min={5}
                      max={40}
                      step={5}
                      value={[newEngine.optimization_goals.target_efficiency_gain]}
                      onValueChange={(value) => setNewEngine(prev => ({
                        ...prev,
                        optimization_goals: {
                          ...prev.optimization_goals,
                          target_efficiency_gain: value[0]
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
                    <Label htmlFor="auto-optimize">Auto Optimization</Label>
                    <Switch
                      id="auto-optimize"
                      checked={newEngine.configuration.auto_optimize}
                      onCheckedChange={(checked) => setNewEngine(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          auto_optimize: checked
                        }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="learning-enabled">Machine Learning</Label>
                    <Switch
                      id="learning-enabled"
                      checked={newEngine.configuration.learning_enabled}
                      onCheckedChange={(checked) => setNewEngine(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          learning_enabled: checked
                        }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rollback-enabled">Rollback Protection</Label>
                    <Switch
                      id="rollback-enabled"
                      checked={newEngine.configuration.rollback_enabled}
                      onCheckedChange={(checked) => setNewEngine(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          rollback_enabled: checked
                        }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="safety-checks">Safety Checks</Label>
                    <Switch
                      id="safety-checks"
                      checked={newEngine.configuration.safety_checks}
                      onCheckedChange={(checked) => setNewEngine(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          safety_checks: checked
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
                <Button onClick={createEngine} disabled={optimizing}>
                  {optimizing ? (
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