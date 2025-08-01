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
import { Brain, TrendingUp, TrendingDown, Activity, Target, Gauge, Cpu, Database, Network, HardDrive, Clock, BarChart3, Settings, Play, Pause, Stop, RefreshCw, Download, Upload, Filter, Search, Eye, EyeOff, MoreHorizontal, ChevronDown, ChevronUp, Plus, Minus, Edit, Trash2, Save, X, ExternalLink, History, Bell, Lightbulb, Rocket, AlertTriangle, CheckCircle, XCircle, AlertCircle, Calendar, User, Users, Globe, Monitor, Server, Shield, Lock, Unlock, Power, PowerOff, Maximize2, Minimize2, Info, HelpCircle, Star, Bookmark, Flag, Tag, Archive, FileText, PieChart as PieChartIcon, LineChart as LineChartIcon, Code, GitBranch, Package, Layers, Zap } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, ReferenceLine, Treemap, FunnelChart, Funnel, LabelList } from 'recharts'
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Enhanced Types for AI Model Lifecycle Manager
interface AIModel {
  id: string
  model_id: string
  model_name: string
  model_type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'nlp' | 'time_series' | 'deep_learning' | 'ensemble' | 'reinforcement_learning'
  model_framework: 'scikit_learn' | 'tensorflow' | 'pytorch' | 'xgboost' | 'lightgbm' | 'spacy' | 'transformers' | 'keras' | 'catboost' | 'prophet'
  model_version: string
  status: 'development' | 'training' | 'validation' | 'testing' | 'deployed' | 'archived' | 'failed' | 'deprecated' | 'rollback'
  lifecycle_stage: 'experiment' | 'staging' | 'production' | 'sunset'
  performance_metrics: {
    accuracy: number
    precision: number
    recall: number
    f1_score: number
    auc_score: number
    rmse?: number
    mae?: number
    r2_score?: number
    training_loss: number
    validation_loss: number
    inference_time_ms: number
    memory_usage_mb: number
    throughput_ops_per_sec: number
  }
  model_configuration: {
    algorithm: string
    hyperparameters: Record<string, any>
    feature_count: number
    training_data_size: number
    validation_split: number
    batch_size?: number
    epochs?: number
    learning_rate?: number
    regularization?: Record<string, any>
    preprocessing_steps: string[]
    feature_engineering: string[]
  }
  training_info: {
    training_start: string
    training_end?: string
    training_duration?: number
    training_status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
    dataset_version: string
    compute_resources: {
      cpu_cores: number
      memory_gb: number
      gpu_count?: number
      gpu_type?: string
      storage_gb: number
    }
    training_logs: TrainingLog[]
    checkpoints: ModelCheckpoint[]
  }
  deployment_info?: {
    deployment_id: string
    deployment_environment: 'staging' | 'production' | 'canary' | 'blue_green'
    deployment_strategy: 'rolling' | 'blue_green' | 'canary' | 'immediate'
    endpoint_url?: string
    service_name: string
    replicas: number
    auto_scaling: boolean
    resource_limits: {
      cpu_limit: string
      memory_limit: string
      gpu_limit?: string
    }
    health_check: {
      endpoint: string
      interval_seconds: number
      timeout_seconds: number
      failure_threshold: number
    }
    monitoring_config: {
      metrics_enabled: boolean
      logging_level: string
      alerting_rules: string[]
    }
    deployment_date: string
    last_health_check: string
    uptime_percentage: number
  }
  versioning: {
    parent_version?: string
    children_versions: string[]
    branch_name: string
    commit_hash?: string
    changelog: string[]
    tags: string[]
    is_baseline: boolean
    comparison_baseline?: string
  }
  metadata: {
    description: string
    use_case: string
    business_impact: string
    data_sources: string[]
    feature_importance?: Record<string, number>
    model_interpretability: 'high' | 'medium' | 'low'
    compliance_requirements: string[]
    risk_assessment: 'low' | 'medium' | 'high' | 'critical'
    model_owner: string
    stakeholders: string[]
    documentation_url?: string
  }
  monitoring: {
    drift_detection: boolean
    performance_monitoring: boolean
    bias_monitoring: boolean
    explainability_tracking: boolean
    alert_thresholds: {
      accuracy_drop: number
      latency_increase: number
      error_rate_spike: number
      drift_score: number
    }
    monitoring_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly'
    last_evaluation: string
    evaluation_history: ModelEvaluation[]
  }
  created_at: string
  updated_at: string
  created_by: string
}

interface TrainingLog {
  id: string
  timestamp: string
  epoch?: number
  batch?: number
  phase: 'training' | 'validation' | 'testing'
  metrics: Record<string, number>
  loss: number
  learning_rate?: number
  message?: string
  level: 'info' | 'warning' | 'error' | 'debug'
}

interface ModelCheckpoint {
  id: string
  checkpoint_name: string
  epoch: number
  timestamp: string
  model_state_path: string
  optimizer_state_path?: string
  metrics: Record<string, number>
  file_size_mb: number
  is_best: boolean
  validation_score: number
}

interface ModelEvaluation {
  id: string
  evaluation_id: string
  model_id: string
  evaluation_date: string
  evaluation_type: 'scheduled' | 'triggered' | 'manual' | 'deployment'
  dataset_name: string
  dataset_size: number
  metrics: Record<string, number>
  performance_comparison: {
    baseline_model?: string
    improvement_percentage: Record<string, number>
    degradation_areas: string[]
  }
  drift_analysis: {
    feature_drift_detected: boolean
    concept_drift_detected: boolean
    drift_severity: 'none' | 'low' | 'medium' | 'high'
    affected_features: string[]
    recommended_actions: string[]
  }
  bias_analysis: {
    bias_detected: boolean
    affected_groups: string[]
    bias_metrics: Record<string, number>
    fairness_violations: string[]
  }
  explainability_report: {
    feature_importance: Record<string, number>
    shap_values_summary: Record<string, any>
    lime_explanations: Record<string, any>
    model_insights: string[]
  }
  recommendations: string[]
  status: 'completed' | 'failed' | 'in_progress'
  evaluation_duration: number
}

interface ModelExperiment {
  id: string
  experiment_id: string
  experiment_name: string
  experiment_type: 'hyperparameter_tuning' | 'architecture_search' | 'feature_selection' | 'data_augmentation' | 'ensemble_testing'
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  start_time: string
  end_time?: string
  duration?: number
  objective_metric: string
  optimization_direction: 'maximize' | 'minimize'
  parameter_space: Record<string, any>
  best_parameters: Record<string, any>
  best_score: number
  trials_completed: number
  total_trials: number
  experiment_runs: ExperimentRun[]
  resource_usage: {
    total_cpu_hours: number
    total_memory_gb_hours: number
    total_gpu_hours?: number
    estimated_cost: number
  }
  insights: string[]
  next_steps: string[]
}

interface ExperimentRun {
  id: string
  run_id: string
  trial_number: number
  parameters: Record<string, any>
  metrics: Record<string, number>
  start_time: string
  end_time: string
  duration: number
  status: 'completed' | 'failed' | 'running'
  artifacts: {
    model_path?: string
    logs_path: string
    metrics_path: string
    plots_path?: string
  }
}

interface ModelRegistry {
  total_models: number
  models_by_status: Record<string, number>
  models_by_type: Record<string, number>
  models_by_framework: Record<string, number>
  deployment_statistics: {
    total_deployments: number
    active_deployments: number
    failed_deployments: number
    rollbacks: number
  }
  performance_trends: {
    accuracy_trend: number[]
    latency_trend: number[]
    throughput_trend: number[]
    resource_usage_trend: number[]
  }
  compliance_status: {
    compliant_models: number
    non_compliant_models: number
    pending_review: number
  }
  lifecycle_distribution: Record<string, number>
}

interface ModelPipeline {
  id: string
  pipeline_id: string
  pipeline_name: string
  pipeline_type: 'training' | 'inference' | 'batch_prediction' | 'model_validation' | 'deployment'
  status: 'active' | 'inactive' | 'running' | 'failed' | 'scheduled'
  schedule: {
    enabled: boolean
    cron_expression?: string
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly'
    next_run?: string
    last_run?: string
  }
  steps: PipelineStep[]
  configuration: {
    parallel_execution: boolean
    failure_strategy: 'stop' | 'continue' | 'retry'
    retry_attempts: number
    timeout_minutes: number
    resource_requirements: {
      cpu_cores: number
      memory_gb: number
      gpu_count?: number
      storage_gb: number
    }
    environment_variables: Record<string, string>
    notifications: {
      on_success: boolean
      on_failure: boolean
      channels: string[]
    }
  }
  execution_history: PipelineExecution[]
  metrics: {
    total_executions: number
    success_rate: number
    avg_duration: number
    last_execution_status: string
  }
}

interface PipelineStep {
  id: string
  step_name: string
  step_type: 'data_ingestion' | 'preprocessing' | 'feature_engineering' | 'model_training' | 'validation' | 'deployment' | 'notification'
  dependencies: string[]
  configuration: Record<string, any>
  timeout_minutes: number
  retry_count: number
  resources: {
    cpu: string
    memory: string
    gpu?: string
  }
}

interface PipelineExecution {
  id: string
  execution_id: string
  start_time: string
  end_time?: string
  duration?: number
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  trigger: 'manual' | 'scheduled' | 'api' | 'webhook'
  step_results: Record<string, any>
  logs: string[]
  artifacts: string[]
  resource_usage: Record<string, any>
}

const MODEL_TYPES = [
  { value: 'classification', label: 'Classification', icon: Target, color: 'blue', description: 'Categorize data into discrete classes' },
  { value: 'regression', label: 'Regression', icon: TrendingUp, color: 'green', description: 'Predict continuous numerical values' },
  { value: 'clustering', label: 'Clustering', icon: Network, color: 'purple', description: 'Group similar data points together' },
  { value: 'anomaly_detection', label: 'Anomaly Detection', icon: AlertTriangle, color: 'red', description: 'Identify unusual patterns or outliers' },
  { value: 'nlp', label: 'Natural Language Processing', icon: FileText, color: 'orange', description: 'Process and understand text data' },
  { value: 'time_series', label: 'Time Series', icon: Clock, color: 'cyan', description: 'Analyze temporal data patterns' },
  { value: 'deep_learning', label: 'Deep Learning', icon: Brain, color: 'indigo', description: 'Complex neural network models' },
  { value: 'ensemble', label: 'Ensemble', icon: Layers, color: 'yellow', description: 'Combine multiple models for better performance' },
  { value: 'reinforcement_learning', label: 'Reinforcement Learning', icon: Zap, color: 'pink', description: 'Learn through interaction and rewards' }
]

const MODEL_FRAMEWORKS = [
  { value: 'scikit_learn', label: 'Scikit-learn', description: 'General-purpose machine learning library' },
  { value: 'tensorflow', label: 'TensorFlow', description: 'End-to-end open source platform for ML' },
  { value: 'pytorch', label: 'PyTorch', description: 'Dynamic neural networks and deep learning' },
  { value: 'xgboost', label: 'XGBoost', description: 'Gradient boosting framework' },
  { value: 'lightgbm', label: 'LightGBM', description: 'Fast gradient boosting framework' },
  { value: 'spacy', label: 'spaCy', description: 'Industrial-strength NLP library' },
  { value: 'transformers', label: 'Transformers', description: 'State-of-the-art natural language processing' },
  { value: 'keras', label: 'Keras', description: 'High-level neural networks API' },
  { value: 'catboost', label: 'CatBoost', description: 'Gradient boosting on decision trees' },
  { value: 'prophet', label: 'Prophet', description: 'Time series forecasting' }
]

const LIFECYCLE_STAGES = [
  { value: 'experiment', label: 'Experiment', color: 'blue', description: 'Research and development phase' },
  { value: 'staging', label: 'Staging', color: 'yellow', description: 'Testing and validation phase' },
  { value: 'production', label: 'Production', color: 'green', description: 'Live deployment and serving' },
  { value: 'sunset', label: 'Sunset', color: 'gray', description: 'Deprecated and being phased out' }
]

const DEPLOYMENT_ENVIRONMENTS = [
  { value: 'staging', label: 'Staging', description: 'Pre-production testing environment' },
  { value: 'production', label: 'Production', description: 'Live production environment' },
  { value: 'canary', label: 'Canary', description: 'Limited production deployment for testing' },
  { value: 'blue_green', label: 'Blue-Green', description: 'Parallel deployment strategy' }
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

export default function AIModelLifecycleManager() {
  // State management
  const [models, setModels] = useState<AIModel[]>([])
  const [experiments, setExperiments] = useState<ModelExperiment[]>([])
  const [pipelines, setPipelines] = useState<ModelPipeline[]>([])
  const [evaluations, setEvaluations] = useState<ModelEvaluation[]>([])
  const [registry, setRegistry] = useState<ModelRegistry | null>(null)
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedModel, setSelectedModel] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('1w')
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [autoEvaluation, setAutoEvaluation] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<string>('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedModel, setExpandedModel] = useState<string | null>(null)
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [showCreateModelModal, setShowCreateModelModal] = useState(false)
  const [showDeploymentModal, setShowDeploymentModal] = useState(false)
  const [showExperimentModal, setShowExperimentModal] = useState(false)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [selectedModelForAction, setSelectedModelForAction] = useState<AIModel | null>(null)

  // Refs for real-time updates
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Form state for new model
  const [newModel, setNewModel] = useState({
    model_name: '',
    model_type: 'classification' as const,
    model_framework: 'scikit_learn' as const,
    description: '',
    use_case: '',
    business_impact: '',
    model_owner: '',
    risk_assessment: 'medium' as const,
    compliance_requirements: [] as string[],
    hyperparameters: {},
    training_data_size: 1000,
    validation_split: 0.2,
    auto_deploy: false,
    monitoring_enabled: true
  })

  // API functions
  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/models')
      if (!response.ok) throw new Error('Failed to fetch AI models')
      const data = await response.json()
      setModels(data.models || [])
    } catch (error) {
      console.error('Error fetching models:', error)
      toast({
        title: "Error",
        description: "Failed to fetch AI models",
        variant: "destructive"
      })
    }
  }, [])

  const fetchExperiments = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/models/experiments')
      if (!response.ok) throw new Error('Failed to fetch experiments')
      const data = await response.json()
      setExperiments(data.experiments || [])
    } catch (error) {
      console.error('Error fetching experiments:', error)
    }
  }, [])

  const fetchPipelines = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/models/pipelines')
      if (!response.ok) throw new Error('Failed to fetch pipelines')
      const data = await response.json()
      setPipelines(data.pipelines || [])
    } catch (error) {
      console.error('Error fetching pipelines:', error)
    }
  }, [])

  const fetchEvaluations = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        model_id: selectedModel !== 'all' ? selectedModel : ''
      })

      const response = await fetch(`/api/v1/scan-intelligence/models/evaluations?${params}`)
      if (!response.ok) throw new Error('Failed to fetch evaluations')
      const data = await response.json()
      setEvaluations(data.evaluations || [])
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    }
  }, [timeRange, selectedModel])

  const fetchRegistry = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/models/registry/stats')
      if (!response.ok) throw new Error('Failed to fetch registry stats')
      const data = await response.json()
      setRegistry(data.registry)
    } catch (error) {
      console.error('Error fetching registry:', error)
    }
  }, [])

  const createModel = async () => {
    if (!newModel.model_name.trim()) {
      toast({
        title: "Error",
        description: "Model name is required",
        variant: "destructive"
      })
      return
    }

    setTraining(true)
    try {
      const response = await fetch('/api/v1/scan-intelligence/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModel)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create AI model')
      }

      toast({
        title: "Success",
        description: `AI model "${newModel.model_name}" created and training started`,
      })

      setShowCreateModelModal(false)
      setNewModel({
        model_name: '',
        model_type: 'classification',
        model_framework: 'scikit_learn',
        description: '',
        use_case: '',
        business_impact: '',
        model_owner: '',
        risk_assessment: 'medium',
        compliance_requirements: [],
        hyperparameters: {},
        training_data_size: 1000,
        validation_split: 0.2,
        auto_deploy: false,
        monitoring_enabled: true
      })

      await fetchModels()
    } catch (error) {
      console.error('Error creating model:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create model",
        variant: "destructive"
      })
    } finally {
      setTraining(false)
    }
  }

  const deployModel = async (modelId: string, environment: string) => {
    setDeploying(true)
    try {
      const response = await fetch(`/api/v1/scan-intelligence/models/${modelId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to deploy model')
      }

      toast({
        title: "Success",
        description: "Model deployment initiated successfully",
      })

      await fetchModels()
    } catch (error) {
      console.error('Error deploying model:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deploy model",
        variant: "destructive"
      })
    } finally {
      setDeploying(false)
    }
  }

  const evaluateModel = async (modelId: string) => {
    setEvaluating(true)
    try {
      const response = await fetch(`/api/v1/scan-intelligence/models/${modelId}/evaluate`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start model evaluation')
      }

      toast({
        title: "Success",
        description: "Model evaluation started successfully",
      })

      await fetchEvaluations()
    } catch (error) {
      console.error('Error evaluating model:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start evaluation",
        variant: "destructive"
      })
    } finally {
      setEvaluating(false)
    }
  }

  const promoteModel = async (modelId: string, targetStage: string) => {
    try {
      const response = await fetch(`/api/v1/scan-intelligence/models/${modelId}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_stage: targetStage })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to promote model')
      }

      toast({
        title: "Success",
        description: `Model promoted to ${targetStage} successfully`,
      })

      await fetchModels()
    } catch (error) {
      console.error('Error promoting model:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to promote model",
        variant: "destructive"
      })
    }
  }

  const rollbackModel = async (modelId: string, targetVersion: string) => {
    try {
      const response = await fetch(`/api/v1/scan-intelligence/models/${modelId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_version: targetVersion })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to rollback model')
      }

      toast({
        title: "Success",
        description: `Model rolled back to version ${targetVersion} successfully`,
      })

      await fetchModels()
    } catch (error) {
      console.error('Error rolling back model:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rollback model",
        variant: "destructive"
      })
    }
  }

  const archiveModel = async (modelId: string) => {
    try {
      const response = await fetch(`/api/v1/scan-intelligence/models/${modelId}/archive`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to archive model')
      }

      toast({
        title: "Success",
        description: "Model archived successfully",
      })

      await fetchModels()
    } catch (error) {
      console.error('Error archiving model:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to archive model",
        variant: "destructive"
      })
    }
  }

  // Real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    if (!realTimeUpdates) return

    const ws = new WebSocket(`wss://${window.location.host}/api/v1/scan-intelligence/models/ws`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'model_training_started') {
        setModels(prev => prev.map(model => 
          model.model_id === data.model_id ? { ...model, status: 'training' } : model
        ))
      } else if (data.type === 'model_training_completed') {
        setModels(prev => prev.map(model => 
          model.model_id === data.model_id ? { ...model, ...data.updates } : model
        ))
        toast({
          title: "Training Completed",
          description: `${data.model_name} training completed with ${data.accuracy}% accuracy`,
        })
      } else if (data.type === 'model_deployed') {
        setModels(prev => prev.map(model => 
          model.model_id === data.model_id ? { ...model, status: 'deployed', deployment_info: data.deployment_info } : model
        ))
      } else if (data.type === 'evaluation_completed') {
        setEvaluations(prev => [data.evaluation, ...prev])
      } else if (data.type === 'registry_updated') {
        setRegistry(data.registry)
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
        fetchModels(),
        fetchExperiments(),
        fetchPipelines(),
        fetchEvaluations(),
        fetchRegistry()
      ])
      setLoading(false)
    }

    loadData()
  }, [fetchModels, fetchExperiments, fetchPipelines, fetchEvaluations, fetchRegistry])

  useEffect(() => {
    return setupRealTimeUpdates()
  }, [setupRealTimeUpdates])

  useEffect(() => {
    if (!realTimeUpdates) return

    intervalRef.current = setInterval(() => {
      fetchRegistry()
    }, 30000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [realTimeUpdates, fetchRegistry])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  // Derived data
  const filteredModels = useMemo(() => {
    let filtered = models

    if (searchTerm) {
      filtered = filtered.filter(model => 
        model.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.model_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.model_framework.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(model => model.model_type === selectedType)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(model => model.status === selectedStatus)
    }

    if (selectedStage !== 'all') {
      filtered = filtered.filter(model => model.lifecycle_stage === selectedStage)
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof AIModel]
      const bValue = b[sortBy as keyof AIModel]
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [models, searchTerm, selectedType, selectedStatus, selectedStage, sortBy, sortOrder])

  const chartData = useMemo(() => {
    if (!registry) return []
    return registry.performance_trends.accuracy_trend.map((value, index) => ({
      time: index,
      accuracy: value,
      latency: registry.performance_trends.latency_trend[index],
      throughput: registry.performance_trends.throughput_trend[index],
      resource_usage: registry.performance_trends.resource_usage_trend[index]
    }))
  }, [registry])

  const modelDistributionData = useMemo(() => {
    if (!registry) return []
    return Object.entries(registry.models_by_type).map(([type, count]) => ({
      name: type,
      value: count,
      color: MODEL_TYPES.find(t => t.value === type)?.color || 'gray'
    }))
  }, [registry])

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-500'
      case 'training': return 'bg-blue-500'
      case 'validation': return 'bg-yellow-500'
      case 'testing': return 'bg-purple-500'
      case 'failed': return 'bg-red-500'
      case 'archived': return 'bg-gray-500'
      case 'development': return 'bg-orange-500'
      default: return 'bg-gray-400'
    }
  }

  const getStageColor = (stage: string) => {
    const stageConfig = LIFECYCLE_STAGES.find(s => s.value === stage)
    return stageConfig?.color || 'gray'
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = MODEL_TYPES.find(t => t.value === type)
    return typeConfig?.icon || Brain
  }

  const getTypeColor = (type: string) => {
    const typeConfig = MODEL_TYPES.find(t => t.value === type)
    return typeConfig?.color || 'gray'
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

  const formatFileSize = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`
    }
    return `${mb.toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading AI model lifecycle manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Model Lifecycle Manager</h2>
          <p className="text-muted-foreground">
            Complete ML model management including training, deployment, monitoring, and versioning
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
              id="auto-evaluation"
              checked={autoEvaluation}
              onCheckedChange={setAutoEvaluation}
            />
            <Label htmlFor="auto-evaluation" className="text-sm">Auto-evaluate</Label>
          </div>
          <Button onClick={() => setShowCreateModelModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Model
          </Button>
        </div>
      </div>

      {/* Registry Overview */}
      {registry && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Models</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registry.total_models}</div>
              <p className="text-xs text-muted-foreground">
                {registry.deployment_statistics.active_deployments} deployed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Production Models</CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registry.lifecycle_distribution.production || 0}</div>
              <p className="text-xs text-muted-foreground">
                {registry.lifecycle_distribution.staging || 0} in staging
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deployment Success</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage((registry.deployment_statistics.active_deployments / (registry.deployment_statistics.total_deployments || 1)) * 100)}
              </div>
              <p className="text-xs text-muted-foreground">
                {registry.deployment_statistics.rollbacks} rollbacks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage((registry.compliance_status.compliant_models / (registry.total_models || 1)) * 100)}
              </div>
              <p className="text-xs text-muted-foreground">
                {registry.compliance_status.pending_review} pending review
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
                <Label htmlFor="model-select">Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    {models.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.model_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-select">Model Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {MODEL_TYPES.map(type => (
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
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="validation">Validation</SelectItem>
                    <SelectItem value="deployed">Deployed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage-select">Lifecycle Stage</Label>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {LIFECYCLE_STAGES.map(stage => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={() => setShowExperimentModal(true)} variant="outline">
                <Lightbulb className="h-4 w-4 mr-2" />
                New Experiment
              </Button>
              <Button onClick={() => evaluateModel('all')} disabled={evaluating}>
                {evaluating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
                Evaluate All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="registry">Registry</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Trends</CardTitle>
                <CardDescription>Performance metrics across all models over time</CardDescription>
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
                      dataKey="accuracy" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="Accuracy"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="throughput" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Throughput"
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
                <CardTitle>Model Type Distribution</CardTitle>
                <CardDescription>Distribution of models by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={modelDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {modelDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Model Activity</CardTitle>
              <CardDescription>Latest updates and changes across your ML models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {models.slice(0, 5).map(model => (
                  <div key={model.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-lg bg-${getTypeColor(model.model_type)}-100`}>
                      {React.createElement(getTypeIcon(model.model_type), { 
                        className: `h-5 w-5 text-${getTypeColor(model.model_type)}-600` 
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{model.model_name}</h4>
                        <Badge className={cn("text-xs", getStatusColor(model.status))}>
                          {model.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          v{model.model_version}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{model.metadata.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Accuracy:</span>{' '}
                          <span className="font-medium">{formatPercentage(model.performance_metrics.accuracy)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Latency:</span>{' '}
                          <span className="font-medium">{model.performance_metrics.inference_time_ms}ms</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Updated:</span>{' '}
                          <span className="font-medium">{new Date(model.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => evaluateModel(model.model_id)}>
                        <Target className="h-3 w-3 mr-1" />
                        Evaluate
                      </Button>
                      {model.status === 'validation' && (
                        <Button variant="outline" size="sm" onClick={() => deployModel(model.model_id, 'staging')}>
                          <Rocket className="h-3 w-3 mr-1" />
                          Deploy
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search models..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Registry
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Models Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredModels.map(model => {
              const TypeIcon = getTypeIcon(model.model_type)
              const isExpanded = expandedModel === model.model_id
              
              return (
                <Card key={model.model_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${getTypeColor(model.model_type)}-100`}>
                          <TypeIcon className={`h-5 w-5 text-${getTypeColor(model.model_type)}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{model.model_name}</CardTitle>
                          <CardDescription className="text-sm">
                            {MODEL_TYPES.find(t => t.value === model.model_type)?.label} • v{model.model_version}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs", getStatusColor(model.status))}>
                          {model.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedModel(isExpanded ? null : model.model_id)}
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
                        <span className="text-sm text-muted-foreground">Accuracy</span>
                        <span className="text-sm font-medium">{formatPercentage(model.performance_metrics.accuracy)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Inference Time</span>
                        <span className="text-sm font-medium">{model.performance_metrics.inference_time_ms}ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Throughput</span>
                        <span className="text-sm font-medium">{model.performance_metrics.throughput_ops_per_sec} ops/sec</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Memory Usage</span>
                        <span className="text-sm font-medium">{formatFileSize(model.performance_metrics.memory_usage_mb)}</span>
                      </div>
                    </div>

                    {/* Model Info */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Model Info</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Framework:</span>
                          <span>{model.model_framework}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lifecycle Stage:</span>
                          <Badge variant="outline" className={cn("text-xs", `bg-${getStageColor(model.lifecycle_stage)}-100`)}>
                            {model.lifecycle_stage}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Level:</span>
                          <span className={cn(
                            model.metadata.risk_assessment === 'critical' ? 'text-red-600' :
                            model.metadata.risk_assessment === 'high' ? 'text-orange-600' :
                            model.metadata.risk_assessment === 'medium' ? 'text-yellow-600' : 'text-green-600'
                          )}>
                            {model.metadata.risk_assessment}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="pt-4 border-t space-y-4">
                        {/* Training Info */}
                        {model.training_info && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Training Info</p>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <span>{model.training_info.training_status}</span>
                              </div>
                              {model.training_info.training_duration && (
                                <div className="flex justify-between">
                                  <span>Duration:</span>
                                  <span>{formatDuration(model.training_info.training_duration)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Dataset Size:</span>
                                <span>{model.model_configuration.training_data_size.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Features:</span>
                                <span>{model.model_configuration.feature_count}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Deployment Info */}
                        {model.deployment_info && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deployment</p>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Environment:</span>
                                <span>{model.deployment_info.deployment_environment}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Replicas:</span>
                                <span>{model.deployment_info.replicas}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Uptime:</span>
                                <span>{formatPercentage(model.deployment_info.uptime_percentage)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Monitoring Status */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monitoring</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Drift Detection:</span>
                              <span>{model.monitoring.drift_detection ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Performance:</span>
                              <span>{model.monitoring.performance_monitoring ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Frequency:</span>
                              <span>{model.monitoring.monitoring_frequency}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {model.status === 'validation' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => promoteModel(model.model_id, 'production')}
                          className="flex-1"
                        >
                          <Rocket className="h-3 w-3 mr-1" />
                          Promote
                        </Button>
                      )}
                      {model.status === 'deployed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rollbackModel(model.model_id, model.versioning.parent_version || '')}
                          className="flex-1"
                        >
                          <History className="h-3 w-3 mr-1" />
                          Rollback
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => evaluateModel(model.model_id)}
                        disabled={evaluating}
                      >
                        <Target className="h-3 w-3 mr-1" />
                        Evaluate
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredModels.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No AI Models Found</h3>
                <p className="text-muted-foreground mb-4">
                  {models.length === 0 
                    ? "Create your first AI model to start building intelligent scan capabilities"
                    : "No models match your current filters"
                  }
                </p>
                <Button onClick={() => setShowCreateModelModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create AI Model
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4">
          {/* Experiments List */}
          <Card>
            <CardHeader>
              <CardTitle>Model Experiments</CardTitle>
              <CardDescription>Track hyperparameter tuning and model optimization experiments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {experiments.map(experiment => (
                  <div key={experiment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{experiment.experiment_name}</h4>
                          <Badge className={cn(
                            "text-xs",
                            experiment.status === 'completed' ? 'bg-green-500' :
                            experiment.status === 'running' ? 'bg-blue-500' :
                            experiment.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                          )}>
                            {experiment.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {experiment.experiment_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Optimizing {experiment.objective_metric} • {experiment.trials_completed}/{experiment.total_trials} trials
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Best Score:</span>{' '}
                            <span className="font-medium">{experiment.best_score.toFixed(4)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>{' '}
                            <span className="font-medium">
                              {experiment.duration ? formatDuration(experiment.duration) : 'Running...'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cost:</span>{' '}
                            <span className="font-medium">${experiment.resource_usage.estimated_cost.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View Results
                        </Button>
                        {experiment.status === 'running' && (
                          <Button variant="outline" size="sm">
                            <Stop className="h-3 w-3 mr-1" />
                            Stop
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {experiments.length === 0 && (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Experiments Running</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a new experiment to optimize your model performance
                  </p>
                  <Button onClick={() => setShowExperimentModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Experiment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-4">
          {/* Pipelines Content */}
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">ML Pipelines</h3>
              <p className="text-muted-foreground">
                Automated ML pipelines for training, validation, and deployment coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations" className="space-y-4">
          {/* Evaluations Content */}
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Model Evaluations</h3>
              <p className="text-muted-foreground">
                Comprehensive model evaluation and performance analysis coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registry" className="space-y-4">
          {/* Registry Content */}
          <Card>
            <CardContent className="text-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Model Registry</h3>
              <p className="text-muted-foreground">
                Advanced model registry features and metadata management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Model Modal */}
      {showCreateModelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Create AI Model</CardTitle>
                  <CardDescription>Configure and train a new AI model for scan intelligence</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModelModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model-name">Model Name</Label>
                  <Input
                    id="model-name"
                    placeholder="Enter model name..."
                    value={newModel.model_name}
                    onChange={(e) => setNewModel(prev => ({ ...prev, model_name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-type">Model Type</Label>
                    <Select
                      value={newModel.model_type}
                      onValueChange={(value: any) => setNewModel(prev => ({ ...prev, model_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model-framework">Framework</Label>
                    <Select
                      value={newModel.model_framework}
                      onValueChange={(value: any) => setNewModel(prev => ({ ...prev, model_framework: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_FRAMEWORKS.map(framework => (
                          <SelectItem key={framework.value} value={framework.value}>
                            {framework.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the model's purpose and functionality..."
                    value={newModel.description}
                    onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              {/* Model Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium">Training Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="training-data-size">Training Data Size</Label>
                    <Input
                      id="training-data-size"
                      type="number"
                      value={newModel.training_data_size}
                      onChange={(e) => setNewModel(prev => ({ ...prev, training_data_size: parseInt(e.target.value) || 1000 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validation-split">Validation Split: {newModel.validation_split}</Label>
                    <Slider
                      id="validation-split"
                      min={0.1}
                      max={0.4}
                      step={0.05}
                      value={[newModel.validation_split]}
                      onValueChange={(value) => setNewModel(prev => ({ ...prev, validation_split: value[0] }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk-assessment">Risk Assessment</Label>
                  <Select
                    value={newModel.risk_assessment}
                    onValueChange={(value: any) => setNewModel(prev => ({ ...prev, risk_assessment: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="critical">Critical Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Configuration Options */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Options</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-deploy">Auto Deploy to Staging</Label>
                    <Switch
                      id="auto-deploy"
                      checked={newModel.auto_deploy}
                      onCheckedChange={(checked) => setNewModel(prev => ({ ...prev, auto_deploy: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="monitoring-enabled">Enable Monitoring</Label>
                    <Switch
                      id="monitoring-enabled"
                      checked={newModel.monitoring_enabled}
                      onCheckedChange={(checked) => setNewModel(prev => ({ ...prev, monitoring_enabled: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateModelModal(false)}>
                  Cancel
                </Button>
                <Button onClick={createModel} disabled={training}>
                  {training ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating & Training...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create & Train Model
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