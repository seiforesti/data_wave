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
import { TrendingUp, TrendingDown, Brain, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Activity, Target, Zap, Clock, Calendar, RefreshCw, Download, Upload, Filter, Search, Settings, Info, AlertTriangle, CheckCircle, ArrowUp, ArrowDown, Minus, Plus, Play, Pause, RotateCcw, Maximize2, Minimize2, Eye, EyeOff, History, Lightbulb, Rocket, Database, Cpu, Network, HardDrive, Gauge } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, ReferenceLine, Treemap } from 'recharts'
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Enhanced Types for Predictive Analytics
interface PredictionModel {
  id: string
  model_id: string
  model_name: string
  model_type: 'time_series' | 'regression' | 'classification' | 'anomaly_detection' | 'pattern_recognition' | 'neural_network' | 'ensemble'
  status: 'training' | 'active' | 'deprecated' | 'error'
  accuracy: number
  confidence_interval: number
  training_data_points: number
  last_updated: string
  next_update: string
  predictions_made: number
  success_rate: number
  features: string[]
  hyperparameters: Record<string, any>
  performance_metrics: {
    mse: number
    mae: number
    r2_score: number
    precision: number
    recall: number
    f1_score: number
  }
}

interface PredictionResult {
  id: string
  prediction_id: string
  model_id: string
  model_name: string
  prediction_type: 'scan_duration' | 'resource_usage' | 'data_quality' | 'anomaly_score' | 'pattern_likelihood' | 'performance_score' | 'failure_probability' | 'cost_estimation'
  predicted_value: number | string | object
  actual_value?: number | string | object
  confidence_score: number
  prediction_timestamp: string
  target_timestamp: string
  input_features: Record<string, any>
  explanation: string
  impact_score: number
  recommendation: string
  metadata: Record<string, any>
  status: 'pending' | 'confirmed' | 'failed' | 'outdated'
}

interface ForecastData {
  timestamp: string
  actual?: number
  predicted: number
  lower_bound: number
  upper_bound: number
  confidence: number
  factors: string[]
  trend: 'increasing' | 'decreasing' | 'stable'
  seasonality?: number
  anomaly_score?: number
}

interface TrendAnalysis {
  metric: string
  current_value: number
  predicted_value: number
  change_percentage: number
  trend_direction: 'up' | 'down' | 'stable'
  significance: 'high' | 'medium' | 'low'
  forecast_period: string
  confidence: number
  key_drivers: string[]
  recommendations: string[]
  risk_factors: string[]
}

interface AnalyticsMetrics {
  total_predictions: number
  successful_predictions: number
  accuracy_rate: number
  average_confidence: number
  total_models: number
  active_models: number
  predictions_today: number
  cost_savings_predicted: number
  performance_improvements: {
    scan_time_reduction: number
    resource_optimization: number
    quality_improvement: number
    cost_reduction: number
  }
  model_performance: {
    best_performing_model: string
    worst_performing_model: string
    average_accuracy: number
    accuracy_trend: number[]
  }
  prediction_categories: {
    category: string
    count: number
    accuracy: number
    impact: number
  }[]
}

interface AlertConfig {
  enabled: boolean
  threshold: number
  metric: string
  condition: 'above' | 'below' | 'equals'
  severity: 'low' | 'medium' | 'high' | 'critical'
  notification_channels: string[]
}

const PREDICTION_TYPES = [
  { value: 'scan_duration', label: 'Scan Duration', icon: Clock, color: 'blue', description: 'Predict scan completion times' },
  { value: 'resource_usage', label: 'Resource Usage', icon: Cpu, color: 'green', description: 'Forecast CPU, memory, and storage needs' },
  { value: 'data_quality', label: 'Data Quality', icon: Target, color: 'purple', description: 'Predict data quality scores and issues' },
  { value: 'anomaly_score', label: 'Anomaly Detection', icon: AlertTriangle, color: 'red', description: 'Identify potential anomalies and outliers' },
  { value: 'pattern_likelihood', label: 'Pattern Recognition', icon: Brain, color: 'indigo', description: 'Predict pattern occurrence likelihood' },
  { value: 'performance_score', label: 'Performance Score', icon: Gauge, color: 'orange', description: 'Forecast system performance metrics' },
  { value: 'failure_probability', label: 'Failure Probability', icon: AlertTriangle, color: 'red', description: 'Predict failure likelihood and risks' },
  { value: 'cost_estimation', label: 'Cost Estimation', icon: TrendingUp, color: 'yellow', description: 'Estimate operational costs and savings' }
]

const TIME_RANGES = [
  { value: '1h', label: '1 Hour', hours: 1 },
  { value: '6h', label: '6 Hours', hours: 6 },
  { value: '1d', label: '1 Day', hours: 24 },
  { value: '3d', label: '3 Days', hours: 72 },
  { value: '1w', label: '1 Week', hours: 168 },
  { value: '1m', label: '1 Month', hours: 720 },
  { value: '3m', label: '3 Months', hours: 2160 },
  { value: '6m', label: '6 Months', hours: 4320 },
  { value: '1y', label: '1 Year', hours: 8760 }
]

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00']

export default function PredictiveAnalyticsDashboard() {
  // State management
  const [models, setModels] = useState<PredictionModel[]>([])
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis[]>([])
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [retraining, setRetraining] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedModel, setSelectedModel] = useState<string>('all')
  const [selectedPredictionType, setSelectedPredictionType] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('1w')
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7)
  const [showLowConfidence, setShowLowConfidence] = useState(false)
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([])
  const [expandedPrediction, setExpandedPrediction] = useState<string | null>(null)
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'scatter'>('line')
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true)
  const [showTrendlines, setShowTrendlines] = useState(true)
  const [aggregationLevel, setAggregationLevel] = useState<'raw' | 'hourly' | 'daily' | 'weekly'>('hourly')

  // Refs for real-time updates
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // API functions
  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/models/predictive')
      if (!response.ok) throw new Error('Failed to fetch models')
      const data = await response.json()
      setModels(data.models || [])
    } catch (error) {
      console.error('Error fetching models:', error)
      toast({
        title: "Error",
        description: "Failed to fetch predictive models",
        variant: "destructive"
      })
    }
  }, [])

  const fetchPredictions = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        model_id: selectedModel !== 'all' ? selectedModel : '',
        prediction_type: selectedPredictionType !== 'all' ? selectedPredictionType : '',
        confidence_threshold: confidenceThreshold.toString(),
        include_low_confidence: showLowConfidence.toString(),
        aggregation: aggregationLevel
      })

      const response = await fetch(`/api/v1/scan-intelligence/predictions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch predictions')
      const data = await response.json()
      setPredictions(data.predictions || [])
    } catch (error) {
      console.error('Error fetching predictions:', error)
    }
  }, [timeRange, selectedModel, selectedPredictionType, confidenceThreshold, showLowConfidence, aggregationLevel])

  const fetchForecastData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        prediction_type: selectedPredictionType !== 'all' ? selectedPredictionType : 'scan_duration',
        model_id: selectedModel !== 'all' ? selectedModel : ''
      })

      const response = await fetch(`/api/v1/scan-intelligence/forecast?${params}`)
      if (!response.ok) throw new Error('Failed to fetch forecast data')
      const data = await response.json()
      setForecastData(data.forecast || [])
    } catch (error) {
      console.error('Error fetching forecast data:', error)
    }
  }, [timeRange, selectedModel, selectedPredictionType])

  const fetchTrendAnalysis = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        metrics: selectedPredictionType !== 'all' ? selectedPredictionType : ''
      })

      const response = await fetch(`/api/v1/scan-intelligence/trends?${params}`)
      if (!response.ok) throw new Error('Failed to fetch trend analysis')
      const data = await response.json()
      setTrendAnalysis(data.trends || [])
    } catch (error) {
      console.error('Error fetching trend analysis:', error)
    }
  }, [timeRange, selectedPredictionType])

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/analytics/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }, [])

  const generatePrediction = async (predictionType: string, targetTimestamp?: string) => {
    setPredicting(true)
    try {
      const response = await fetch('/api/v1/scan-intelligence/predictions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prediction_type: predictionType,
          model_id: selectedModel !== 'all' ? selectedModel : undefined,
          target_timestamp: targetTimestamp || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          confidence_threshold: confidenceThreshold
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to generate prediction')
      }

      const data = await response.json()
      
      toast({
        title: "Success",
        description: `Prediction generated successfully with ${(data.prediction.confidence_score * 100).toFixed(1)}% confidence`,
      })

      await fetchPredictions()
    } catch (error) {
      console.error('Error generating prediction:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate prediction",
        variant: "destructive"
      })
    } finally {
      setPredicting(false)
    }
  }

  const retrainModel = async (modelId: string) => {
    setRetraining(true)
    try {
      const response = await fetch(`/api/v1/scan-intelligence/models/${modelId}/retrain`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start retraining')
      }

      toast({
        title: "Success",
        description: "Model retraining started successfully",
      })

      await fetchModels()
    } catch (error) {
      console.error('Error retraining model:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start retraining",
        variant: "destructive"
      })
    } finally {
      setRetraining(false)
    }
  }

  // Real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    if (!realTimeUpdates) return

    // WebSocket connection for real-time updates
    const ws = new WebSocket(`wss://${window.location.host}/api/v1/scan-intelligence/predictive/ws`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'prediction_update') {
        setPredictions(prev => {
          const index = prev.findIndex(p => p.id === data.prediction.id)
          if (index >= 0) {
            const updated = [...prev]
            updated[index] = data.prediction
            return updated
          } else {
            return [data.prediction, ...prev.slice(0, 999)]
          }
        })
      } else if (data.type === 'model_update') {
        setModels(prev => prev.map(model => 
          model.id === data.model.id ? { ...model, ...data.model } : model
        ))
      } else if (data.type === 'forecast_update') {
        setForecastData(data.forecast)
      } else if (data.type === 'metrics_update') {
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

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    intervalRef.current = setInterval(() => {
      if (!realTimeUpdates) {
        fetchPredictions()
        fetchMetrics()
      }
    }, refreshInterval * 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh, refreshInterval, realTimeUpdates, fetchPredictions, fetchMetrics])

  // Effects
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchModels(),
        fetchPredictions(),
        fetchForecastData(),
        fetchTrendAnalysis(),
        fetchMetrics()
      ])
      setLoading(false)
    }

    loadData()
  }, [fetchModels, fetchPredictions, fetchForecastData, fetchTrendAnalysis, fetchMetrics])

  useEffect(() => {
    return setupRealTimeUpdates()
  }, [setupRealTimeUpdates])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  // Derived data
  const filteredPredictions = useMemo(() => {
    return predictions.filter(prediction => {
      if (selectedModel !== 'all' && prediction.model_id !== selectedModel) return false
      if (selectedPredictionType !== 'all' && prediction.prediction_type !== selectedPredictionType) return false
      if (!showLowConfidence && prediction.confidence_score < confidenceThreshold) return false
      return true
    })
  }, [predictions, selectedModel, selectedPredictionType, showLowConfidence, confidenceThreshold])

  const chartData = useMemo(() => {
    return forecastData.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp).getTime(),
      date: new Date(item.timestamp).toLocaleDateString(),
      time: new Date(item.timestamp).toLocaleTimeString()
    }))
  }, [forecastData])

  const accuracyData = useMemo(() => {
    if (!metrics) return []
    return metrics.model_performance.accuracy_trend.map((accuracy, index) => ({
      period: index + 1,
      accuracy: accuracy * 100,
      target: 90 // Target accuracy of 90%
    }))
  }, [metrics])

  // Helper functions
  const formatPredictionValue = (value: any, type: string) => {
    if (typeof value === 'number') {
      switch (type) {
        case 'scan_duration':
          return `${value.toFixed(1)} min`
        case 'resource_usage':
          return `${value.toFixed(1)}%`
        case 'data_quality':
          return `${(value * 100).toFixed(1)}%`
        case 'cost_estimation':
          return `$${value.toFixed(2)}`
        case 'failure_probability':
          return `${(value * 100).toFixed(1)}%`
        default:
          return value.toFixed(2)
      }
    }
    return String(value)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeConfig = (type: string) => {
    return PREDICTION_TYPES.find(t => t.value === type) || PREDICTION_TYPES[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading predictive analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Predictive Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            AI-powered predictions, forecasting, and trend analysis for intelligent scan optimization
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
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
          </div>
          <Button 
            onClick={() => generatePrediction(selectedPredictionType !== 'all' ? selectedPredictionType : 'scan_duration')}
            disabled={predicting}
            className="gap-2"
          >
            {predicting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            Generate Prediction
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_predictions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.predictions_today} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics.accuracy_rate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.successful_predictions} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics.average_confidence * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.active_models} active models
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.cost_savings_predicted.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                predicted savings
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
                <Label htmlFor="model-select">Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    {models.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.model_name} ({(model.accuracy * 100).toFixed(1)}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-select">Prediction Type</Label>
                <Select value={selectedPredictionType} onValueChange={setSelectedPredictionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {PREDICTION_TYPES.map(type => (
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

            <div className="flex flex-col justify-end gap-2">
              <div className="space-y-2">
                <Label htmlFor="confidence-threshold">Confidence Threshold: {(confidenceThreshold * 100).toFixed(0)}%</Label>
                <Slider
                  id="confidence-threshold"
                  min={0.5}
                  max={1.0}
                  step={0.05}
                  value={[confidenceThreshold]}
                  onValueChange={(value) => setConfidenceThreshold(value[0])}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-low-confidence"
                  checked={showLowConfidence}
                  onCheckedChange={setShowLowConfidence}
                />
                <Label htmlFor="show-low-confidence" className="text-sm">Show low confidence</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Performance Improvements */}
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Improvements</CardTitle>
                  <CardDescription>Predicted improvements from AI optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Scan Time Reduction</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{metrics.performance_improvements.scan_time_reduction.toFixed(1)}%</span>
                        <Progress value={metrics.performance_improvements.scan_time_reduction} className="w-20 h-2" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Resource Optimization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{metrics.performance_improvements.resource_optimization.toFixed(1)}%</span>
                        <Progress value={metrics.performance_improvements.resource_optimization} className="w-20 h-2" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Quality Improvement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{metrics.performance_improvements.quality_improvement.toFixed(1)}%</span>
                        <Progress value={metrics.performance_improvements.quality_improvement} className="w-20 h-2" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Cost Reduction</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{metrics.performance_improvements.cost_reduction.toFixed(1)}%</span>
                        <Progress value={metrics.performance_improvements.cost_reduction} className="w-20 h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Model Accuracy Trends</CardTitle>
                  <CardDescription>Historical accuracy performance of prediction models</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={accuracyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[60, 100]} />
                      <RechartsTooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Accuracy']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Model Accuracy"
                      />
                      <ReferenceLine y={90} stroke="#82ca9d" strokeDasharray="5 5" label="Target" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Prediction Categories */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Prediction Categories</CardTitle>
                <CardDescription>Distribution and performance by prediction category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metrics.prediction_categories.map((category, index) => {
                    const typeConfig = getTypeConfig(category.category)
                    const IconComponent = typeConfig.icon
                    
                    return (
                      <div key={category.category} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg bg-${typeConfig.color}-100`}>
                            <IconComponent className={`h-4 w-4 text-${typeConfig.color}-600`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{typeConfig.label}</h4>
                            <p className="text-xs text-muted-foreground">{category.count} predictions</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Accuracy</span>
                            <span>{(category.accuracy * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={category.accuracy * 100} className="h-1" />
                          <div className="flex justify-between text-xs">
                            <span>Impact Score</span>
                            <span>{category.impact.toFixed(1)}</span>
                          </div>
                          <Progress value={category.impact * 10} className="h-1" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Predictive Forecasting</CardTitle>
                  <CardDescription>
                    Future predictions with confidence intervals for {getTypeConfig(selectedPredictionType !== 'all' ? selectedPredictionType : 'scan_duration').label}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setChartType('line')}>
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setChartType('area')}>
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    <Switch
                      id="confidence-interval"
                      checked={showConfidenceInterval}
                      onCheckedChange={setShowConfidenceInterval}
                    />
                    <Label htmlFor="confidence-interval" className="text-xs">Confidence</Label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                {chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip 
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value: any, name: string) => [
                        typeof value === 'number' ? value.toFixed(2) : value, 
                        name
                      ]}
                    />
                    <Legend />
                    
                    {showConfidenceInterval && (
                      <Area
                        dataKey="upper_bound"
                        stackId="1"
                        stroke="none"
                        fill="#8884d8"
                        fillOpacity={0.1}
                        name="Confidence Interval"
                      />
                    )}
                    
                    <Area
                      dataKey="predicted"
                      stackId="2"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name="Predicted"
                    />
                    
                    {chartData.some(d => d.actual !== undefined) && (
                      <Area
                        dataKey="actual"
                        stackId="3"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.3}
                        name="Actual"
                      />
                    )}
                  </AreaChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip 
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value: any, name: string) => [
                        typeof value === 'number' ? value.toFixed(2) : value, 
                        name
                      ]}
                    />
                    <Legend />
                    
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Predicted"
                      dot={false}
                    />
                    
                    {chartData.some(d => d.actual !== undefined) && (
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Actual"
                        dot={false}
                      />
                    )}
                    
                    {showConfidenceInterval && (
                      <>
                        <Line
                          type="monotone"
                          dataKey="upper_bound"
                          stroke="#8884d8"
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          name="Upper Bound"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="lower_bound"
                          stroke="#8884d8"
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          name="Lower Bound"
                          dot={false}
                        />
                      </>
                    )}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Trend Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trendAnalysis.map((trend, index) => (
              <Card key={trend.metric}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{trend.metric.replace('_', ' ').toUpperCase()}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.trend_direction)}
                      <Badge variant={
                        trend.significance === 'high' ? 'destructive' :
                        trend.significance === 'medium' ? 'default' : 'secondary'
                      }>
                        {trend.significance}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{trend.forecast_period} forecast</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Current Value</p>
                      <p className="text-lg font-bold">{formatPredictionValue(trend.current_value, trend.metric)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Predicted Value</p>
                      <p className="text-lg font-bold">{formatPredictionValue(trend.predicted_value, trend.metric)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Change</span>
                      <span className={cn(
                        "font-medium",
                        trend.change_percentage > 0 ? "text-green-600" : 
                        trend.change_percentage < 0 ? "text-red-600" : "text-gray-600"
                      )}>
                        {trend.change_percentage > 0 ? '+' : ''}{trend.change_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Confidence</span>
                      <span className={getConfidenceColor(trend.confidence)}>
                        {(trend.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Drivers</p>
                    <div className="flex flex-wrap gap-1">
                      {trend.key_drivers.slice(0, 3).map((driver, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {driver}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {trend.risk_factors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Risk Factors</p>
                      <div className="space-y-1">
                        {trend.risk_factors.slice(0, 2).map((risk, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">{risk}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {trend.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recommendations</p>
                      <div className="space-y-1">
                        {trend.recommendations.slice(0, 2).map((rec, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {/* Recent Predictions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Predictions</CardTitle>
              <CardDescription>Latest AI-generated predictions with confidence scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPredictions.slice(0, 20).map(prediction => {
                  const typeConfig = getTypeConfig(prediction.prediction_type)
                  const IconComponent = typeConfig.icon
                  const isExpanded = expandedPrediction === prediction.id
                  
                  return (
                    <div key={prediction.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-${typeConfig.color}-100`}>
                            <IconComponent className={`h-4 w-4 text-${typeConfig.color}-600`} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{typeConfig.label}</h4>
                              <Badge variant="outline" className="text-xs">
                                {prediction.model_name}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{prediction.explanation}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Target: {new Date(prediction.target_timestamp).toLocaleString()}</span>
                              <span>Generated: {new Date(prediction.prediction_timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPredictionValue(prediction.predicted_value, prediction.prediction_type)}
                            </p>
                            <p className={cn("text-xs", getConfidenceColor(prediction.confidence_score))}>
                              {(prediction.confidence_score * 100).toFixed(1)}% confidence
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedPrediction(isExpanded ? null : prediction.id)}
                          >
                            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Impact Score</p>
                              <div className="flex items-center gap-2">
                                <Progress value={prediction.impact_score * 10} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{prediction.impact_score.toFixed(1)}</span>
                              </div>
                            </div>
                            
                            {prediction.actual_value && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Actual vs Predicted</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">
                                    {formatPredictionValue(prediction.actual_value, prediction.prediction_type)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">actual</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {prediction.recommendation && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recommendation</p>
                              <p className="text-sm">{prediction.recommendation}</p>
                            </div>
                          )}

                          {Object.keys(prediction.input_features).length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Input Features</p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {Object.entries(prediction.input_features).slice(0, 6).map(([key, value]) => (
                                  <div key={key} className="text-xs">
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {filteredPredictions.length === 0 && (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Predictions Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No predictions match your current filters. Try adjusting the filters or generate new predictions.
                  </p>
                  <Button onClick={() => generatePrediction('scan_duration')}>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate First Prediction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          {/* Models Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {models.map(model => (
              <Card key={model.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{model.model_name}</CardTitle>
                      <CardDescription>{model.model_type.replace('_', ' ')}</CardDescription>
                    </div>
                    <Badge className={cn(
                      model.status === 'active' ? 'bg-green-500' :
                      model.status === 'training' ? 'bg-blue-500' :
                      model.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                    )}>
                      {model.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                      <p className="text-sm font-medium">{(model.accuracy * 100).toFixed(1)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                      <p className="text-sm font-medium">{(model.success_rate * 100).toFixed(1)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Predictions</p>
                      <p className="text-sm font-medium">{model.predictions_made.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Training Data</p>
                      <p className="text-sm font-medium">{model.training_data_points.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Performance Metrics</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>MSE: {model.performance_metrics.mse.toFixed(3)}</div>
                      <div>MAE: {model.performance_metrics.mae.toFixed(3)}</div>
                      <div>R²: {model.performance_metrics.r2_score.toFixed(3)}</div>
                      <div>F1: {model.performance_metrics.f1_score.toFixed(3)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {model.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {model.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{model.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Last Updated</span>
                      <span>{new Date(model.last_updated).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Next Update</span>
                      <span>{new Date(model.next_update).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => retrainModel(model.id)}
                      disabled={retraining || model.status === 'training'}
                      className="flex-1"
                    >
                      {retraining ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <RotateCcw className="h-3 w-3 mr-1" />}
                      Retrain
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Info className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs space-y-2">
                            <p className="font-medium">Hyperparameters</p>
                            {Object.entries(model.hyperparameters).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {models.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Predictive Models Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create predictive models to start generating intelligent forecasts and predictions.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Predictive Model
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}