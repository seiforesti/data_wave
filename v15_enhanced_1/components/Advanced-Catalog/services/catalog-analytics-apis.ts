/**
 * Catalog Analytics API Service
 * =============================
 * 
 * Maps to backend services:
 * - comprehensive_analytics_service.py (882 lines, ComprehensiveAnalyticsService)
 * - catalog_analytics_service.py (901 lines, CatalogAnalyticsService)
 * - enterprise_analytics.py routes (588 lines, 20+ endpoints)
 * - catalog_analytics_routes.py (853 lines, 30+ endpoints)
 * 
 * Provides comprehensive analytics capabilities including usage patterns,
 * performance metrics, business value analysis, and predictive insights.
 */

import { apiClient } from '@/shared/utils/api-client'
import type {
  // Analytics types
  AnalyticsOverview,
  UsageAnalytics,
  PerformanceAnalytics,
  BusinessValueAnalytics,
  TrendAnalysis,
  PredictiveInsights,
  CustomAnalytics,
  AnalyticsReport,
  AnalyticsWidget,
  AnalyticsDashboard,
  
  // Collaboration analytics
  CollaborationAnalytics,
  CollaborationOverview,
  EngagementMetrics,
  ProductivityMetrics,
  QualityMetrics,
  
  // Specific metrics
  AssetUsageMetrics,
  QualityTrends,
  LineageMetrics,
  SearchAnalytics,
  UserBehaviorAnalytics,
  
  // Request/Response types
  AnalyticsRequest,
  CustomAnalyticsRequest,
  ReportGenerationRequest,
  DashboardRequest
} from '../types/analytics.types'

import type {
  DataPoint,
  TimeSeriesData,
  AggregationLevel,
  AnalyticsFilter,
  MetricType
} from '../types/monitoring.types'

const API_BASE_URL = '/api/v1/catalog/analytics'

export class CatalogAnalyticsApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // ===================== OVERVIEW ANALYTICS =====================

  /**
   * Get comprehensive analytics overview
   * Maps to: ComprehensiveAnalyticsService.generate_catalog_overview()
   */
  async getAnalyticsOverview(timeRange?: string): Promise<AnalyticsOverview> {
    const params = new URLSearchParams()
    if (timeRange) params.append('time_range', timeRange)
    
    return apiClient.get(`${this.baseUrl}/overview?${params.toString()}`)
  }

  /**
   * Get real-time analytics dashboard data
   * Maps to: CatalogAnalyticsService.get_real_time_dashboard()
   */
  async getRealTimeDashboard(): Promise<AnalyticsDashboard> {
    return apiClient.get(`${this.baseUrl}/dashboard/real-time`)
  }

  /**
   * Get executive analytics summary
   * Maps to: ComprehensiveAnalyticsService.generate_executive_summary()
   */
  async getExecutiveSummary(period: string = 'monthly'): Promise<AnalyticsOverview> {
    return apiClient.get(`${this.baseUrl}/executive-summary?period=${period}`)
  }

  // ===================== USAGE ANALYTICS =====================

  /**
   * Get comprehensive usage analytics
   * Maps to: CatalogAnalyticsService.analyze_usage_patterns()
   */
  async getUsageAnalytics(request: AnalyticsRequest): Promise<UsageAnalytics> {
    return apiClient.post(`${this.baseUrl}/usage`, request)
  }

  /**
   * Get asset usage patterns
   * Maps to: CatalogAnalyticsService.get_asset_usage_patterns()
   */
  async getAssetUsagePatterns(
    assetId?: string,
    timeRange?: string,
    granularity?: AggregationLevel
  ): Promise<AssetUsageMetrics[]> {
    const params = new URLSearchParams()
    if (assetId) params.append('asset_id', assetId)
    if (timeRange) params.append('time_range', timeRange)
    if (granularity) params.append('granularity', granularity)
    
    return apiClient.get(`${this.baseUrl}/usage/patterns?${params.toString()}`)
  }

  /**
   * Get user behavior analytics
   * Maps to: CatalogAnalyticsService.analyze_user_behavior()
   */
  async getUserBehaviorAnalytics(
    userId?: string,
    timeRange?: string
  ): Promise<UserBehaviorAnalytics> {
    const params = new URLSearchParams()
    if (userId) params.append('user_id', userId)
    if (timeRange) params.append('time_range', timeRange)
    
    return apiClient.get(`${this.baseUrl}/user-behavior?${params.toString()}`)
  }

  /**
   * Get usage trends over time
   * Maps to: CatalogAnalyticsService.get_usage_trends()
   */
  async getUsageTrends(
    metricType: MetricType,
    timeRange: string,
    granularity: AggregationLevel
  ): Promise<TimeSeriesData> {
    const params = new URLSearchParams({
      metric_type: metricType,
      time_range: timeRange,
      granularity: granularity
    })
    
    return apiClient.get(`${this.baseUrl}/usage/trends?${params.toString()}`)
  }

  // ===================== PERFORMANCE ANALYTICS =====================

  /**
   * Get performance analytics
   * Maps to: CatalogAnalyticsService.analyze_performance_metrics()
   */
  async getPerformanceAnalytics(request: AnalyticsRequest): Promise<PerformanceAnalytics> {
    return apiClient.post(`${this.baseUrl}/performance`, request)
  }

  /**
   * Get query performance metrics
   * Maps to: CatalogAnalyticsService.get_query_performance()
   */
  async getQueryPerformanceMetrics(
    assetId?: string,
    timeRange?: string
  ): Promise<PerformanceAnalytics> {
    const params = new URLSearchParams()
    if (assetId) params.append('asset_id', assetId)
    if (timeRange) params.append('time_range', timeRange)
    
    return apiClient.get(`${this.baseUrl}/performance/queries?${params.toString()}`)
  }

  /**
   * Get system performance benchmarks
   * Maps to: ComprehensiveAnalyticsService.get_performance_benchmarks()
   */
  async getPerformanceBenchmarks(): Promise<PerformanceAnalytics> {
    return apiClient.get(`${this.baseUrl}/performance/benchmarks`)
  }

  /**
   * Get performance optimization recommendations
   * Maps to: CatalogAnalyticsService.get_performance_recommendations()
   */
  async getPerformanceRecommendations(assetId: string): Promise<{
    recommendations: Array<{
      type: string
      priority: string
      description: string
      expectedImprovement: number
      implementationSteps: string[]
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/performance/recommendations/${assetId}`)
  }

  // ===================== BUSINESS VALUE ANALYTICS =====================

  /**
   * Get business value analytics
   * Maps to: ComprehensiveAnalyticsService.calculate_business_value()
   */
  async getBusinessValueAnalytics(request: AnalyticsRequest): Promise<BusinessValueAnalytics> {
    return apiClient.post(`${this.baseUrl}/business-value`, request)
  }

  /**
   * Calculate ROI metrics
   * Maps to: ComprehensiveAnalyticsService.calculate_roi_metrics()
   */
  async calculateROIMetrics(
    assetIds: string[],
    timeRange: string
  ): Promise<{
    totalROI: number
    assetROI: Record<string, number>
    costSavings: number
    revenueImpact: number
    productivityGains: number
  }> {
    return apiClient.post(`${this.baseUrl}/business-value/roi`, {
      asset_ids: assetIds,
      time_range: timeRange
    })
  }

  /**
   * Get asset value scoring
   * Maps to: CatalogAnalyticsService.calculate_asset_value_score()
   */
  async getAssetValueScoring(assetId: string): Promise<{
    overallScore: number
    businessValue: number
    technicalValue: number
    usageValue: number
    qualityValue: number
    strategicValue: number
    factors: Array<{
      name: string
      weight: number
      score: number
      impact: string
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/business-value/scoring/${assetId}`)
  }

  // ===================== QUALITY ANALYTICS =====================

  /**
   * Get quality analytics
   * Maps to: CatalogAnalyticsService.analyze_quality_metrics()
   */
  async getQualityAnalytics(request: AnalyticsRequest): Promise<QualityMetrics> {
    return apiClient.post(`${this.baseUrl}/quality`, request)
  }

  /**
   * Get quality trends
   * Maps to: CatalogAnalyticsService.get_quality_trends()
   */
  async getQualityTrends(
    timeRange: string,
    granularity: AggregationLevel
  ): Promise<QualityTrends> {
    const params = new URLSearchParams({
      time_range: timeRange,
      granularity: granularity
    })
    
    return apiClient.get(`${this.baseUrl}/quality/trends?${params.toString()}`)
  }

  /**
   * Get quality distribution across assets
   * Maps to: CatalogAnalyticsService.get_quality_distribution()
   */
  async getQualityDistribution(filters?: AnalyticsFilter): Promise<{
    distribution: Array<{
      qualityLevel: string
      assetCount: number
      percentage: number
    }>
    averageScore: number
    improvementOpportunities: Array<{
      area: string
      impact: number
      effort: number
      priority: string
    }>
  }> {
    return apiClient.post(`${this.baseUrl}/quality/distribution`, filters || {})
  }

  // ===================== LINEAGE ANALYTICS =====================

  /**
   * Get lineage analytics
   * Maps to: AdvancedLineageService.get_lineage_analytics()
   */
  async getLineageAnalytics(assetId?: string): Promise<LineageMetrics> {
    const params = new URLSearchParams()
    if (assetId) params.append('asset_id', assetId)
    
    return apiClient.get(`${this.baseUrl}/lineage?${params.toString()}`)
  }

  /**
   * Get impact analysis metrics
   * Maps to: AdvancedLineageService.analyze_change_impact()
   */
  async getImpactAnalytics(assetId: string): Promise<{
    directImpact: number
    indirectImpact: number
    affectedAssets: Array<{
      id: string
      name: string
      type: string
      impactLevel: string
    }>
    riskAssessment: {
      level: string
      factors: string[]
      mitigation: string[]
    }
  }> {
    return apiClient.get(`${this.baseUrl}/lineage/impact/${assetId}`)
  }

  /**
   * Get lineage complexity metrics
   * Maps to: AdvancedLineageService.calculate_lineage_complexity()
   */
  async getLineageComplexity(): Promise<{
    averageDepth: number
    maxDepth: number
    averageBreadth: number
    cyclicalDependencies: number
    complexityScore: number
    hotspots: Array<{
      assetId: string
      complexityScore: number
      reason: string
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/lineage/complexity`)
  }

  // ===================== SEARCH ANALYTICS =====================

  /**
   * Get search analytics
   * Maps to: SemanticSearchService.get_search_analytics()
   */
  async getSearchAnalytics(timeRange?: string): Promise<SearchAnalytics> {
    const params = new URLSearchParams()
    if (timeRange) params.append('time_range', timeRange)
    
    return apiClient.get(`${this.baseUrl}/search?${params.toString()}`)
  }

  /**
   * Get popular search terms
   * Maps to: SemanticSearchService.get_popular_search_terms()
   */
  async getPopularSearchTerms(limit: number = 50): Promise<Array<{
    term: string
    count: number
    trend: string
    successRate: number
  }>> {
    return apiClient.get(`${this.baseUrl}/search/popular-terms?limit=${limit}`)
  }

  /**
   * Get search performance metrics
   * Maps to: SemanticSearchService.get_search_performance()
   */
  async getSearchPerformanceMetrics(): Promise<{
    averageResponseTime: number
    indexingSpeed: number
    searchAccuracy: number
    userSatisfaction: number
    queryOptimization: Array<{
      query: string
      frequency: number
      avgResponseTime: number
      optimization: string
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/search/performance`)
  }

  // ===================== COLLABORATION ANALYTICS =====================

  /**
   * Get collaboration analytics
   * Maps to: Enhanced collaboration services
   */
  async getCollaborationAnalytics(timeRange?: string): Promise<CollaborationAnalytics> {
    const params = new URLSearchParams()
    if (timeRange) params.append('time_range', timeRange)
    
    return apiClient.get(`${this.baseUrl}/collaboration?${params.toString()}`)
  }

  /**
   * Get team productivity metrics
   * Maps to: Collaboration analytics in backend
   */
  async getTeamProductivityMetrics(teamId?: string): Promise<ProductivityMetrics> {
    const params = new URLSearchParams()
    if (teamId) params.append('team_id', teamId)
    
    return apiClient.get(`${this.baseUrl}/collaboration/productivity?${params.toString()}`)
  }

  /**
   * Get knowledge sharing analytics
   * Maps to: KnowledgeManagementService analytics
   */
  async getKnowledgeSharingAnalytics(): Promise<{
    totalArticles: number
    articlesCreated: number
    articlesUpdated: number
    viewsPerArticle: number
    userEngagement: number
    knowledgeGaps: Array<{
      topic: string
      demand: number
      supply: number
      gap: number
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/collaboration/knowledge-sharing`)
  }

  // ===================== TREND ANALYSIS =====================

  /**
   * Get comprehensive trend analysis
   * Maps to: ComprehensiveAnalyticsService.analyze_trends()
   */
  async getTrendAnalysis(
    metrics: MetricType[],
    timeRange: string,
    granularity: AggregationLevel
  ): Promise<TrendAnalysis> {
    return apiClient.post(`${this.baseUrl}/trends`, {
      metrics,
      time_range: timeRange,
      granularity
    })
  }

  /**
   * Get anomaly detection results
   * Maps to: AI service anomaly detection
   */
  async getAnomalyDetection(
    metricType: MetricType,
    timeRange: string
  ): Promise<Array<{
    timestamp: string
    value: number
    expected: number
    anomalyScore: number
    type: string
    severity: string
    description: string
  }>> {
    return apiClient.post(`${this.baseUrl}/trends/anomalies`, {
      metric_type: metricType,
      time_range: timeRange
    })
  }

  /**
   * Get seasonal patterns
   * Maps to: Advanced analytics in backend
   */
  async getSeasonalPatterns(
    metricType: MetricType,
    timeRange: string
  ): Promise<{
    patterns: Array<{
      period: string
      strength: number
      trend: string
    }>
    forecast: Array<{
      date: string
      predicted: number
      confidence: number
    }>
  }> {
    return apiClient.post(`${this.baseUrl}/trends/seasonal`, {
      metric_type: metricType,
      time_range: timeRange
    })
  }

  // ===================== PREDICTIVE ANALYTICS =====================

  /**
   * Get predictive insights
   * Maps to: MLService.generate_predictions() and AIService.predict_trends()
   */
  async getPredictiveInsights(
    assetId?: string,
    timeHorizon: string = '30d'
  ): Promise<PredictiveInsights> {
    const params = new URLSearchParams({
      time_horizon: timeHorizon
    })
    if (assetId) params.append('asset_id', assetId)
    
    return apiClient.get(`${this.baseUrl}/predictive?${params.toString()}`)
  }

  /**
   * Get usage predictions
   * Maps to: ML service usage prediction models
   */
  async getUsagePredictions(
    assetIds: string[],
    timeHorizon: string
  ): Promise<Array<{
    assetId: string
    predictions: Array<{
      date: string
      predictedUsage: number
      confidence: number
    }>
    factors: string[]
    accuracy: number
  }>> {
    return apiClient.post(`${this.baseUrl}/predictive/usage`, {
      asset_ids: assetIds,
      time_horizon: timeHorizon
    })
  }

  /**
   * Get quality predictions
   * Maps to: AI service quality prediction
   */
  async getQualityPredictions(assetId: string): Promise<{
    currentQuality: number
    predictedQuality: Array<{
      date: string
      score: number
      confidence: number
    }>
    riskFactors: Array<{
      factor: string
      impact: number
      likelihood: number
    }>
    recommendations: string[]
  }> {
    return apiClient.get(`${this.baseUrl}/predictive/quality/${assetId}`)
  }

  // ===================== CUSTOM ANALYTICS =====================

  /**
   * Create custom analytics query
   * Maps to: ComprehensiveAnalyticsService.execute_custom_analytics()
   */
  async createCustomAnalytics(request: CustomAnalyticsRequest): Promise<CustomAnalytics> {
    return apiClient.post(`${this.baseUrl}/custom`, request)
  }

  /**
   * Execute saved analytics query
   * Maps to: Saved analytics in backend
   */
  async executeSavedAnalytics(queryId: string, parameters?: Record<string, any>): Promise<CustomAnalytics> {
    return apiClient.post(`${this.baseUrl}/custom/saved/${queryId}`, { parameters })
  }

  /**
   * Get analytics templates
   * Maps to: Analytics template management in backend
   */
  async getAnalyticsTemplates(): Promise<Array<{
    id: string
    name: string
    description: string
    category: string
    template: CustomAnalyticsRequest
    popularity: number
  }>> {
    return apiClient.get(`${this.baseUrl}/custom/templates`)
  }

  // ===================== REPORTING =====================

  /**
   * Generate analytics report
   * Maps to: Report generation services in backend
   */
  async generateReport(request: ReportGenerationRequest): Promise<AnalyticsReport> {
    return apiClient.post(`${this.baseUrl}/reports/generate`, request)
  }

  /**
   * Get scheduled reports
   * Maps to: Scheduled reporting in backend
   */
  async getScheduledReports(): Promise<Array<{
    id: string
    name: string
    schedule: string
    lastRun: string
    nextRun: string
    status: string
    recipients: string[]
  }>> {
    return apiClient.get(`${this.baseUrl}/reports/scheduled`)
  }

  /**
   * Export analytics data
   * Maps to: Data export services in backend
   */
  async exportAnalyticsData(
    request: AnalyticsRequest,
    format: 'csv' | 'excel' | 'json' | 'pdf'
  ): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, format })
    })
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }
    
    return response.blob()
  }

  // ===================== DASHBOARD MANAGEMENT =====================

  /**
   * Get dashboard configuration
   * Maps to: Dashboard management in backend
   */
  async getDashboardConfig(dashboardId: string): Promise<AnalyticsDashboard> {
    return apiClient.get(`${this.baseUrl}/dashboards/${dashboardId}`)
  }

  /**
   * Create custom dashboard
   * Maps to: Dashboard creation services
   */
  async createDashboard(request: DashboardRequest): Promise<AnalyticsDashboard> {
    return apiClient.post(`${this.baseUrl}/dashboards`, request)
  }

  /**
   * Update dashboard configuration
   * Maps to: Dashboard update services
   */
  async updateDashboard(
    dashboardId: string,
    request: Partial<DashboardRequest>
  ): Promise<AnalyticsDashboard> {
    return apiClient.put(`${this.baseUrl}/dashboards/${dashboardId}`, request)
  }

  /**
   * Get widget data
   * Maps to: Widget data services in backend
   */
  async getWidgetData(
    widgetId: string,
    parameters?: Record<string, any>
  ): Promise<AnalyticsWidget> {
    return apiClient.post(`${this.baseUrl}/widgets/${widgetId}/data`, { parameters })
  }

  // ===================== REAL-TIME ANALYTICS =====================

  /**
   * Get real-time metrics
   * Maps to: Real-time analytics in backend
   */
  async getRealTimeMetrics(metricTypes: MetricType[]): Promise<Record<string, any>> {
    return apiClient.post(`${this.baseUrl}/real-time`, { metric_types: metricTypes })
  }

  /**
   * Subscribe to real-time updates
   * Maps to: WebSocket real-time services
   */
  subscribeToRealTimeUpdates(
    metricTypes: MetricType[],
    callback: (data: Record<string, any>) => void
  ): () => void {
    // Implementation would use WebSocket connection
    const ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/real-time/subscribe`)
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ metric_types: metricTypes }))
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      callback(data)
    }
    
    return () => {
      ws.close()
    }
  }
}

// Create singleton instance
export const catalogAnalyticsApiClient = new CatalogAnalyticsApiClient()

// Export default
export default catalogAnalyticsApiClient