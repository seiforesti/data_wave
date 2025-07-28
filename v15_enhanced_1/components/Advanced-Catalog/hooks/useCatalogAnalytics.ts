/**
 * Catalog Analytics Hooks
 * =======================
 * 
 * Comprehensive React hooks for catalog analytics with React Query integration,
 * real-time updates, caching, and optimistic updates.
 * 
 * Maps to backend services:
 * - catalog-analytics-apis.ts (comprehensive analytics)
 * - catalog-lineage-apis.ts (lineage analytics)
 * - catalog-collaboration-apis.ts (collaboration analytics)
 * - catalog-ai-ml-apis.ts (AI/ML analytics)
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { useCallback, useEffect, useState, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Import API clients
import { catalogAnalyticsApiClient } from '../services/catalog-analytics-apis'
import { catalogLineageApiClient } from '../services/catalog-lineage-apis'
import { catalogCollaborationApiClient } from '../services/catalog-collaboration-apis'
import { catalogAIMLApiClient } from '../services/catalog-ai-ml-apis'

// Import types
import type {
  AnalyticsOverview,
  UsageAnalytics,
  PerformanceAnalytics,
  BusinessValueAnalytics,
  TrendAnalysis,
  PredictiveInsights,
  CustomAnalytics,
  AnalyticsReport,
  AnalyticsDashboard,
  AnalyticsRequest,
  CustomAnalyticsRequest,
  ReportGenerationRequest,
  DashboardRequest
} from '../types/analytics.types'

import type {
  LineageMetrics,
  CollaborationAnalytics,
  QualityMetrics
} from '../types/collaboration.types'

import type {
  DataPoint,
  TimeSeriesData,
  AggregationLevel,
  MetricType
} from '../types/monitoring.types'

// ===================== QUERY KEYS =====================

export const ANALYTICS_QUERY_KEYS = {
  all: ['catalog', 'analytics'] as const,
  overview: (timeRange?: string) => [...ANALYTICS_QUERY_KEYS.all, 'overview', timeRange] as const,
  usage: (request: AnalyticsRequest) => [...ANALYTICS_QUERY_KEYS.all, 'usage', request] as const,
  performance: (request: AnalyticsRequest) => [...ANALYTICS_QUERY_KEYS.all, 'performance', request] as const,
  businessValue: (request: AnalyticsRequest) => [...ANALYTICS_QUERY_KEYS.all, 'business-value', request] as const,
  quality: (request: AnalyticsRequest) => [...ANALYTICS_QUERY_KEYS.all, 'quality', request] as const,
  lineage: (assetId?: string) => [...ANALYTICS_QUERY_KEYS.all, 'lineage', assetId] as const,
  collaboration: (timeRange?: string) => [...ANALYTICS_QUERY_KEYS.all, 'collaboration', timeRange] as const,
  trends: (metrics: MetricType[], timeRange: string, granularity: AggregationLevel) => 
    [...ANALYTICS_QUERY_KEYS.all, 'trends', { metrics, timeRange, granularity }] as const,
  predictions: (assetId?: string, timeHorizon?: string) => 
    [...ANALYTICS_QUERY_KEYS.all, 'predictions', assetId, timeHorizon] as const,
  dashboards: (dashboardId: string) => [...ANALYTICS_QUERY_KEYS.all, 'dashboards', dashboardId] as const,
  realTime: (metricTypes: MetricType[]) => [...ANALYTICS_QUERY_KEYS.all, 'real-time', metricTypes] as const,
  custom: (request: CustomAnalyticsRequest) => [...ANALYTICS_QUERY_KEYS.all, 'custom', request] as const,
} as const

// ===================== OVERVIEW ANALYTICS HOOKS =====================

/**
 * Hook for analytics overview
 */
export function useAnalyticsOverview(timeRange?: string) {
  const { toast } = useToast()

  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.overview(timeRange),
    queryFn: () => catalogAnalyticsApiClient.getAnalyticsOverview(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    onError: (error: any) => {
      toast({
        title: 'Error loading analytics overview',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for real-time dashboard
 */
export function useRealTimeDashboard() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const query = useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'real-time-dashboard'],
    queryFn: () => catalogAnalyticsApiClient.getRealTimeDashboard(),
    refetchInterval: isSubscribed ? false : 30000, // 30 seconds when not subscribed
    onError: (error: any) => {
      toast({
        title: 'Error loading real-time dashboard',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const subscribeToUpdates = useCallback((metricTypes: MetricType[]) => {
    if (isSubscribed) return () => {}

    setIsSubscribed(true)
    
    return catalogAnalyticsApiClient.subscribeToRealTimeUpdates(metricTypes, (data) => {
      queryClient.setQueryData([...ANALYTICS_QUERY_KEYS.all, 'real-time-dashboard'], (oldData: any) => ({
        ...oldData,
        ...data,
        lastUpdated: new Date().toISOString()
      }))
    })
  }, [isSubscribed, queryClient])

  useEffect(() => {
    return () => {
      setIsSubscribed(false)
    }
  }, [])

  return {
    ...query,
    subscribeToUpdates,
    isSubscribed
  }
}

/**
 * Hook for executive summary
 */
export function useExecutiveSummary(period: string = 'monthly') {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'executive-summary', period],
    queryFn: () => catalogAnalyticsApiClient.getExecutiveSummary(period),
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  })
}

// ===================== USAGE ANALYTICS HOOKS =====================

/**
 * Hook for usage analytics
 */
export function useUsageAnalytics(request: AnalyticsRequest) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.usage(request),
    queryFn: () => catalogAnalyticsApiClient.getUsageAnalytics(request),
    enabled: !!request,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for asset usage patterns
 */
export function useAssetUsagePatterns(
  assetId?: string,
  timeRange?: string,
  granularity?: AggregationLevel
) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'usage-patterns', { assetId, timeRange, granularity }],
    queryFn: () => catalogAnalyticsApiClient.getAssetUsagePatterns(assetId, timeRange, granularity),
    enabled: !!assetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for user behavior analytics
 */
export function useUserBehaviorAnalytics(userId?: string, timeRange?: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'user-behavior', { userId, timeRange }],
    queryFn: () => catalogAnalyticsApiClient.getUserBehaviorAnalytics(userId, timeRange),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook for usage trends
 */
export function useUsageTrends(
  metricType: MetricType,
  timeRange: string,
  granularity: AggregationLevel
) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'usage-trends', { metricType, timeRange, granularity }],
    queryFn: () => catalogAnalyticsApiClient.getUsageTrends(metricType, timeRange, granularity),
    enabled: !!metricType && !!timeRange,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ===================== PERFORMANCE ANALYTICS HOOKS =====================

/**
 * Hook for performance analytics
 */
export function usePerformanceAnalytics(request: AnalyticsRequest) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.performance(request),
    queryFn: () => catalogAnalyticsApiClient.getPerformanceAnalytics(request),
    enabled: !!request,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for query performance metrics
 */
export function useQueryPerformanceMetrics(assetId?: string, timeRange?: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'query-performance', { assetId, timeRange }],
    queryFn: () => catalogAnalyticsApiClient.getQueryPerformanceMetrics(assetId, timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for performance benchmarks
 */
export function usePerformanceBenchmarks() {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'performance-benchmarks'],
    queryFn: () => catalogAnalyticsApiClient.getPerformanceBenchmarks(),
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 4 * 60 * 60 * 1000, // 4 hours
  })
}

/**
 * Hook for performance recommendations
 */
export function usePerformanceRecommendations(assetId: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'performance-recommendations', assetId],
    queryFn: () => catalogAnalyticsApiClient.getPerformanceRecommendations(assetId),
    enabled: !!assetId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// ===================== BUSINESS VALUE ANALYTICS HOOKS =====================

/**
 * Hook for business value analytics
 */
export function useBusinessValueAnalytics(request: AnalyticsRequest) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.businessValue(request),
    queryFn: () => catalogAnalyticsApiClient.getBusinessValueAnalytics(request),
    enabled: !!request,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook for ROI metrics
 */
export function useROIMetrics(assetIds: string[], timeRange: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'roi-metrics', { assetIds, timeRange }],
    queryFn: () => catalogAnalyticsApiClient.calculateROIMetrics(assetIds, timeRange),
    enabled: assetIds.length > 0 && !!timeRange,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook for asset value scoring
 */
export function useAssetValueScoring(assetId: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'asset-value-scoring', assetId],
    queryFn: () => catalogAnalyticsApiClient.getAssetValueScoring(assetId),
    enabled: !!assetId,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// ===================== QUALITY ANALYTICS HOOKS =====================

/**
 * Hook for quality analytics
 */
export function useQualityAnalytics(request: AnalyticsRequest) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.quality(request),
    queryFn: () => catalogAnalyticsApiClient.getQualityAnalytics(request),
    enabled: !!request,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for quality trends
 */
export function useQualityTrends(timeRange: string, granularity: AggregationLevel) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'quality-trends', { timeRange, granularity }],
    queryFn: () => catalogAnalyticsApiClient.getQualityTrends(timeRange, granularity),
    enabled: !!timeRange,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook for quality distribution
 */
export function useQualityDistribution(filters?: any) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'quality-distribution', filters],
    queryFn: () => catalogAnalyticsApiClient.getQualityDistribution(filters),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// ===================== LINEAGE ANALYTICS HOOKS =====================

/**
 * Hook for lineage analytics
 */
export function useLineageAnalytics(assetId?: string) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.lineage(assetId),
    queryFn: () => catalogAnalyticsApiClient.getLineageAnalytics(assetId),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook for impact analytics
 */
export function useImpactAnalytics(assetId: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'impact-analytics', assetId],
    queryFn: () => catalogAnalyticsApiClient.getImpactAnalytics(assetId),
    enabled: !!assetId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for lineage complexity
 */
export function useLineageComplexity() {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'lineage-complexity'],
    queryFn: () => catalogAnalyticsApiClient.getLineageComplexity(),
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// ===================== SEARCH ANALYTICS HOOKS =====================

/**
 * Hook for search analytics
 */
export function useSearchAnalytics(timeRange?: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'search-analytics', timeRange],
    queryFn: () => catalogAnalyticsApiClient.getSearchAnalytics(timeRange),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook for popular search terms
 */
export function usePopularSearchTerms(limit: number = 50) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'popular-search-terms', limit],
    queryFn: () => catalogAnalyticsApiClient.getPopularSearchTerms(limit),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook for search performance metrics
 */
export function useSearchPerformanceMetrics() {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'search-performance'],
    queryFn: () => catalogAnalyticsApiClient.getSearchPerformanceMetrics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// ===================== COLLABORATION ANALYTICS HOOKS =====================

/**
 * Hook for collaboration analytics
 */
export function useCollaborationAnalytics(timeRange?: string) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.collaboration(timeRange),
    queryFn: () => catalogAnalyticsApiClient.getCollaborationAnalytics(timeRange),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook for team productivity metrics
 */
export function useTeamProductivityMetrics(teamId?: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'team-productivity', teamId],
    queryFn: () => catalogAnalyticsApiClient.getTeamProductivityMetrics(teamId),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook for knowledge sharing analytics
 */
export function useKnowledgeSharingAnalytics() {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'knowledge-sharing'],
    queryFn: () => catalogAnalyticsApiClient.getKnowledgeSharingAnalytics(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// ===================== TREND ANALYSIS HOOKS =====================

/**
 * Hook for trend analysis
 */
export function useTrendAnalysis(
  metrics: MetricType[],
  timeRange: string,
  granularity: AggregationLevel
) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.trends(metrics, timeRange, granularity),
    queryFn: () => catalogAnalyticsApiClient.getTrendAnalysis(metrics, timeRange, granularity),
    enabled: metrics.length > 0 && !!timeRange,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook for anomaly detection
 */
export function useAnomalyDetection(metricType: MetricType, timeRange: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'anomaly-detection', { metricType, timeRange }],
    queryFn: () => catalogAnalyticsApiClient.getAnomalyDetection(metricType, timeRange),
    enabled: !!metricType && !!timeRange,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook for seasonal patterns
 */
export function useSeasonalPatterns(metricType: MetricType, timeRange: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'seasonal-patterns', { metricType, timeRange }],
    queryFn: () => catalogAnalyticsApiClient.getSeasonalPatterns(metricType, timeRange),
    enabled: !!metricType && !!timeRange,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// ===================== PREDICTIVE ANALYTICS HOOKS =====================

/**
 * Hook for predictive insights
 */
export function usePredictiveInsights(assetId?: string, timeHorizon: string = '30d') {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.predictions(assetId, timeHorizon),
    queryFn: () => catalogAnalyticsApiClient.getPredictiveInsights(assetId, timeHorizon),
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook for usage predictions
 */
export function useUsagePredictions(assetIds: string[], timeHorizon: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'usage-predictions', { assetIds, timeHorizon }],
    queryFn: () => catalogAnalyticsApiClient.getUsagePredictions(assetIds, timeHorizon),
    enabled: assetIds.length > 0 && !!timeHorizon,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook for quality predictions
 */
export function useQualityPredictions(assetId: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'quality-predictions', assetId],
    queryFn: () => catalogAnalyticsApiClient.getQualityPredictions(assetId),
    enabled: !!assetId,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// ===================== CUSTOM ANALYTICS HOOKS =====================

/**
 * Hook for custom analytics
 */
export function useCustomAnalytics(request: CustomAnalyticsRequest) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.custom(request),
    queryFn: () => catalogAnalyticsApiClient.createCustomAnalytics(request),
    enabled: !!request && !!request.query,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for analytics templates
 */
export function useAnalyticsTemplates() {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'templates'],
    queryFn: () => catalogAnalyticsApiClient.getAnalyticsTemplates(),
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 4 * 60 * 60 * 1000, // 4 hours
  })
}

/**
 * Mutation hook for executing saved analytics
 */
export function useExecuteSavedAnalytics() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ queryId, parameters }: { queryId: string; parameters?: Record<string, any> }) =>
      catalogAnalyticsApiClient.executeSavedAnalytics(queryId, parameters),
    onSuccess: () => {
      toast({
        title: 'Analytics executed successfully',
        description: 'Your saved analytics query has been executed.',
      })
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEYS.all })
    },
    onError: (error: any) => {
      toast({
        title: 'Error executing analytics',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// ===================== DASHBOARD MANAGEMENT HOOKS =====================

/**
 * Hook for dashboard configuration
 */
export function useDashboardConfig(dashboardId: string) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.dashboards(dashboardId),
    queryFn: () => catalogAnalyticsApiClient.getDashboardConfig(dashboardId),
    enabled: !!dashboardId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Mutation hook for creating dashboards
 */
export function useCreateDashboard() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (request: DashboardRequest) =>
      catalogAnalyticsApiClient.createDashboard(request),
    onSuccess: (dashboard) => {
      toast({
        title: 'Dashboard created successfully',
        description: `Dashboard "${dashboard.name}" has been created.`,
      })
      queryClient.invalidateQueries({ queryKey: [...ANALYTICS_QUERY_KEYS.all, 'dashboards'] })
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating dashboard',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

/**
 * Mutation hook for updating dashboards
 */
export function useUpdateDashboard() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ dashboardId, request }: { dashboardId: string; request: Partial<DashboardRequest> }) =>
      catalogAnalyticsApiClient.updateDashboard(dashboardId, request),
    onSuccess: (dashboard) => {
      toast({
        title: 'Dashboard updated successfully',
        description: `Dashboard "${dashboard.name}" has been updated.`,
      })
      queryClient.setQueryData(ANALYTICS_QUERY_KEYS.dashboards(dashboard.id), dashboard)
      queryClient.invalidateQueries({ queryKey: [...ANALYTICS_QUERY_KEYS.all, 'dashboards'] })
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating dashboard',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for widget data
 */
export function useWidgetData(widgetId: string, parameters?: Record<string, any>) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'widgets', widgetId, parameters],
    queryFn: () => catalogAnalyticsApiClient.getWidgetData(widgetId, parameters),
    enabled: !!widgetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ===================== REPORTING HOOKS =====================

/**
 * Mutation hook for generating reports
 */
export function useGenerateReport() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (request: ReportGenerationRequest) =>
      catalogAnalyticsApiClient.generateReport(request),
    onSuccess: () => {
      toast({
        title: 'Report generated successfully',
        description: 'Your analytics report has been generated.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error generating report',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for scheduled reports
 */
export function useScheduledReports() {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.all, 'scheduled-reports'],
    queryFn: () => catalogAnalyticsApiClient.getScheduledReports(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Mutation hook for exporting analytics data
 */
export function useExportAnalyticsData() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ request, format }: { request: AnalyticsRequest; format: 'csv' | 'excel' | 'json' | 'pdf' }) =>
      catalogAnalyticsApiClient.exportAnalyticsData(request, format),
    onSuccess: () => {
      toast({
        title: 'Export started',
        description: 'Your analytics data export has been initiated.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error exporting data',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// ===================== REAL-TIME ANALYTICS HOOKS =====================

/**
 * Hook for real-time metrics
 */
export function useRealTimeMetrics(metricTypes: MetricType[]) {
  const [isPolling, setIsPolling] = useState(false)

  const query = useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.realTime(metricTypes),
    queryFn: () => catalogAnalyticsApiClient.getRealTimeMetrics(metricTypes),
    enabled: metricTypes.length > 0,
    refetchInterval: isPolling ? 10000 : false, // 10 seconds when polling
    staleTime: 0, // Always fetch fresh data
  })

  const startPolling = useCallback(() => setIsPolling(true), [])
  const stopPolling = useCallback(() => setIsPolling(false), [])

  return {
    ...query,
    isPolling,
    startPolling,
    stopPolling
  }
}

// ===================== COMPOSITE ANALYTICS HOOKS =====================

/**
 * Composite hook that combines multiple analytics for a comprehensive view
 */
export function useComprehensiveAnalytics(
  assetId?: string,
  timeRange: string = '30d',
  options?: {
    includeUsage?: boolean
    includePerformance?: boolean
    includeQuality?: boolean
    includeLineage?: boolean
    includeCollaboration?: boolean
  }
) {
  const defaultOptions = {
    includeUsage: true,
    includePerformance: true,
    includeQuality: true,
    includeLineage: true,
    includeCollaboration: true,
    ...options
  }

  const baseRequest: AnalyticsRequest = {
    timeRange,
    assetIds: assetId ? [assetId] : undefined,
    granularity: 'daily' as AggregationLevel
  }

  const overview = useAnalyticsOverview(timeRange)
  const usage = useUsageAnalytics(defaultOptions.includeUsage ? baseRequest : null as any)
  const performance = usePerformanceAnalytics(defaultOptions.includePerformance ? baseRequest : null as any)
  const quality = useQualityAnalytics(defaultOptions.includeQuality ? baseRequest : null as any)
  const lineage = useLineageAnalytics(defaultOptions.includeLineage ? assetId : undefined)
  const collaboration = useCollaborationAnalytics(defaultOptions.includeCollaboration ? timeRange : undefined)

  const isLoading = overview.isLoading || usage.isLoading || performance.isLoading || 
                   quality.isLoading || lineage.isLoading || collaboration.isLoading

  const error = overview.error || usage.error || performance.error || 
               quality.error || lineage.error || collaboration.error

  const data = {
    overview: overview.data,
    usage: usage.data,
    performance: performance.data,
    quality: quality.data,
    lineage: lineage.data,
    collaboration: collaboration.data
  }

  return {
    data,
    isLoading,
    error,
    overview,
    usage,
    performance,
    quality,
    lineage,
    collaboration
  }
}

/**
 * Hook for asset-specific analytics dashboard
 */
export function useAssetAnalyticsDashboard(assetId: string) {
  const timeRange = '30d'
  
  const usage = useAssetUsagePatterns(assetId, timeRange, 'daily')
  const performance = useQueryPerformanceMetrics(assetId, timeRange)
  const quality = useQualityPredictions(assetId)
  const lineage = useImpactAnalytics(assetId)
  const value = useAssetValueScoring(assetId)
  const recommendations = usePerformanceRecommendations(assetId)

  const isLoading = usage.isLoading || performance.isLoading || quality.isLoading || 
                   lineage.isLoading || value.isLoading || recommendations.isLoading

  const error = usage.error || performance.error || quality.error || 
               lineage.error || value.error || recommendations.error

  return {
    data: {
      usage: usage.data,
      performance: performance.data,
      quality: quality.data,
      lineage: lineage.data,
      value: value.data,
      recommendations: recommendations.data
    },
    isLoading,
    error,
    // Individual query results for granular access
    usage,
    performance,
    quality,
    lineage,
    value,
    recommendations
  }
}