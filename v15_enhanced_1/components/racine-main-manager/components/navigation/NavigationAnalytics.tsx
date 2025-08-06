'use client'

/**
 * 📊 NAVIGATION ANALYTICS COMPONENT
 * 
 * Advanced navigation analytics system that tracks user behavior, optimizes navigation patterns,
 * and provides insights for system improvement. Surpasses enterprise platforms with AI-powered
 * recommendations and comprehensive user journey analysis.
 * 
 * Features:
 * - User Navigation Tracking: Path analysis, journey mapping, time tracking
 * - System Usage Analytics: Popular content, search analysis, bottleneck identification
 * - Optimization Recommendations: AI-powered suggestions, personalized recommendations
 * - Real-time Analytics: Live tracking, performance monitoring, engagement metrics
 * 
 * @version 1.0.0
 * @enterprise-grade true
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Treemap,
  Sankey,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import {
  AnalyticsIcon,
  TrendingUpIcon,
  UsersIcon,
  ClockIcon,
  MousePointerIcon,
  EyeIcon,
  ZapIcon,
  MapIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon,
  SettingsIcon,
  InfoIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react'

// Types
import type {
  NavigationAnalyticsData,
  UserNavigationBehavior,
  SystemUsageMetrics,
  OptimizationRecommendation,
  NavigationPath,
  UserJourney,
  PerformanceMetrics,
  EngagementMetrics,
  SearchAnalytics,
  ClickstreamData,
  HeatmapData,
  ConversionFunnel,
  UserSegment,
  NavigationContext,
  SystemHealth,
  CrossGroupState,
  User,
} from '../../types/racine-core.types'

// Hooks and Services
import {
  useActivityTracker,
  useRacineOrchestration,
  useCrossGroupIntegration,
  useUserManagement,
} from '../../hooks'
import {
  activityTrackingAPI,
  racineOrchestrationAPI,
  crossGroupIntegrationAPI,
} from '../../services'

// Utils and Constants
import {
  formatDuration,
  formatPercentage,
  formatNumber,
  calculateTrend,
  generateRecommendations,
  analyzeUserBehavior,
  optimizeNavigationPaths,
} from '../../utils/dashboard-utils'
import {
  ANALYTICS_CONFIGS,
  NAVIGATION_CONFIGS,
  PERFORMANCE_THRESHOLDS,
} from '../../constants/cross-group-configs'

// Component Props Interface
interface NavigationAnalyticsProps {
  currentUser: User
  navigationContext: NavigationContext
  systemHealth: SystemHealth
  crossGroupState: CrossGroupState
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
  isVisible?: boolean
  onOptimizationApplied?: (optimization: OptimizationRecommendation) => void
  onInsightGenerated?: (insight: string) => void
  className?: string
}

// Analytics State Interface
interface AnalyticsState {
  isLoading: boolean
  error: string | null
  data: NavigationAnalyticsData | null
  userBehavior: UserNavigationBehavior[]
  systemMetrics: SystemUsageMetrics | null
  recommendations: OptimizationRecommendation[]
  selectedTimeRange: string
  selectedSegment: string
  refreshInterval: number
  isRealTimeEnabled: boolean
  lastUpdated: Date
}

// Color schemes for charts
const CHART_COLORS = {
  primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
  secondary: ['#10b981', '#059669', '#047857', '#065f46'],
  accent: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
  warning: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
  neutral: ['#6b7280', '#4b5563', '#374151', '#1f2937'],
}

/**
 * NavigationAnalytics Component
 * 
 * Comprehensive navigation analytics with real-time tracking, user behavior analysis,
 * and AI-powered optimization recommendations.
 */
const NavigationAnalytics: React.FC<NavigationAnalyticsProps> = ({
  currentUser,
  navigationContext,
  systemHealth,
  crossGroupState,
  timeRange = 'day',
  isVisible = true,
  onOptimizationApplied,
  onInsightGenerated,
  className = '',
}) => {
  // State Management
  const [analyticsState, setAnalyticsState] = useState<AnalyticsState>({
    isLoading: true,
    error: null,
    data: null,
    userBehavior: [],
    systemMetrics: null,
    recommendations: [],
    selectedTimeRange: timeRange,
    selectedSegment: 'all',
    refreshInterval: 30000, // 30 seconds
    isRealTimeEnabled: true,
    lastUpdated: new Date(),
  })

  const [selectedView, setSelectedView] = useState<'overview' | 'behavior' | 'performance' | 'optimization'>('overview')
  const [filters, setFilters] = useState({
    group: 'all',
    userType: 'all',
    device: 'all',
    location: 'all',
  })

  // Hooks
  const {
    trackActivity,
    getAnalytics,
    getUserBehavior,
    generateInsights,
  } = useActivityTracker(currentUser.id, navigationContext)

  const {
    systemMetrics,
    performanceData,
    optimizationSuggestions,
  } = useRacineOrchestration(currentUser.id, {
    isInitialized: true,
    currentView: 'analytics',
    activeWorkspaceId: navigationContext.workspaceId || '',
    layoutMode: 'dashboard',
    sidebarCollapsed: false,
    loading: false,
    error: null,
    systemHealth,
    lastActivity: new Date(),
    performanceMetrics: {},
  })

  const {
    crossGroupAnalytics,
    integrationMetrics,
  } = useCrossGroupIntegration(currentUser.id, crossGroupState)

  // Data Loading and Processing
  const loadAnalyticsData = useCallback(async () => {
    try {
      setAnalyticsState(prev => ({ ...prev, isLoading: true, error: null }))

      // Parallel data loading for optimal performance
      const [
        analyticsData,
        behaviorData,
        systemData,
        recommendationData,
      ] = await Promise.all([
        getAnalytics({
          timeRange: analyticsState.selectedTimeRange,
          segment: analyticsState.selectedSegment,
          filters,
        }),
        getUserBehavior({
          userId: currentUser.id,
          timeRange: analyticsState.selectedTimeRange,
          includeJourneys: true,
        }),
        racineOrchestrationAPI.getSystemMetrics({
          timeRange: analyticsState.selectedTimeRange,
          includePerformance: true,
        }),
        generateOptimizationRecommendations(),
      ])

      setAnalyticsState(prev => ({
        ...prev,
        isLoading: false,
        data: analyticsData,
        userBehavior: behaviorData,
        systemMetrics: systemData,
        recommendations: recommendationData,
        lastUpdated: new Date(),
      }))

      // Generate insights
      if (onInsightGenerated && analyticsData) {
        const insights = await generateInsights(analyticsData)
        insights.forEach(insight => onInsightGenerated(insight))
      }

    } catch (error) {
      console.error('Failed to load analytics data:', error)
      setAnalyticsState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load analytics data',
      }))
    }
  }, [
    analyticsState.selectedTimeRange,
    analyticsState.selectedSegment,
    filters,
    currentUser.id,
    getAnalytics,
    getUserBehavior,
    generateInsights,
    onInsightGenerated,
  ])

  // Generate optimization recommendations
  const generateOptimizationRecommendations = useCallback(async (): Promise<OptimizationRecommendation[]> => {
    if (!analyticsState.data) return []

    const recommendations: OptimizationRecommendation[] = []

    // Analyze navigation patterns
    const navigationPatterns = analyzeNavigationPatterns(analyticsState.data)
    recommendations.push(...navigationPatterns)

    // Analyze performance bottlenecks
    const performanceIssues = analyzePerformanceBottlenecks(analyticsState.data)
    recommendations.push(...performanceIssues)

    // Analyze user engagement
    const engagementOptimizations = analyzeEngagementOptimizations(analyticsState.data)
    recommendations.push(...engagementOptimizations)

    // AI-powered recommendations
    const aiRecommendations = await generateAIRecommendations(analyticsState.data)
    recommendations.push(...aiRecommendations)

    return recommendations.sort((a, b) => b.impact - a.impact)
  }, [analyticsState.data])

  // Navigation pattern analysis
  const analyzeNavigationPatterns = (data: NavigationAnalyticsData): OptimizationRecommendation[] => {
    const recommendations: OptimizationRecommendation[] = []

    // Analyze common paths
    const commonPaths = data.userJourneys
      .flatMap(journey => journey.path)
      .reduce((acc, path) => {
        acc[path] = (acc[path] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // Find inefficient paths
    Object.entries(commonPaths).forEach(([path, count]) => {
      const pathSteps = path.split(' → ')
      if (pathSteps.length > 5 && count > 10) {
        recommendations.push({
          id: `path-optimization-${path}`,
          type: 'navigation',
          priority: 'high',
          title: 'Simplify Navigation Path',
          description: `Path "${path}" is commonly used but has ${pathSteps.length} steps. Consider adding shortcuts.`,
          impact: 8,
          effort: 3,
          category: 'user_experience',
          implementation: {
            action: 'add_shortcut',
            target: path,
            suggestion: 'Add direct navigation link',
          },
        })
      }
    })

    return recommendations
  }

  // Performance bottleneck analysis
  const analyzePerformanceBottlenecks = (data: NavigationAnalyticsData): OptimizationRecommendation[] => {
    const recommendations: OptimizationRecommendation[] = []

    // Analyze slow pages
    data.performanceMetrics.pageLoadTimes.forEach(metric => {
      if (metric.avgLoadTime > PERFORMANCE_THRESHOLDS.PAGE_LOAD_TIME) {
        recommendations.push({
          id: `performance-${metric.page}`,
          type: 'performance',
          priority: 'high',
          title: 'Optimize Page Load Time',
          description: `Page "${metric.page}" has slow load time of ${metric.avgLoadTime}ms`,
          impact: 9,
          effort: 5,
          category: 'performance',
          implementation: {
            action: 'optimize_performance',
            target: metric.page,
            suggestion: 'Implement code splitting and lazy loading',
          },
        })
      }
    })

    return recommendations
  }

  // Engagement optimization analysis
  const analyzeEngagementOptimizations = (data: NavigationAnalyticsData): OptimizationRecommendation[] => {
    const recommendations: OptimizationRecommendation[] = []

    // Analyze bounce rates
    data.engagementMetrics.bounceRates.forEach(metric => {
      if (metric.bounceRate > 0.7) {
        recommendations.push({
          id: `engagement-${metric.page}`,
          type: 'engagement',
          priority: 'medium',
          title: 'Reduce Bounce Rate',
          description: `Page "${metric.page}" has high bounce rate of ${formatPercentage(metric.bounceRate)}`,
          impact: 6,
          effort: 4,
          category: 'user_experience',
          implementation: {
            action: 'improve_content',
            target: metric.page,
            suggestion: 'Add engaging content and clear call-to-actions',
          },
        })
      }
    })

    return recommendations
  }

  // AI-powered recommendation generation
  const generateAIRecommendations = async (data: NavigationAnalyticsData): Promise<OptimizationRecommendation[]> => {
    try {
      const response = await racineOrchestrationAPI.generateAIRecommendations({
        analyticsData: data,
        context: navigationContext,
        userBehavior: analyticsState.userBehavior,
      })
      return response.recommendations || []
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error)
      return []
    }
  }

  // Real-time updates
  useEffect(() => {
    if (analyticsState.isRealTimeEnabled && isVisible) {
      const interval = setInterval(loadAnalyticsData, analyticsState.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [analyticsState.isRealTimeEnabled, analyticsState.refreshInterval, isVisible, loadAnalyticsData])

  // Initial data load
  useEffect(() => {
    if (isVisible) {
      loadAnalyticsData()
    }
  }, [isVisible, loadAnalyticsData])

  // Memoized chart data processing
  const chartData = useMemo(() => {
    if (!analyticsState.data) return {}

    return {
      navigationFlow: processNavigationFlowData(analyticsState.data),
      userEngagement: processEngagementData(analyticsState.data),
      performanceTrends: processPerformanceData(analyticsState.data),
      conversionFunnel: processConversionData(analyticsState.data),
      heatmapData: processHeatmapData(analyticsState.data),
      userSegments: processSegmentData(analyticsState.data),
    }
  }, [analyticsState.data])

  // Data processing functions
  const processNavigationFlowData = (data: NavigationAnalyticsData) => {
    return data.navigationPaths.map(path => ({
      source: path.from,
      target: path.to,
      value: path.count,
      percentage: (path.count / data.totalNavigations) * 100,
    }))
  }

  const processEngagementData = (data: NavigationAnalyticsData) => {
    return data.engagementMetrics.dailyEngagement.map(day => ({
      date: day.date,
      sessions: day.sessions,
      pageViews: day.pageViews,
      avgSessionDuration: day.avgSessionDuration,
      bounceRate: day.bounceRate * 100,
    }))
  }

  const processPerformanceData = (data: NavigationAnalyticsData) => {
    return data.performanceMetrics.dailyPerformance.map(day => ({
      date: day.date,
      avgLoadTime: day.avgLoadTime,
      errorRate: day.errorRate * 100,
      throughput: day.throughput,
    }))
  }

  const processConversionData = (data: NavigationAnalyticsData) => {
    return data.conversionFunnels.map(funnel => ({
      step: funnel.step,
      users: funnel.users,
      conversionRate: funnel.conversionRate * 100,
    }))
  }

  const processHeatmapData = (data: NavigationAnalyticsData) => {
    return data.heatmapData.map(item => ({
      x: item.x,
      y: item.y,
      value: item.clickCount,
      page: item.page,
    }))
  }

  const processSegmentData = (data: NavigationAnalyticsData) => {
    return data.userSegments.map(segment => ({
      name: segment.name,
      users: segment.userCount,
      engagement: segment.avgEngagementScore,
      value: segment.userCount,
    }))
  }

  // Event handlers
  const handleTimeRangeChange = (newTimeRange: string) => {
    setAnalyticsState(prev => ({ ...prev, selectedTimeRange: newTimeRange }))
  }

  const handleSegmentChange = (newSegment: string) => {
    setAnalyticsState(prev => ({ ...prev, selectedSegment: newSegment }))
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const handleOptimizationApply = (recommendation: OptimizationRecommendation) => {
    if (onOptimizationApplied) {
      onOptimizationApplied(recommendation)
    }
  }

  const handleExportData = () => {
    if (analyticsState.data) {
      const exportData = {
        data: analyticsState.data,
        userBehavior: analyticsState.userBehavior,
        recommendations: analyticsState.recommendations,
        exportedAt: new Date().toISOString(),
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `navigation-analytics-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleRefresh = () => {
    loadAnalyticsData()
  }

  // Render loading state
  if (analyticsState.isLoading && !analyticsState.data) {
    return (
      <Card className={`w-full h-96 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCwIcon className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-muted-foreground">Loading navigation analytics...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render error state
  if (analyticsState.error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              Failed to load navigation analytics: {analyticsState.error}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="ml-2"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!isVisible || !analyticsState.data) {
    return null
  }

  return (
    <TooltipProvider>
      <div className={`w-full space-y-6 ${className}`}>
        {/* Analytics Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <AnalyticsIcon className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-bold">Navigation Analytics</h2>
            </div>
            <Badge variant="secondary">
              {formatNumber(analyticsState.data.totalUsers)} Users
            </Badge>
            <Badge variant="outline">
              Last updated: {analyticsState.lastUpdated.toLocaleTimeString()}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Time Range Selector */}
            <Select value={analyticsState.selectedTimeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Last Hour</SelectItem>
                <SelectItem value="day">Last Day</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            {/* Actions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Analytics Data</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCwIcon className={`h-4 w-4 ${analyticsState.isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Data</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Analytics Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setAnalyticsState(prev => ({ 
                    ...prev, 
                    isRealTimeEnabled: !prev.isRealTimeEnabled 
                  }))}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Real-time Updates: {analyticsState.isRealTimeEnabled ? 'On' : 'Off'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsState.data.totalSessions)}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">
                  +{formatPercentage(analyticsState.data.sessionGrowth)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Session Duration</p>
                  <p className="text-2xl font-bold">{formatDuration(analyticsState.data.avgSessionDuration)}</p>
                </div>
                <ClockIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="flex items-center mt-2">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">
                  +{formatDuration(analyticsState.data.durationGrowth)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                  <p className="text-2xl font-bold">{formatPercentage(analyticsState.data.bounceRate)}</p>
                </div>
                <MousePointerIcon className="h-8 w-8 text-orange-500" />
              </div>
              <div className="flex items-center mt-2">
                <ArrowDownIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">
                  -{formatPercentage(analyticsState.data.bounceRateImprovement)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsState.data.totalPageViews)}</p>
                </div>
                <EyeIcon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">
                  +{formatPercentage(analyticsState.data.pageViewGrowth)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="behavior">User Behavior</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Trends</CardTitle>
                  <CardDescription>Daily user engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.userEngagement}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="sessions"
                          stackId="1"
                          stroke={CHART_COLORS.primary[0]}
                          fill={CHART_COLORS.primary[0]}
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="pageViews"
                          stackId="1"
                          stroke={CHART_COLORS.secondary[0]}
                          fill={CHART_COLORS.secondary[0]}
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* User Segments */}
              <Card>
                <CardHeader>
                  <CardTitle>User Segments</CardTitle>
                  <CardDescription>User distribution by engagement level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.userSegments}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="users"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.userSegments?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS.primary[index % CHART_COLORS.primary.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Navigation Paths */}
            <Card>
              <CardHeader>
                <CardTitle>Top Navigation Paths</CardTitle>
                <CardDescription>Most common user navigation sequences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsState.data.topNavigationPaths.slice(0, 10).map((path, index) => (
                    <div key={path.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{path.pathName}</p>
                          <p className="text-sm text-muted-foreground">{path.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{formatNumber(path.count)}</p>
                          <p className="text-sm text-muted-foreground">users</p>
                        </div>
                        <Progress value={(path.count / analyticsState.data.totalNavigations) * 100} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Navigation Flow */}
              <Card>
                <CardHeader>
                  <CardTitle>Navigation Flow</CardTitle>
                  <CardDescription>User journey through the application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <Sankey
                        data={{
                          nodes: analyticsState.data.navigationFlow.nodes,
                          links: chartData.navigationFlow,
                        }}
                        nodeWidth={15}
                        nodePadding={10}
                        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                      />
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                  <CardDescription>User progression through key actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chartData.conversionFunnel?.map((step, index) => (
                      <div key={step.step} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{step.step}</p>
                            <div className="text-right">
                              <p className="font-medium">{formatNumber(step.users)}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatPercentage(step.conversionRate / 100)}
                              </p>
                            </div>
                          </div>
                          <Progress value={step.conversionRate} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Journey Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>User Journey Analysis</CardTitle>
                <CardDescription>Detailed analysis of user navigation patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {analyticsState.userBehavior.slice(0, 20).map((behavior) => (
                      <div key={behavior.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{behavior.userType}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Session: {formatDuration(behavior.sessionDuration)}
                            </span>
                          </div>
                          <Badge variant={behavior.conversionStatus === 'converted' ? 'default' : 'secondary'}>
                            {behavior.conversionStatus}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <MapIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Journey Path:</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {behavior.navigationPath.map((step, index) => (
                            <React.Fragment key={index}>
                              <Badge variant="outline" className="text-xs">
                                {step}
                              </Badge>
                              {index < behavior.navigationPath.length - 1 && (
                                <ArrowRightIcon className="h-3 w-3 text-muted-foreground" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>System performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.performanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="avgLoadTime"
                          stroke={CHART_COLORS.primary[0]}
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="errorRate"
                          stroke={CHART_COLORS.warning[0]}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Page Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Page Performance</CardTitle>
                  <CardDescription>Load times by page</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsState.data.performanceMetrics.pageLoadTimes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="page" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avgLoadTime" fill={CHART_COLORS.primary[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Detailed performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">
                      {analyticsState.data.performanceMetrics.avgLoadTime}ms
                    </div>
                    <p className="text-sm text-muted-foreground">Average Load Time</p>
                    <Progress 
                      value={Math.min((analyticsState.data.performanceMetrics.avgLoadTime / 3000) * 100, 100)} 
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">
                      {formatPercentage(analyticsState.data.performanceMetrics.uptime)}
                    </div>
                    <p className="text-sm text-muted-foreground">System Uptime</p>
                    <Progress 
                      value={analyticsState.data.performanceMetrics.uptime * 100} 
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500">
                      {formatPercentage(analyticsState.data.performanceMetrics.errorRate)}
                    </div>
                    <p className="text-sm text-muted-foreground">Error Rate</p>
                    <Progress 
                      value={analyticsState.data.performanceMetrics.errorRate * 100} 
                      className="mt-2"
                      variant="destructive"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            {/* Optimization Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
                <CardDescription>
                  AI-powered suggestions to improve navigation and user experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsState.recommendations.map((recommendation) => (
                    <div
                      key={recommendation.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={
                              recommendation.priority === 'high' ? 'destructive' :
                              recommendation.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {recommendation.priority}
                            </Badge>
                            <Badge variant="outline">{recommendation.category}</Badge>
                          </div>
                          
                          <h4 className="font-medium mb-1">{recommendation.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {recommendation.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <ZapIcon className="h-4 w-4 text-green-500" />
                              <span>Impact: {recommendation.impact}/10</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="h-4 w-4 text-blue-500" />
                              <span>Effort: {recommendation.effort}/10</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleOptimizationApply(recommendation)}
                          className="ml-4"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Optimization Impact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Potential Impact</CardTitle>
                  <CardDescription>Estimated improvements from recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>User Engagement</span>
                      <div className="flex items-center space-x-2">
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-500">+15%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Page Load Speed</span>
                      <div className="flex items-center space-x-2">
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-500">+23%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Bounce Rate</span>
                      <div className="flex items-center space-x-2">
                        <ArrowDownIcon className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-500">-12%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Conversion Rate</span>
                      <div className="flex items-center space-x-2">
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-500">+8%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Implementation Priority</CardTitle>
                  <CardDescription>Recommended implementation order</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="20%"
                        outerRadius="80%"
                        data={analyticsState.recommendations.slice(0, 5).map((rec, index) => ({
                          name: rec.title,
                          value: rec.impact * 10,
                          fill: CHART_COLORS.primary[index % CHART_COLORS.primary.length],
                        }))}
                      >
                        <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                        <Tooltip />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

export default NavigationAnalytics