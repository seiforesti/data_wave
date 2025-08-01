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
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, TrendingUp, Brain, Zap, Settings, Activity, Target, BarChart3, Shield, Cpu, Database, Network, Clock, CheckCircle, XCircle, AlertCircle, Play, Pause, Stop, RefreshCw, Download, Upload, Filter, Search, Eye, EyeOff, MoreHorizontal, ChevronDown, ChevronUp, Plus, Minus, Edit, Trash2, Save, X, ExternalLink, History, Bell, Lightbulb, Rocket } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Enhanced Types for Intelligence Engine
interface IntelligenceEngine {
  id: string
  engine_id: string
  engine_name: string
  intelligence_type: 'predictive_analytics' | 'performance_optimization' | 'anomaly_detection' | 'pattern_recognition' | 'resource_optimization' | 'adaptive_learning' | 'behavioral_analysis' | 'cross_system_correlation'
  status: 'initializing' | 'training' | 'active' | 'paused' | 'maintenance' | 'error' | 'deprecated'
  configuration: {
    enable_predictive_analytics: boolean
    enable_anomaly_detection: boolean
    enable_pattern_recognition: boolean
    enable_performance_optimization: boolean
    confidence_threshold: number
    anomaly_threshold: number
    pattern_strength_threshold: number
    max_model_cache_size: number
    model_update_interval: number
    learning_rate: number
    batch_size: number
    feature_selection_method: string
    optimization_strategy: string
    auto_scaling_enabled: boolean
    real_time_processing: boolean
  }
  optimization_strategy: 'performance_first' | 'accuracy_first' | 'resource_efficient' | 'cost_optimized' | 'balanced' | 'adaptive' | 'custom'
  intelligence_scope: 'single_scan' | 'scan_group' | 'data_source' | 'system_wide' | 'cross_system' | 'global'
  learning_mode: 'supervised' | 'unsupervised' | 'semi_supervised' | 'reinforcement' | 'transfer' | 'federated' | 'online' | 'batch'
  version: string
  last_trained: string | null
  last_updated: string
  accuracy_score: number | null
  performance_score: number | null
  efficiency_score: number | null
  reliability_score: number | null
  cpu_requirement: number | null
  memory_requirement: number | null
  storage_requirement: number | null
  ai_models: AIModel[]
  optimization_records: OptimizationRecord[]
  created_at: string
  updated_at: string
  created_by: string
  custom_properties: Record<string, any>
}

interface AIModel {
  id: string
  model_id: string
  model_name: string
  model_type: 'neural_network' | 'random_forest' | 'gradient_boosting' | 'svm' | 'clustering' | 'transformer' | 'ensemble' | 'reinforcement_learning'
  model_version: string
  status: 'training' | 'trained' | 'deployed' | 'active' | 'deprecated' | 'failed' | 'archived'
  accuracy_score: number | null
  precision_score: number | null
  recall_score: number | null
  f1_score: number | null
  training_data_size: number
  feature_count: number
  model_size_mb: number
  inference_time_ms: number
  last_trained: string
  deployment_date: string | null
  usage_count: number
  success_rate: number
  error_rate: number
  model_parameters: Record<string, any>
  hyperparameters: Record<string, any>
  feature_importance: Record<string, number>
  training_metrics: Record<string, any>
  validation_metrics: Record<string, any>
  production_metrics: Record<string, any>
}

interface OptimizationRecord {
  id: string
  optimization_id: string
  optimization_type: 'performance' | 'resource' | 'cost' | 'accuracy' | 'throughput' | 'latency' | 'scalability'
  target_metric: string
  baseline_value: number
  optimized_value: number
  improvement_percentage: number
  optimization_strategy: string
  parameters_adjusted: Record<string, any>
  execution_time_seconds: number
  resource_impact: Record<string, any>
  success: boolean
  created_at: string
  metadata: Record<string, any>
}

interface IntelligenceMetrics {
  total_engines: number
  active_engines: number
  total_models: number
  active_models: number
  total_predictions: number
  successful_predictions: number
  average_accuracy: number
  average_inference_time: number
  resource_utilization: {
    cpu_usage: number
    memory_usage: number
    storage_usage: number
    network_usage: number
  }
  performance_trends: {
    accuracy_trend: number[]
    latency_trend: number[]
    throughput_trend: number[]
    error_rate_trend: number[]
  }
  anomaly_detections: number
  pattern_recognitions: number
  optimizations_performed: number
  cost_savings: number
}

interface PredictionResult {
  prediction_id: string
  prediction_type: string
  prediction_value: any
  confidence_score: number
  model_version: string
  inference_time_ms: number
  metadata: Record<string, any>
  created_at: string
}

const INTELLIGENCE_TYPES = [
  { value: 'predictive_analytics', label: 'Predictive Analytics', icon: TrendingUp, color: 'blue' },
  { value: 'performance_optimization', label: 'Performance Optimization', icon: Zap, color: 'green' },
  { value: 'anomaly_detection', label: 'Anomaly Detection', icon: AlertTriangle, color: 'red' },
  { value: 'pattern_recognition', label: 'Pattern Recognition', icon: Target, color: 'purple' },
  { value: 'resource_optimization', label: 'Resource Optimization', icon: Cpu, color: 'orange' },
  { value: 'adaptive_learning', label: 'Adaptive Learning', icon: Brain, color: 'indigo' },
  { value: 'behavioral_analysis', label: 'Behavioral Analysis', icon: Activity, color: 'pink' },
  { value: 'cross_system_correlation', label: 'Cross-System Correlation', icon: Network, color: 'cyan' }
]

const OPTIMIZATION_STRATEGIES = [
  { value: 'performance_first', label: 'Performance First', description: 'Prioritize execution speed and responsiveness' },
  { value: 'accuracy_first', label: 'Accuracy First', description: 'Maximize prediction accuracy and reliability' },
  { value: 'resource_efficient', label: 'Resource Efficient', description: 'Minimize resource consumption' },
  { value: 'cost_optimized', label: 'Cost Optimized', description: 'Reduce operational costs' },
  { value: 'balanced', label: 'Balanced', description: 'Balance all optimization factors' },
  { value: 'adaptive', label: 'Adaptive', description: 'Dynamically adjust strategy based on conditions' },
  { value: 'custom', label: 'Custom', description: 'User-defined optimization criteria' }
]

const LEARNING_MODES = [
  { value: 'supervised', label: 'Supervised Learning', description: 'Learn from labeled training data' },
  { value: 'unsupervised', label: 'Unsupervised Learning', description: 'Find patterns in unlabeled data' },
  { value: 'semi_supervised', label: 'Semi-Supervised Learning', description: 'Combine labeled and unlabeled data' },
  { value: 'reinforcement', label: 'Reinforcement Learning', description: 'Learn through interaction and rewards' },
  { value: 'transfer', label: 'Transfer Learning', description: 'Apply knowledge from related domains' },
  { value: 'federated', label: 'Federated Learning', description: 'Distributed learning across multiple sources' },
  { value: 'online', label: 'Online Learning', description: 'Continuous learning from streaming data' },
  { value: 'batch', label: 'Batch Learning', description: 'Learn from fixed datasets in batches' }
]

const INTELLIGENCE_SCOPES = [
  { value: 'single_scan', label: 'Single Scan', description: 'Apply to individual scan operations' },
  { value: 'scan_group', label: 'Scan Group', description: 'Apply to related scan groups' },
  { value: 'data_source', label: 'Data Source', description: 'Apply to entire data sources' },
  { value: 'system_wide', label: 'System Wide', description: 'Apply across the entire system' },
  { value: 'cross_system', label: 'Cross System', description: 'Apply across multiple systems' },
  { value: 'global', label: 'Global', description: 'Apply globally across all systems' }
]

export default function AdvancedScanIntelligenceEngine() {
  // State management
  const [engines, setEngines] = useState<IntelligenceEngine[]>([])
  const [selectedEngine, setSelectedEngine] = useState<IntelligenceEngine | null>(null)
  const [metrics, setMetrics] = useState<IntelligenceMetrics | null>(null)
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [training, setTraining] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [expandedEngine, setExpandedEngine] = useState<string | null>(null)

  // Refs for real-time updates
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Form states
  const [newEngine, setNewEngine] = useState({
    engine_name: '',
    intelligence_type: 'predictive_analytics' as const,
    optimization_strategy: 'balanced' as const,
    intelligence_scope: 'system_wide' as const,
    learning_mode: 'supervised' as const,
    configuration: {
      enable_predictive_analytics: true,
      enable_anomaly_detection: true,
      enable_pattern_recognition: true,
      enable_performance_optimization: true,
      confidence_threshold: 0.7,
      anomaly_threshold: 0.8,
      pattern_strength_threshold: 0.6,
      max_model_cache_size: 100,
      model_update_interval: 3600,
      learning_rate: 0.001,
      batch_size: 32,
      feature_selection_method: 'recursive_feature_elimination',
      optimization_strategy: 'adaptive',
      auto_scaling_enabled: true,
      real_time_processing: true
    },
    custom_properties: {}
  })

  // API functions
  const fetchEngines = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/engines')
      if (!response.ok) throw new Error('Failed to fetch engines')
      const data = await response.json()
      setEngines(data.engines || [])
    } catch (error) {
      console.error('Error fetching engines:', error)
      toast({
        title: "Error",
        description: "Failed to fetch intelligence engines",
        variant: "destructive"
      })
    }
  }, [])

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }, [])

  const fetchPredictions = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/predictions?limit=100')
      if (!response.ok) throw new Error('Failed to fetch predictions')
      const data = await response.json()
      setPredictions(data.predictions || [])
    } catch (error) {
      console.error('Error fetching predictions:', error)
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

    setCreating(true)
    try {
      const response = await fetch('/api/v1/scan-intelligence/engines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEngine,
          auto_train: true
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create engine')
      }

      const data = await response.json()
      
      toast({
        title: "Success",
        description: `Intelligence engine "${newEngine.engine_name}" created successfully`,
      })

      setShowCreateModal(false)
      setNewEngine({
        engine_name: '',
        intelligence_type: 'predictive_analytics',
        optimization_strategy: 'balanced',
        intelligence_scope: 'system_wide',
        learning_mode: 'supervised',
        configuration: {
          enable_predictive_analytics: true,
          enable_anomaly_detection: true,
          enable_pattern_recognition: true,
          enable_performance_optimization: true,
          confidence_threshold: 0.7,
          anomaly_threshold: 0.8,
          pattern_strength_threshold: 0.6,
          max_model_cache_size: 100,
          model_update_interval: 3600,
          learning_rate: 0.001,
          batch_size: 32,
          feature_selection_method: 'recursive_feature_elimination',
          optimization_strategy: 'adaptive',
          auto_scaling_enabled: true,
          real_time_processing: true
        },
        custom_properties: {}
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
      setCreating(false)
    }
  }

  const trainEngine = async (engineId: string) => {
    setTraining(true)
    try {
      const response = await fetch(`/api/v1/scan-intelligence/engines/${engineId}/train`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start training')
      }

      toast({
        title: "Success",
        description: "Model training started successfully",
      })

      await fetchEngines()
    } catch (error) {
      console.error('Error training engine:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start training",
        variant: "destructive"
      })
    } finally {
      setTraining(false)
    }
  }

  const optimizeEngine = async (engineId: string) => {
    setOptimizing(true)
    try {
      const response = await fetch(`/api/v1/scan-intelligence/engines/${engineId}/optimize`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start optimization')
      }

      toast({
        title: "Success",
        description: "Engine optimization started successfully",
      })

      await fetchEngines()
    } catch (error) {
      console.error('Error optimizing engine:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start optimization",
        variant: "destructive"
      })
    } finally {
      setOptimizing(false)
    }
  }

  const toggleEngineStatus = async (engineId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active'
      const response = await fetch(`/api/v1/scan-intelligence/engines/${engineId}/status`, {
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
        description: `Engine ${newStatus === 'active' ? 'activated' : 'paused'} successfully`,
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

  const deleteEngine = async (engineId: string) => {
    if (!confirm('Are you sure you want to delete this engine? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/v1/scan-intelligence/engines/${engineId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to delete engine')
      }

      toast({
        title: "Success",
        description: "Engine deleted successfully",
      })

      setSelectedEngine(null)
      await fetchEngines()
    } catch (error) {
      console.error('Error deleting engine:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete engine",
        variant: "destructive"
      })
    }
  }

  // Real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    if (!realTimeUpdates) return

    // WebSocket connection for real-time updates
    const ws = new WebSocket(`wss://${window.location.host}/api/v1/scan-intelligence/ws`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'engine_update') {
        setEngines(prev => prev.map(engine => 
          engine.engine_id === data.engine_id ? { ...engine, ...data.updates } : engine
        ))
      } else if (data.type === 'metrics_update') {
        setMetrics(data.metrics)
      } else if (data.type === 'prediction_result') {
        setPredictions(prev => [data.prediction, ...prev.slice(0, 99)])
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    wsRef.current = ws

    // Fallback polling
    intervalRef.current = setInterval(() => {
      fetchMetrics()
    }, 30000)

    return () => {
      ws.close()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [realTimeUpdates, fetchMetrics])

  // Effects
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchEngines(),
        fetchMetrics(),
        fetchPredictions()
      ])
      setLoading(false)
    }

    loadData()
  }, [fetchEngines, fetchMetrics, fetchPredictions])

  useEffect(() => {
    return setupRealTimeUpdates()
  }, [setupRealTimeUpdates])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  // Filtered and sorted engines
  const filteredEngines = useMemo(() => {
    let filtered = engines

    if (searchTerm) {
      filtered = filtered.filter(engine => 
        engine.engine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        engine.intelligence_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(engine => engine.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(engine => engine.intelligence_type === typeFilter)
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof IntelligenceEngine]
      const bValue = b[sortBy as keyof IntelligenceEngine]
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [engines, searchTerm, statusFilter, typeFilter, sortBy, sortOrder])

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'training': return 'bg-blue-500'
      case 'paused': return 'bg-yellow-500'
      case 'maintenance': return 'bg-orange-500'
      case 'error': return 'bg-red-500'
      case 'deprecated': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = INTELLIGENCE_TYPES.find(t => t.value === type)
    return typeConfig?.icon || Brain
  }

  const getTypeColor = (type: string) => {
    const typeConfig = INTELLIGENCE_TYPES.find(t => t.value === type)
    return typeConfig?.color || 'gray'
  }

  const formatScore = (score: number | null) => {
    if (score === null) return 'N/A'
    return `${(score * 100).toFixed(1)}%`
  }

  const formatBytes = (bytes: number | null) => {
    if (bytes === null) return 'N/A'
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
          <p className="text-muted-foreground">Loading intelligence engines...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Scan Intelligence Engine</h2>
          <p className="text-muted-foreground">
            AI-powered scan intelligence with predictive analytics, optimization, and real-time monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="real-time-updates"
              checked={realTimeUpdates}
              onCheckedChange={setRealTimeUpdates}
            />
            <Label htmlFor="real-time-updates" className="text-sm">Real-time updates</Label>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
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
              <CardTitle className="text-sm font-medium">Total Engines</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_engines}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.active_engines} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Models</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_models}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.active_models} deployed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Predictions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_predictions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {formatScore(metrics.successful_predictions / metrics.total_predictions)} success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatScore(metrics.average_accuracy)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.average_inference_time.toFixed(1)}ms avg inference
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engines">Engines</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Performance Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Real-time intelligence system performance</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.performance_trends.accuracy_trend.map((value, index) => ({
                      time: index,
                      accuracy: value,
                      latency: metrics.performance_trends.latency_trend[index],
                      throughput: metrics.performance_trends.throughput_trend[index]
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="accuracy" stroke="#8884d8" name="Accuracy %" />
                      <Line type="monotone" dataKey="latency" stroke="#82ca9d" name="Latency (ms)" />
                      <Line type="monotone" dataKey="throughput" stroke="#ffc658" name="Throughput" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Resource Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Current system resource usage</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CPU Usage</span>
                        <span>{metrics.resource_utilization.cpu_usage.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.resource_utilization.cpu_usage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Memory Usage</span>
                        <span>{metrics.resource_utilization.memory_usage.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.resource_utilization.memory_usage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Storage Usage</span>
                        <span>{metrics.resource_utilization.storage_usage.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.resource_utilization.storage_usage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Network Usage</span>
                        <span>{metrics.resource_utilization.network_usage.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.resource_utilization.network_usage} className="h-2" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Intelligence Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Intelligence Activity Summary</CardTitle>
              <CardDescription>Recent intelligence operations and results</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Anomaly Detections</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.anomaly_detections}</div>
                    <p className="text-xs text-muted-foreground">in the last 24 hours</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Pattern Recognitions</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.pattern_recognitions}</div>
                    <p className="text-xs text-muted-foreground">patterns identified</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Optimizations</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.optimizations_performed}</div>
                    <p className="text-xs text-muted-foreground">${metrics.cost_savings.toLocaleString()} saved</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engines" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {INTELLIGENCE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Engines Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEngines.map(engine => {
              const TypeIcon = getTypeIcon(engine.intelligence_type)
              const isExpanded = expandedEngine === engine.engine_id
              
              return (
                <Card key={engine.engine_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${getTypeColor(engine.intelligence_type)}-100`}>
                          <TypeIcon className={`h-5 w-5 text-${getTypeColor(engine.intelligence_type)}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{engine.engine_name}</CardTitle>
                          <CardDescription className="text-sm">
                            {INTELLIGENCE_TYPES.find(t => t.value === engine.intelligence_type)?.label}
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                        <p className="text-sm font-medium">{formatScore(engine.accuracy_score)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Performance</p>
                        <p className="text-sm font-medium">{formatScore(engine.performance_score)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Efficiency</p>
                        <p className="text-sm font-medium">{formatScore(engine.efficiency_score)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Reliability</p>
                        <p className="text-sm font-medium">{formatScore(engine.reliability_score)}</p>
                      </div>
                    </div>

                    {/* Resource Requirements */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resources</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          <span>{engine.cpu_requirement?.toFixed(1) || 'N/A'} CPU</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          <span>{formatBytes((engine.memory_requirement || 0) * 1024 * 1024 * 1024)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Network className="h-3 w-3" />
                          <span>{formatBytes((engine.storage_requirement || 0) * 1024 * 1024 * 1024)}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Models Summary */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AI Models</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>{engine.ai_models.length} models</span>
                        <span className="text-muted-foreground">
                          {engine.ai_models.filter(m => m.status === 'active').length} active
                        </span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="pt-4 border-t space-y-4">
                        {/* Configuration Details */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Configuration</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Strategy:</span>
                              <span>{engine.optimization_strategy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Scope:</span>
                              <span>{engine.intelligence_scope}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Learning:</span>
                              <span>{engine.learning_mode}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Version:</span>
                              <span>{engine.version}</span>
                            </div>
                          </div>
                        </div>

                        {/* Last Training */}
                        {engine.last_trained && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Training</p>
                            <p className="text-xs">{new Date(engine.last_trained).toLocaleString()}</p>
                          </div>
                        )}

                        {/* Recent Optimizations */}
                        {engine.optimization_records.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Optimizations</p>
                            <div className="space-y-1">
                              {engine.optimization_records.slice(0, 3).map(record => (
                                <div key={record.id} className="flex justify-between text-xs">
                                  <span>{record.optimization_type}</span>
                                  <span className="text-green-600">+{record.improvement_percentage.toFixed(1)}%</span>
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
                        disabled={engine.status === 'training' || engine.status === 'maintenance'}
                        className="flex-1"
                      >
                        {engine.status === 'active' ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                        {engine.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => trainEngine(engine.engine_id)}
                        disabled={training || engine.status !== 'active'}
                      >
                        <RefreshCw className={cn("h-3 w-3 mr-1", training && "animate-spin")} />
                        Train
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => optimizeEngine(engine.engine_id)}
                        disabled={optimizing || engine.status !== 'active'}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Optimize
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteEngine(engine.engine_id)}
                      >
                        <Trash2 className="h-3 w-3" />
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
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Intelligence Engines Found</h3>
                <p className="text-muted-foreground mb-4">
                  {engines.length === 0 
                    ? "Create your first intelligence engine to start AI-powered scan optimization"
                    : "No engines match your current filters"
                  }
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Intelligence Engine
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Additional tabs would continue here... */}
        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">AI Models Management</h3>
              <p className="text-muted-foreground">
                Advanced AI model lifecycle management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Prediction Results</h3>
              <p className="text-muted-foreground">
                Real-time prediction monitoring and analysis coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Intelligence Analytics</h3>
              <p className="text-muted-foreground">
                Comprehensive analytics and insights dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Performance Optimization</h3>
              <p className="text-muted-foreground">
                Advanced optimization tools and recommendations coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Engine Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Create Intelligence Engine</CardTitle>
                  <CardDescription>Configure a new AI-powered intelligence engine</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
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
                    <Label htmlFor="intelligence-type">Intelligence Type</Label>
                    <Select
                      value={newEngine.intelligence_type}
                      onValueChange={(value: any) => setNewEngine(prev => ({ ...prev, intelligence_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INTELLIGENCE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="optimization-strategy">Optimization Strategy</Label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="intelligence-scope">Intelligence Scope</Label>
                    <Select
                      value={newEngine.intelligence_scope}
                      onValueChange={(value: any) => setNewEngine(prev => ({ ...prev, intelligence_scope: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INTELLIGENCE_SCOPES.map(scope => (
                          <SelectItem key={scope.value} value={scope.value}>
                            {scope.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learning-mode">Learning Mode</Label>
                    <Select
                      value={newEngine.learning_mode}
                      onValueChange={(value: any) => setNewEngine(prev => ({ ...prev, learning_mode: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEARNING_MODES.map(mode => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Advanced Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                    <Input
                      id="confidence-threshold"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newEngine.configuration.confidence_threshold}
                      onChange={(e) => setNewEngine(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          confidence_threshold: parseFloat(e.target.value)
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anomaly-threshold">Anomaly Threshold</Label>
                    <Input
                      id="anomaly-threshold"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newEngine.configuration.anomaly_threshold}
                      onChange={(e) => setNewEngine(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          anomaly_threshold: parseFloat(e.target.value)
                        }
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="learning-rate">Learning Rate</Label>
                    <Input
                      id="learning-rate"
                      type="number"
                      min="0.0001"
                      max="1"
                      step="0.0001"
                      value={newEngine.configuration.learning_rate}
                      onChange={(e) => setNewEngine(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          learning_rate: parseFloat(e.target.value)
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch-size">Batch Size</Label>
                    <Input
                      id="batch-size"
                      type="number"
                      min="1"
                      max="1000"
                      value={newEngine.configuration.batch_size}
                      onChange={(e) => setNewEngine(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          batch_size: parseInt(e.target.value)
                        }
                      }))}
                    />
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium">Feature Enablement</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-predictive">Predictive Analytics</Label>
                      <Switch
                        id="enable-predictive"
                        checked={newEngine.configuration.enable_predictive_analytics}
                        onCheckedChange={(checked) => setNewEngine(prev => ({
                          ...prev,
                          configuration: {
                            ...prev.configuration,
                            enable_predictive_analytics: checked
                          }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-anomaly">Anomaly Detection</Label>
                      <Switch
                        id="enable-anomaly"
                        checked={newEngine.configuration.enable_anomaly_detection}
                        onCheckedChange={(checked) => setNewEngine(prev => ({
                          ...prev,
                          configuration: {
                            ...prev.configuration,
                            enable_anomaly_detection: checked
                          }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-pattern">Pattern Recognition</Label>
                      <Switch
                        id="enable-pattern"
                        checked={newEngine.configuration.enable_pattern_recognition}
                        onCheckedChange={(checked) => setNewEngine(prev => ({
                          ...prev,
                          configuration: {
                            ...prev.configuration,
                            enable_pattern_recognition: checked
                          }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-optimization">Performance Optimization</Label>
                      <Switch
                        id="enable-optimization"
                        checked={newEngine.configuration.enable_performance_optimization}
                        onCheckedChange={(checked) => setNewEngine(prev => ({
                          ...prev,
                          configuration: {
                            ...prev.configuration,
                            enable_performance_optimization: checked
                          }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-scaling">Auto Scaling</Label>
                      <Switch
                        id="auto-scaling"
                        checked={newEngine.configuration.auto_scaling_enabled}
                        onCheckedChange={(checked) => setNewEngine(prev => ({
                          ...prev,
                          configuration: {
                            ...prev.configuration,
                            auto_scaling_enabled: checked
                          }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="real-time">Real-time Processing</Label>
                      <Switch
                        id="real-time"
                        checked={newEngine.configuration.real_time_processing}
                        onCheckedChange={(checked) => setNewEngine(prev => ({
                          ...prev,
                          configuration: {
                            ...prev.configuration,
                            real_time_processing: checked
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={createEngine} disabled={creating}>
                  {creating ? (
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