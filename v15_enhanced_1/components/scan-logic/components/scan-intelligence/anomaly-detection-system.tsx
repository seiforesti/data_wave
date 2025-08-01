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
import { AlertTriangle, Shield, Eye, Brain, Zap, Activity, Target, Search, Filter, Bell, Settings, Info, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, RefreshCw, Download, Upload, Play, Pause, Stop, AlertCircle, Lightbulb, Gauge, Database, Network, Cpu, HardDrive, Calendar, History, ExternalLink, Maximize2, Minimize2, ChevronDown, ChevronUp, Plus, Minus, Edit, Trash2, Save, X } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, FunnelChart, Funnel, LabelList } from 'recharts'
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Enhanced Types for Anomaly Detection System
interface AnomalyDetector {
  id: string
  detector_id: string
  detector_name: string
  anomaly_type: 'statistical' | 'pattern_based' | 'machine_learning' | 'rule_based' | 'behavioral' | 'threshold' | 'temporal' | 'multivariate'
  detection_method: 'isolation_forest' | 'one_class_svm' | 'local_outlier_factor' | 'dbscan' | 'z_score' | 'iqr' | 'lstm_autoencoder' | 'gaussian_mixture' | 'statistical_process_control'
  status: 'active' | 'inactive' | 'training' | 'calibrating' | 'error' | 'maintenance'
  sensitivity: number
  confidence_threshold: number
  false_positive_rate: number
  true_positive_rate: number
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  data_sources: string[]
  target_features: string[]
  training_period: string
  detection_window: string
  alert_rules: AlertRule[]
  configuration: {
    min_samples: number
    contamination: number
    window_size: number
    n_estimators: number
    learning_rate: number
    batch_size: number
    epochs: number
    threshold_multiplier: number
    seasonality_period: number
    trend_sensitivity: number
  }
  created_at: string
  updated_at: string
  last_trained: string
  next_training: string
  created_by: string
}

interface AnomalyEvent {
  id: string
  event_id: string
  detector_id: string
  detector_name: string
  anomaly_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'false_positive' | 'suppressed'
  confidence_score: number
  anomaly_score: number
  detected_at: string
  resolved_at?: string
  data_source: string
  affected_entities: string[]
  feature_contributions: Record<string, number>
  description: string
  explanation: string
  root_cause_analysis?: string
  impact_assessment: {
    scope: 'local' | 'regional' | 'system_wide' | 'critical_system'
    affected_users: number
    business_impact: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
    estimated_cost: number
    recovery_time_estimate: string
  }
  recommendations: string[]
  similar_events: string[]
  correlation_events: string[]
  tags: string[]
  metadata: Record<string, any>
  assignee?: string
  notes: string[]
}

interface AnomalyPattern {
  id: string
  pattern_id: string
  pattern_name: string
  pattern_type: 'recurring' | 'seasonal' | 'trending' | 'clustered' | 'correlated' | 'cascade' | 'spike' | 'drift'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'irregular'
  confidence: number
  occurrences: number
  first_detected: string
  last_detected: string
  average_severity: number
  affected_systems: string[]
  common_features: string[]
  pattern_signature: Record<string, any>
  prediction_accuracy: number
  next_expected_occurrence?: string
  mitigation_strategies: string[]
  related_patterns: string[]
}

interface AlertRule {
  id: string
  rule_name: string
  enabled: boolean
  conditions: {
    anomaly_score_threshold: number
    severity_levels: string[]
    confidence_threshold: number
    consecutive_detections: number
    time_window: string
    features: string[]
  }
  actions: {
    send_notification: boolean
    create_ticket: boolean
    trigger_webhook: boolean
    auto_investigate: boolean
    escalate_after: string
  }
  notification_channels: string[]
  escalation_policy: string
  suppression_rules: {
    enabled: boolean
    conditions: string[]
    duration: string
  }
}

interface DetectionMetrics {
  total_detectors: number
  active_detectors: number
  total_anomalies: number
  open_anomalies: number
  resolved_anomalies: number
  false_positives: number
  average_detection_time: number
  average_resolution_time: number
  detection_accuracy: number
  system_coverage: number
  anomaly_trends: {
    hourly: number[]
    daily: number[]
    weekly: number[]
    severity_distribution: { severity: string; count: number }[]
    type_distribution: { type: string; count: number }[]
  }
  performance_metrics: {
    processing_latency: number
    throughput_per_second: number
    memory_usage: number
    cpu_usage: number
    storage_usage: number
  }
}

interface RealTimeAnomalyData {
  timestamp: string
  data_source: string
  feature_name: string
  actual_value: number
  expected_value: number
  anomaly_score: number
  threshold: number
  is_anomaly: boolean
  contributing_factors: string[]
  context: Record<string, any>
}

const ANOMALY_TYPES = [
  { value: 'statistical', label: 'Statistical Anomalies', icon: BarChart3, color: 'blue', description: 'Detect statistical deviations from normal patterns' },
  { value: 'pattern_based', label: 'Pattern-Based', icon: Target, color: 'green', description: 'Identify anomalies based on learned patterns' },
  { value: 'machine_learning', label: 'Machine Learning', icon: Brain, color: 'purple', description: 'AI-powered anomaly detection' },
  { value: 'rule_based', label: 'Rule-Based', icon: Shield, color: 'orange', description: 'Detect anomalies using predefined rules' },
  { value: 'behavioral', label: 'Behavioral', icon: Activity, color: 'pink', description: 'Detect abnormal behavior patterns' },
  { value: 'threshold', label: 'Threshold-Based', icon: Gauge, color: 'red', description: 'Threshold-based anomaly detection' },
  { value: 'temporal', label: 'Temporal', icon: Clock, color: 'cyan', description: 'Time-series anomaly detection' },
  { value: 'multivariate', label: 'Multivariate', icon: TrendingUp, color: 'yellow', description: 'Multi-dimensional anomaly detection' }
]

const DETECTION_METHODS = [
  { value: 'isolation_forest', label: 'Isolation Forest', description: 'Tree-based anomaly detection algorithm' },
  { value: 'one_class_svm', label: 'One-Class SVM', description: 'Support vector machine for outlier detection' },
  { value: 'local_outlier_factor', label: 'Local Outlier Factor', description: 'Density-based anomaly detection' },
  { value: 'dbscan', label: 'DBSCAN', description: 'Clustering-based outlier detection' },
  { value: 'z_score', label: 'Z-Score', description: 'Statistical z-score based detection' },
  { value: 'iqr', label: 'IQR Method', description: 'Interquartile range outlier detection' },
  { value: 'lstm_autoencoder', label: 'LSTM Autoencoder', description: 'Deep learning reconstruction error' },
  { value: 'gaussian_mixture', label: 'Gaussian Mixture Model', description: 'Probabilistic anomaly detection' },
  { value: 'statistical_process_control', label: 'Statistical Process Control', description: 'Control chart based detection' }
]

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-500', description: 'Minor anomalies with minimal impact' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500', description: 'Moderate anomalies requiring attention' },
  { value: 'high', label: 'High', color: 'bg-orange-500', description: 'Significant anomalies needing investigation' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500', description: 'Critical anomalies requiring immediate action' }
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

const CHART_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899']

export default function AnomalyDetectionSystem() {
  // State management
  const [detectors, setDetectors] = useState<AnomalyDetector[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([])
  const [patterns, setPatterns] = useState<AnomalyPattern[]>([])
  const [metrics, setMetrics] = useState<DetectionMetrics | null>(null)
  const [realTimeData, setRealTimeData] = useState<RealTimeAnomalyData[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [investigating, setInvestigating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDetector, setSelectedDetector] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('1d')
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [autoInvestigation, setAutoInvestigation] = useState(false)
  const [sensitivityThreshold, setSensitivityThreshold] = useState(0.7)
  const [showResolved, setShowResolved] = useState(false)
  const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<string>('detected_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedAnomalies, setSelectedAnomalies] = useState<string[]>([])
  const [showCreateDetectorModal, setShowCreateDetectorModal] = useState(false)
  const [showAnomalyDetailsModal, setShowAnomalyDetailsModal] = useState(false)
  const [selectedAnomalyForDetails, setSelectedAnomalyForDetails] = useState<AnomalyEvent | null>(null)

  // Refs for real-time updates
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Form state for new detector
  const [newDetector, setNewDetector] = useState({
    detector_name: '',
    anomaly_type: 'machine_learning' as const,
    detection_method: 'isolation_forest' as const,
    sensitivity: 0.7,
    confidence_threshold: 0.8,
    data_sources: [] as string[],
    target_features: [] as string[],
    configuration: {
      min_samples: 100,
      contamination: 0.1,
      window_size: 24,
      n_estimators: 100,
      learning_rate: 0.001,
      batch_size: 32,
      epochs: 100,
      threshold_multiplier: 2.0,
      seasonality_period: 24,
      trend_sensitivity: 0.1
    }
  })

  // API functions
  const fetchDetectors = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/anomaly/detectors')
      if (!response.ok) throw new Error('Failed to fetch detectors')
      const data = await response.json()
      setDetectors(data.detectors || [])
    } catch (error) {
      console.error('Error fetching detectors:', error)
      toast({
        title: "Error",
        description: "Failed to fetch anomaly detectors",
        variant: "destructive"
      })
    }
  }, [])

  const fetchAnomalies = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        time_range: timeRange,
        detector_id: selectedDetector !== 'all' ? selectedDetector : '',
        severity: selectedSeverity !== 'all' ? selectedSeverity : '',
        status: selectedStatus !== 'all' ? selectedStatus : '',
        include_resolved: showResolved.toString()
      })

      const response = await fetch(`/api/v1/scan-intelligence/anomaly/events?${params}`)
      if (!response.ok) throw new Error('Failed to fetch anomalies')
      const data = await response.json()
      setAnomalies(data.anomalies || [])
    } catch (error) {
      console.error('Error fetching anomalies:', error)
    }
  }, [timeRange, selectedDetector, selectedSeverity, selectedStatus, showResolved])

  const fetchPatterns = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/anomaly/patterns')
      if (!response.ok) throw new Error('Failed to fetch patterns')
      const data = await response.json()
      setPatterns(data.patterns || [])
    } catch (error) {
      console.error('Error fetching patterns:', error)
    }
  }, [])

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/anomaly/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }, [])

  const fetchRealTimeData = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/scan-intelligence/anomaly/realtime')
      if (!response.ok) throw new Error('Failed to fetch real-time data')
      const data = await response.json()
      setRealTimeData(data.data || [])
    } catch (error) {
      console.error('Error fetching real-time data:', error)
    }
  }, [])

  const createDetector = async () => {
    if (!newDetector.detector_name.trim()) {
      toast({
        title: "Error",
        description: "Detector name is required",
        variant: "destructive"
      })
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/v1/scan-intelligence/anomaly/detectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDetector)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create detector')
      }

      toast({
        title: "Success",
        description: `Anomaly detector "${newDetector.detector_name}" created successfully`,
      })

      setShowCreateDetectorModal(false)
      setNewDetector({
        detector_name: '',
        anomaly_type: 'machine_learning',
        detection_method: 'isolation_forest',
        sensitivity: 0.7,
        confidence_threshold: 0.8,
        data_sources: [],
        target_features: [],
        configuration: {
          min_samples: 100,
          contamination: 0.1,
          window_size: 24,
          n_estimators: 100,
          learning_rate: 0.001,
          batch_size: 32,
          epochs: 100,
          threshold_multiplier: 2.0,
          seasonality_period: 24,
          trend_sensitivity: 0.1
        }
      })

      await fetchDetectors()
    } catch (error) {
      console.error('Error creating detector:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create detector",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const updateAnomalyStatus = async (anomalyId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/v1/scan-intelligence/anomaly/events/${anomalyId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to update status')
      }

      toast({
        title: "Success",
        description: `Anomaly status updated to ${status}`,
      })

      await fetchAnomalies()
    } catch (error) {
      console.error('Error updating anomaly status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive"
      })
    }
  }

  const investigateAnomaly = async (anomalyId: string) => {
    setInvestigating(true)
    try {
      const response = await fetch(`/api/v1/scan-intelligence/anomaly/events/${anomalyId}/investigate`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start investigation')
      }

      toast({
        title: "Success",
        description: "Anomaly investigation started",
      })

      await fetchAnomalies()
    } catch (error) {
      console.error('Error investigating anomaly:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start investigation",
        variant: "destructive"
      })
    } finally {
      setInvestigating(false)
    }
  }

  const toggleDetectorStatus = async (detectorId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const response = await fetch(`/api/v1/scan-intelligence/anomaly/detectors/${detectorId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to update detector status')
      }

      toast({
        title: "Success",
        description: `Detector ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      })

      await fetchDetectors()
    } catch (error) {
      console.error('Error updating detector status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update detector status",
        variant: "destructive"
      })
    }
  }

  // Real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    if (!realTimeEnabled) return

    const ws = new WebSocket(`wss://${window.location.host}/api/v1/scan-intelligence/anomaly/ws`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'anomaly_detected') {
        setAnomalies(prev => [data.anomaly, ...prev.slice(0, 999)])
        if (alertsEnabled) {
          toast({
            title: "Anomaly Detected",
            description: `${data.anomaly.severity.toUpperCase()} anomaly detected in ${data.anomaly.data_source}`,
            variant: data.anomaly.severity === 'critical' || data.anomaly.severity === 'high' ? "destructive" : "default"
          })
        }
      } else if (data.type === 'anomaly_updated') {
        setAnomalies(prev => prev.map(anomaly => 
          anomaly.id === data.anomaly.id ? { ...anomaly, ...data.anomaly } : anomaly
        ))
      } else if (data.type === 'detector_updated') {
        setDetectors(prev => prev.map(detector => 
          detector.id === data.detector.id ? { ...detector, ...data.detector } : detector
        ))
      } else if (data.type === 'metrics_updated') {
        setMetrics(data.metrics)
      } else if (data.type === 'realtime_data') {
        setRealTimeData(prev => [data.data, ...prev.slice(0, 499)])
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [realTimeEnabled, alertsEnabled])

  // Effects
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchDetectors(),
        fetchAnomalies(),
        fetchPatterns(),
        fetchMetrics(),
        fetchRealTimeData()
      ])
      setLoading(false)
    }

    loadData()
  }, [fetchDetectors, fetchAnomalies, fetchPatterns, fetchMetrics, fetchRealTimeData])

  useEffect(() => {
    return setupRealTimeUpdates()
  }, [setupRealTimeUpdates])

  useEffect(() => {
    if (!realTimeEnabled) return

    intervalRef.current = setInterval(() => {
      fetchRealTimeData()
      fetchMetrics()
    }, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [realTimeEnabled, fetchRealTimeData, fetchMetrics])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  // Derived data
  const filteredAnomalies = useMemo(() => {
    let filtered = anomalies

    if (searchTerm) {
      filtered = filtered.filter(anomaly => 
        anomaly.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        anomaly.data_source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        anomaly.detector_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedDetector !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.detector_id === selectedDetector)
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.severity === selectedSeverity)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.status === selectedStatus)
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof AnomalyEvent]
      const bValue = b[sortBy as keyof AnomalyEvent]
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [anomalies, searchTerm, selectedDetector, selectedSeverity, selectedStatus, sortBy, sortOrder])

  const chartData = useMemo(() => {
    if (!metrics) return []
    return metrics.anomaly_trends.hourly.map((count, index) => ({
      hour: index,
      anomalies: count,
      timestamp: new Date(Date.now() - (23 - index) * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit' })
    }))
  }, [metrics])

  const severityData = useMemo(() => {
    if (!metrics) return []
    return metrics.anomaly_trends.severity_distribution.map((item, index) => ({
      ...item,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }))
  }, [metrics])

  const typeData = useMemo(() => {
    if (!metrics) return []
    return metrics.anomaly_trends.type_distribution.map((item, index) => ({
      ...item,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }))
  }, [metrics])

  // Helper functions
  const getSeverityColor = (severity: string) => {
    const severityConfig = SEVERITY_LEVELS.find(s => s.value === severity)
    return severityConfig?.color || 'bg-gray-500'
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = ANOMALY_TYPES.find(t => t.value === type)
    return typeConfig?.icon || AlertTriangle
  }

  const getTypeColor = (type: string) => {
    const typeConfig = ANOMALY_TYPES.find(t => t.value === type)
    return typeConfig?.color || 'gray'
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const calculateConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading anomaly detection system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Anomaly Detection System</h2>
          <p className="text-muted-foreground">
            Real-time anomaly detection with ML-powered pattern recognition and intelligent alerts
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="real-time-enabled"
              checked={realTimeEnabled}
              onCheckedChange={setRealTimeEnabled}
            />
            <Label htmlFor="real-time-enabled" className="text-sm">Real-time</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="alerts-enabled"
              checked={alertsEnabled}
              onCheckedChange={setAlertsEnabled}
            />
            <Label htmlFor="alerts-enabled" className="text-sm">Alerts</Label>
          </div>
          <Button onClick={() => setShowCreateDetectorModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Detector
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Detectors</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.active_detectors}</div>
              <p className="text-xs text-muted-foreground">
                of {metrics.total_detectors} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Anomalies</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.open_anomalies}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.total_anomalies} total detected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics.detection_accuracy * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.false_positives} false positives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.average_resolution_time.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground">
                {metrics.average_detection_time.toFixed(1)}min detection
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
                <Label htmlFor="detector-select">Detector</Label>
                <Select value={selectedDetector} onValueChange={setSelectedDetector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select detector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Detectors</SelectItem>
                    {detectors.map(detector => (
                      <SelectItem key={detector.id} value={detector.id}>
                        {detector.detector_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity-select">Severity</Label>
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    {SEVERITY_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
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
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="false_positive">False Positive</SelectItem>
                    <SelectItem value="suppressed">Suppressed</SelectItem>
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
                <Label htmlFor="sensitivity">Sensitivity: {(sensitivityThreshold * 100).toFixed(0)}%</Label>
                <Slider
                  id="sensitivity"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={[sensitivityThreshold]}
                  onValueChange={(value) => setSensitivityThreshold(value[0])}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-resolved"
                  checked={showResolved}
                  onCheckedChange={setShowResolved}
                />
                <Label htmlFor="show-resolved" className="text-sm">Include resolved</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="detectors">Detectors</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Anomaly Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Detection Trends (24h)</CardTitle>
                <CardDescription>Hourly anomaly detection counts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="anomalies"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.3}
                      name="Anomalies Detected"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Distribution of anomalies by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* System Performance */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time performance metrics of the anomaly detection system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Processing Latency</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.performance_metrics.processing_latency.toFixed(1)}ms</div>
                    <Progress value={Math.min((metrics.performance_metrics.processing_latency / 1000) * 100, 100)} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Throughput</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.performance_metrics.throughput_per_second.toFixed(0)}/s</div>
                    <Progress value={Math.min((metrics.performance_metrics.throughput_per_second / 1000) * 100, 100)} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.performance_metrics.cpu_usage.toFixed(1)}%</div>
                    <Progress value={metrics.performance_metrics.cpu_usage} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Memory Usage</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.performance_metrics.memory_usage.toFixed(1)}%</div>
                    <Progress value={metrics.performance_metrics.memory_usage} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Critical Anomalies */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Critical Anomalies</CardTitle>
              <CardDescription>Latest high-severity anomalies requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAnomalies
                  .filter(anomaly => anomaly.severity === 'critical' || anomaly.severity === 'high')
                  .slice(0, 5)
                  .map(anomaly => (
                    <div key={anomaly.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", getSeverityColor(anomaly.severity))} />
                        <div>
                          <h4 className="font-medium">{anomaly.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {anomaly.data_source} • {formatTimestamp(anomaly.detected_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{anomaly.status}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAnomalyForDetails(anomaly)
                            setShowAnomalyDetailsModal(true)
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                
                {filteredAnomalies.filter(anomaly => anomaly.severity === 'critical' || anomaly.severity === 'high').length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Critical Anomalies</h3>
                    <p className="text-muted-foreground">All systems are operating normally</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search anomalies..."
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

          {/* Anomalies List */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {filteredAnomalies.map(anomaly => {
                  const isExpanded = expandedAnomaly === anomaly.id
                  
                  return (
                    <div key={anomaly.id} className="border-b last:border-b-0">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={cn("w-3 h-3 rounded-full mt-1", getSeverityColor(anomaly.severity))} />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{anomaly.description}</h4>
                                <Badge variant="outline">{anomaly.severity}</Badge>
                                <Badge variant="secondary">{anomaly.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{anomaly.explanation}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Detector: {anomaly.detector_name}</span>
                                <span>Source: {anomaly.data_source}</span>
                                <span>Detected: {formatTimestamp(anomaly.detected_at)}</span>
                                <span className={calculateConfidenceColor(anomaly.confidence_score)}>
                                  Confidence: {(anomaly.confidence_score * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => investigateAnomaly(anomaly.id)}
                              disabled={investigating || anomaly.status === 'investigating'}
                            >
                              {investigating ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Search className="h-3 w-3 mr-1" />}
                              Investigate
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedAnomaly(isExpanded ? null : anomaly.id)}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            {/* Feature Contributions */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Feature Contributions</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Object.entries(anomaly.feature_contributions).slice(0, 6).map(([feature, contribution]) => (
                                  <div key={feature} className="flex items-center justify-between text-sm">
                                    <span>{feature}</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={Math.abs(contribution) * 100} className="w-16 h-2" />
                                      <span className="text-xs w-12 text-right">{(contribution * 100).toFixed(1)}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Impact Assessment */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Impact Assessment</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Scope:</span>
                                  <p className="font-medium">{anomaly.impact_assessment.scope}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Business Impact:</span>
                                  <p className="font-medium">{anomaly.impact_assessment.business_impact}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Affected Users:</span>
                                  <p className="font-medium">{anomaly.impact_assessment.affected_users.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Recovery Time:</span>
                                  <p className="font-medium">{anomaly.impact_assessment.recovery_time_estimate}</p>
                                </div>
                              </div>
                            </div>

                            {/* Recommendations */}
                            {anomaly.recommendations.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium">Recommendations</h5>
                                <div className="space-y-1">
                                  {anomaly.recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                      <p className="text-sm text-muted-foreground">{rec}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateAnomalyStatus(anomaly.id, 'resolved')}
                                disabled={anomaly.status === 'resolved'}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark Resolved
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateAnomalyStatus(anomaly.id, 'false_positive')}
                                disabled={anomaly.status === 'false_positive'}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                False Positive
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateAnomalyStatus(anomaly.id, 'suppressed')}
                                disabled={anomaly.status === 'suppressed'}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Suppress
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredAnomalies.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Anomalies Found</h3>
                  <p className="text-muted-foreground">
                    {anomalies.length === 0 
                      ? "No anomalies have been detected yet" 
                      : "No anomalies match your current filters"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detectors" className="space-y-4">
          {/* Detectors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {detectors.map(detector => {
              const TypeIcon = getTypeIcon(detector.anomaly_type)
              
              return (
                <Card key={detector.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${getTypeColor(detector.anomaly_type)}-100`}>
                          <TypeIcon className={`h-5 w-5 text-${getTypeColor(detector.anomaly_type)}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{detector.detector_name}</CardTitle>
                          <CardDescription>
                            {ANOMALY_TYPES.find(t => t.value === detector.anomaly_type)?.label}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={cn(
                        detector.status === 'active' ? 'bg-green-500' :
                        detector.status === 'training' ? 'bg-blue-500' :
                        detector.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                      )}>
                        {detector.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                        <p className="text-sm font-medium">{(detector.accuracy * 100).toFixed(1)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Precision</p>
                        <p className="text-sm font-medium">{(detector.precision * 100).toFixed(1)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Recall</p>
                        <p className="text-sm font-medium">{(detector.recall * 100).toFixed(1)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">F1 Score</p>
                        <p className="text-sm font-medium">{(detector.f1_score * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Configuration */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Configuration</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Method: {detector.detection_method}</div>
                        <div>Sensitivity: {(detector.sensitivity * 100).toFixed(0)}%</div>
                        <div>Threshold: {(detector.confidence_threshold * 100).toFixed(0)}%</div>
                        <div>Window: {detector.detection_window}</div>
                      </div>
                    </div>

                    {/* Data Sources */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data Sources</p>
                      <div className="flex flex-wrap gap-1">
                        {detector.data_sources.slice(0, 3).map((source, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                        {detector.data_sources.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{detector.data_sources.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Training Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Last Trained</span>
                        <span>{new Date(detector.last_trained).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Next Training</span>
                        <span>{new Date(detector.next_training).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDetectorStatus(detector.id, detector.status)}
                        disabled={detector.status === 'training' || detector.status === 'calibrating'}
                        className="flex-1"
                      >
                        {detector.status === 'active' ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                        {detector.status === 'active' ? 'Deactivate' : 'Activate'}
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

          {detectors.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Detectors Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first anomaly detector to start monitoring for anomalies.
                </p>
                <Button onClick={() => setShowCreateDetectorModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Detector
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          {/* Patterns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {patterns.map(pattern => (
              <Card key={pattern.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pattern.pattern_name}</CardTitle>
                    <Badge variant={
                      pattern.confidence >= 0.8 ? 'default' :
                      pattern.confidence >= 0.6 ? 'secondary' : 'outline'
                    }>
                      {(pattern.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                  <CardDescription>
                    {pattern.pattern_type} • {pattern.frequency} frequency
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Occurrences</p>
                      <p className="text-sm font-medium">{pattern.occurrences}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Avg Severity</p>
                      <p className="text-sm font-medium">{pattern.average_severity.toFixed(1)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">First Detected</p>
                      <p className="text-sm font-medium">{new Date(pattern.first_detected).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Last Detected</p>
                      <p className="text-sm font-medium">{new Date(pattern.last_detected).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {pattern.next_expected_occurrence && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Next Expected Occurrence</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(pattern.next_expected_occurrence).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {pattern.affected_systems.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Affected Systems</p>
                      <div className="flex flex-wrap gap-1">
                        {pattern.affected_systems.slice(0, 3).map((system, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                        {pattern.affected_systems.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{pattern.affected_systems.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {pattern.mitigation_strategies.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mitigation Strategies</p>
                      <div className="space-y-1">
                        {pattern.mitigation_strategies.slice(0, 2).map((strategy, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Shield className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">{strategy}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {patterns.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Patterns Detected</h3>
                <p className="text-muted-foreground">
                  Anomaly patterns will appear here as the system learns from detected anomalies.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          {/* Real-time Data Stream */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Real-time Anomaly Detection Stream</CardTitle>
                  <CardDescription>Live data feed with anomaly scores and detection results</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", realTimeEnabled ? "bg-green-500" : "bg-gray-400")} />
                  <span className="text-sm">{realTimeEnabled ? 'Live' : 'Paused'}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {realTimeData.slice(0, 50).map((data, index) => (
                  <div key={index} className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    data.is_anomaly ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" : "bg-gray-50 dark:bg-gray-950"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        data.is_anomaly ? "bg-red-500" : "bg-green-500"
                      )} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{data.data_source}</span>
                          <span className="text-xs text-muted-foreground">{data.feature_name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(data.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {data.actual_value.toFixed(2)} {data.is_anomaly ? '(!)' : ''}
                      </div>
                      <div className={cn(
                        "text-xs",
                        data.anomaly_score >= data.threshold ? "text-red-600" : "text-green-600"
                      )}>
                        Score: {data.anomaly_score.toFixed(3)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {realTimeData.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Waiting for real-time data...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics Overview */}
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Type Distribution</CardTitle>
                  <CardDescription>Distribution of detected anomalies by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={typeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detection Performance Metrics</CardTitle>
                  <CardDescription>System performance and efficiency metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{(metrics.detection_accuracy * 100).toFixed(1)}%</div>
                        <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{(metrics.system_coverage * 100).toFixed(1)}%</div>
                        <p className="text-sm text-muted-foreground">System Coverage</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{metrics.average_detection_time.toFixed(1)}min</div>
                        <p className="text-sm text-muted-foreground">Avg Detection Time</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{metrics.average_resolution_time.toFixed(1)}h</div>
                        <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Detector Modal */}
      {showCreateDetectorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Create Anomaly Detector</CardTitle>
                  <CardDescription>Configure a new anomaly detection system</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateDetectorModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="detector-name">Detector Name</Label>
                  <Input
                    id="detector-name"
                    placeholder="Enter detector name..."
                    value={newDetector.detector_name}
                    onChange={(e) => setNewDetector(prev => ({ ...prev, detector_name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="anomaly-type">Anomaly Type</Label>
                    <Select
                      value={newDetector.anomaly_type}
                      onValueChange={(value: any) => setNewDetector(prev => ({ ...prev, anomaly_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ANOMALY_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="detection-method">Detection Method</Label>
                    <Select
                      value={newDetector.detection_method}
                      onValueChange={(value: any) => setNewDetector(prev => ({ ...prev, detection_method: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DETECTION_METHODS.map(method => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sensitivity">Sensitivity: {(newDetector.sensitivity * 100).toFixed(0)}%</Label>
                    <Slider
                      id="sensitivity"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={[newDetector.sensitivity]}
                      onValueChange={(value) => setNewDetector(prev => ({ ...prev, sensitivity: value[0] }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confidence">Confidence Threshold: {(newDetector.confidence_threshold * 100).toFixed(0)}%</Label>
                    <Slider
                      id="confidence"
                      min={0.5}
                      max={1.0}
                      step={0.05}
                      value={[newDetector.confidence_threshold]}
                      onValueChange={(value) => setNewDetector(prev => ({ ...prev, confidence_threshold: value[0] }))}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateDetectorModal(false)}>
                  Cancel
                </Button>
                <Button onClick={createDetector} disabled={creating}>
                  {creating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Detector
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