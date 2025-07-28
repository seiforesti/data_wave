/**
 * Advanced Catalog Analytics APIs - Enterprise Analytics Platform
 * ===============================================================
 * 
 * Complete mapping to backend analytics services:
 * - catalog_analytics_service.py (901 lines, 30+ endpoints)
 * - comprehensive_analytics_service.py (882 lines)
 * - enterprise_analytics.py (588 lines, 20+ endpoints)
 * - catalog_analytics_routes.py (853 lines, 30+ endpoints)
 * - enterprise_integration_service.py (analytics features)
 * 
 * This service provides comprehensive catalog analytics including:
 * - Usage analytics and patterns
 * - Performance metrics and trends
 * - Business intelligence and insights
 * - Predictive analytics and forecasting
 * - Cross-system analytics aggregation
 * - Executive dashboards and reporting
 * - Custom analytics and visualizations
 * - ROI and business value measurement
 */

import { apiClient } from '../../shared/utils/api-client';
import type {
  AnalyticsDashboardData,
  UsageAnalytics,
  PerformanceMetrics,
  TrendAnalysis,
  BusinessIntelligenceInsight,
  PredictiveAnalytics,
  CustomAnalyticsRequest,
  AnalyticsReport,
  KPIDashboard,
  MetricsAggregation,
  AnalyticsVisualization,
  ExecutiveAnalytics,
  BusinessValueMetrics,
  ROIAnalysis,
  PopularityAnalysis,
  ImpactAnalysis,
  CollaborationMetrics,
  AssetUtilizationMetrics,
  QualityMetrics,
  LineageMetrics,
  SearchMetrics,
  UserActivityMetrics,
  SystemMetrics,
  CostAnalysis,
  BenchmarkingData
} from '../types/analytics.types';

/**
 * ==============================================
 * CATALOG ANALYTICS ENGINE (catalog_analytics_service.py)
 * ==============================================
 */

export class CatalogAnalyticsAPI {
  /**
   * Get comprehensive catalog analytics dashboard
   * Maps to: CatalogAnalyticsService.generate_catalog_analytics()
   */
  static async getCatalogAnalyticsDashboard(filters?: any): Promise<AnalyticsDashboardData> {
    return apiClient.get('/api/catalog/analytics/dashboard', { params: filters });
  }

  /**
   * Analyze usage patterns across catalog assets
   * Maps to: CatalogAnalyticsService.analyze_usage_patterns()
   */
  static async analyzeUsagePatterns(assetIds?: string[], timeframe?: string): Promise<UsageAnalytics> {
    return apiClient.post('/api/catalog/analytics/usage/patterns', {
      asset_ids: assetIds,
      timeframe
    });
  }

  /**
   * Track catalog performance metrics
   * Maps to: CatalogAnalyticsService.track_catalog_performance()
   */
  static async getCatalogPerformanceMetrics(catalogId?: string, metricTypes?: string[]): Promise<PerformanceMetrics> {
    return apiClient.get('/api/catalog/analytics/performance', {
      params: { catalog_id: catalogId, metric_types: metricTypes }
    });
  }

  /**
   * Monitor catalog health and system status
   * Maps to: CatalogAnalyticsService.monitor_catalog_health()
   */
  static async getCatalogHealthMetrics(): Promise<SystemMetrics> {
    return apiClient.get('/api/catalog/analytics/health');
  }

  /**
   * Generate executive-level analytics reports
   * Maps to: CatalogAnalyticsService.generate_executive_reports()
   */
  static async getExecutiveAnalytics(timeframe?: string, includeForecasts?: boolean): Promise<ExecutiveAnalytics> {
    return apiClient.get('/api/catalog/analytics/executive', {
      params: { timeframe, include_forecasts: includeForecasts }
    });
  }

  /**
   * Analyze collaboration metrics and team productivity
   * Maps to: CatalogAnalyticsService.analyze_collaboration_metrics()
   */
  static async getCollaborationMetrics(teamId?: string, projectId?: string): Promise<CollaborationMetrics> {
    return apiClient.get('/api/catalog/analytics/collaboration', {
      params: { team_id: teamId, project_id: projectId }
    });
  }

  /**
   * Track governance compliance metrics
   * Maps to: CatalogAnalyticsService.track_governance_compliance()
   */
  static async getGovernanceComplianceMetrics(complianceType?: string): Promise<any> {
    return apiClient.get('/api/catalog/analytics/governance/compliance', {
      params: { compliance_type: complianceType }
    });
  }

  /**
   * Predict catalog trends and future usage
   * Maps to: CatalogAnalyticsService.predict_catalog_trends()
   */
  static async predictCatalogTrends(horizon?: string, confidence?: number): Promise<PredictiveAnalytics> {
    return apiClient.get('/api/catalog/analytics/trends/predict', {
      params: { horizon, confidence }
    });
  }

  /**
   * Get asset utilization metrics
   * Maps to: Asset utilization tracking
   */
  static async getAssetUtilizationMetrics(assetIds?: string[]): Promise<AssetUtilizationMetrics> {
    return apiClient.post('/api/catalog/analytics/utilization', { asset_ids: assetIds });
  }

  /**
   * Analyze asset popularity and adoption
   * Maps to: Popularity analysis features
   */
  static async analyzeAssetPopularity(timeframe?: string, category?: string): Promise<PopularityAnalysis> {
    return apiClient.get('/api/catalog/analytics/popularity', {
      params: { timeframe, category }
    });
  }
}

/**
 * ==============================================
 * COMPREHENSIVE ANALYTICS (comprehensive_analytics_service.py)
 * ==============================================
 */

export class ComprehensiveAnalyticsAPI {
  /**
   * Generate enterprise-wide analytics
   * Maps to: ComprehensiveAnalyticsService.generate_catalog_analytics()
   */
  static async getEnterpriseAnalytics(scope?: string, includeProjections?: boolean): Promise<any> {
    return apiClient.get('/api/analytics/enterprise', {
      params: { scope, include_projections: includeProjections }
    });
  }

  /**
   * Analyze cross-group metrics and performance
   * Maps to: ComprehensiveAnalyticsService.analyze_cross_group_metrics()
   */
  static async getCrossGroupMetrics(groups?: string[], timeframe?: string): Promise<any> {
    return apiClient.post('/api/analytics/cross-group', {
      groups,
      timeframe
    });
  }

  /**
   * Calculate business value and ROI
   * Maps to: ComprehensiveAnalyticsService.calculate_business_value()
   */
  static async calculateBusinessValue(assetIds?: string[], investmentData?: any): Promise<BusinessValueMetrics> {
    return apiClient.post('/api/analytics/business-value', {
      asset_ids: assetIds,
      investment_data: investmentData
    });
  }

  /**
   * Track performance trends across systems
   * Maps to: ComprehensiveAnalyticsService.track_performance_trends()
   */
  static async getPerformanceTrends(systems?: string[], metrics?: string[]): Promise<TrendAnalysis> {
    return apiClient.post('/api/analytics/performance/trends', {
      systems,
      metrics
    });
  }

  /**
   * Analyze usage patterns across all systems
   * Maps to: ComprehensiveAnalyticsService.analyze_usage_patterns()
   */
  static async getSystemWideUsagePatterns(timeframe?: string): Promise<any> {
    return apiClient.get('/api/analytics/usage/system-wide', {
      params: { timeframe }
    });
  }

  /**
   * Generate predictive insights and forecasts
   * Maps to: ComprehensiveAnalyticsService.generate_predictive_insights()
   */
  static async generatePredictiveInsights(modelType?: string, horizon?: string): Promise<PredictiveAnalytics> {
    return apiClient.get('/api/analytics/predictive/insights', {
      params: { model_type: modelType, horizon }
    });
  }

  /**
   * Create custom dashboards with aggregated data
   * Maps to: ComprehensiveAnalyticsService.create_custom_dashboards()
   */
  static async createCustomDashboard(dashboardConfig: any): Promise<any> {
    return apiClient.post('/api/analytics/dashboards/custom', dashboardConfig);
  }

  /**
   * Export analytical data in various formats
   * Maps to: ComprehensiveAnalyticsService.export_analytical_data()
   */
  static async exportAnalyticalData(exportConfig: any): Promise<Blob> {
    return apiClient.post('/api/analytics/export', exportConfig, {
      responseType: 'blob'
    });
  }
}

/**
 * ==============================================
 * BUSINESS INTELLIGENCE & INSIGHTS
 * ==============================================
 */

export class BusinessIntelligenceAPI {
  /**
   * Generate business intelligence insights
   * Maps to: AI-powered business intelligence generation
   */
  static async generateBusinessInsights(dataScope?: string, analysisType?: string): Promise<BusinessIntelligenceInsight[]> {
    return apiClient.get('/api/analytics/business-intelligence/insights', {
      params: { data_scope: dataScope, analysis_type: analysisType }
    });
  }

  /**
   * Create KPI dashboards for business metrics
   * Maps to: KPI dashboard generation
   */
  static async createKPIDashboard(kpiConfig: any): Promise<KPIDashboard> {
    return apiClient.post('/api/analytics/kpi/dashboard', kpiConfig);
  }

  /**
   * Analyze business impact of data assets
   * Maps to: Business impact analysis
   */
  static async analyzeBusinessImpact(assetIds: string[], impactMetrics?: string[]): Promise<ImpactAnalysis> {
    return apiClient.post('/api/analytics/business-impact', {
      asset_ids: assetIds,
      impact_metrics: impactMetrics
    });
  }

  /**
   * Generate ROI analysis for data initiatives
   * Maps to: ROI calculation and analysis
   */
  static async generateROIAnalysis(initiativeId: string, timeframe?: string): Promise<ROIAnalysis> {
    return apiClient.get(`/api/analytics/roi/${initiativeId}`, {
      params: { timeframe }
    });
  }

  /**
   * Benchmark performance against industry standards
   * Maps to: Benchmarking analysis
   */
  static async getBenchmarkingData(industry?: string, assetType?: string): Promise<BenchmarkingData> {
    return apiClient.get('/api/analytics/benchmarking', {
      params: { industry, asset_type: assetType }
    });
  }

  /**
   * Analyze cost optimization opportunities
   * Maps to: Cost analysis and optimization
   */
  static async getCostAnalysis(scope?: string, optimizationFocus?: string[]): Promise<CostAnalysis> {
    return apiClient.get('/api/analytics/cost-analysis', {
      params: { scope, optimization_focus: optimizationFocus }
    });
  }
}

/**
 * ==============================================
 * CUSTOM ANALYTICS & REPORTING
 * ==============================================
 */

export class CustomAnalyticsAPI {
  /**
   * Execute custom analytics queries
   * Maps to: Custom analytics execution engine
   */
  static async executeCustomAnalytics(request: CustomAnalyticsRequest): Promise<any> {
    return apiClient.post('/api/analytics/custom/execute', request);
  }

  /**
   * Create custom analytics reports
   * Maps to: Custom report generation
   */
  static async createCustomReport(reportConfig: any): Promise<AnalyticsReport> {
    return apiClient.post('/api/analytics/reports/custom', reportConfig);
  }

  /**
   * Build custom visualizations
   * Maps to: Custom visualization engine
   */
  static async createCustomVisualization(vizConfig: any): Promise<AnalyticsVisualization> {
    return apiClient.post('/api/analytics/visualizations/custom', vizConfig);
  }

  /**
   * Schedule recurring analytics reports
   * Maps to: Report scheduling system
   */
  static async scheduleAnalyticsReport(reportId: string, schedule: any): Promise<any> {
    return apiClient.post(`/api/analytics/reports/${reportId}/schedule`, schedule);
  }

  /**
   * Get analytics report templates
   * Maps to: Pre-built report templates
   */
  static async getReportTemplates(category?: string): Promise<any[]> {
    return apiClient.get('/api/analytics/reports/templates', {
      params: { category }
    });
  }

  /**
   * Share analytics dashboards and reports
   * Maps to: Analytics sharing and collaboration
   */
  static async shareAnalytics(analyticsId: string, shareConfig: any): Promise<any> {
    return apiClient.post(`/api/analytics/share/${analyticsId}`, shareConfig);
  }
}

/**
 * ==============================================
 * SPECIALIZED METRICS APIs
 * ==============================================
 */

export class SpecializedMetricsAPI {
  /**
   * Get data quality metrics aggregated across assets
   * Maps to: Quality metrics aggregation
   */
  static async getQualityMetricsAggregation(scope?: string): Promise<QualityMetrics> {
    return apiClient.get('/api/analytics/metrics/quality', {
      params: { scope }
    });
  }

  /**
   * Get data lineage metrics and coverage
   * Maps to: Lineage metrics analysis
   */
  static async getLineageMetrics(assetIds?: string[]): Promise<LineageMetrics> {
    return apiClient.post('/api/analytics/metrics/lineage', { asset_ids: assetIds });
  }

  /**
   * Get search and discovery metrics
   * Maps to: Search analytics and metrics
   */
  static async getSearchMetrics(timeframe?: string, userId?: string): Promise<SearchMetrics> {
    return apiClient.get('/api/analytics/metrics/search', {
      params: { timeframe, user_id: userId }
    });
  }

  /**
   * Get user activity and engagement metrics
   * Maps to: User activity tracking
   */
  static async getUserActivityMetrics(userIds?: string[], timeframe?: string): Promise<UserActivityMetrics> {
    return apiClient.post('/api/analytics/metrics/user-activity', {
      user_ids: userIds,
      timeframe
    });
  }

  /**
   * Get system performance and infrastructure metrics
   * Maps to: System metrics monitoring
   */
  static async getSystemMetrics(components?: string[]): Promise<SystemMetrics> {
    return apiClient.get('/api/analytics/metrics/system', {
      params: { components }
    });
  }

  /**
   * Aggregate metrics across multiple dimensions
   * Maps to: Multi-dimensional metrics aggregation
   */
  static async aggregateMetrics(aggregationConfig: any): Promise<MetricsAggregation> {
    return apiClient.post('/api/analytics/metrics/aggregate', aggregationConfig);
  }
}

/**
 * ==============================================
 * TREND ANALYSIS & FORECASTING
 * ==============================================
 */

export class TrendAnalysisAPI {
  /**
   * Analyze trends across multiple time periods
   * Maps to: Advanced trend analysis
   */
  static async analyzeTrends(metricType: string, timeframe: string, granularity?: string): Promise<TrendAnalysis> {
    return apiClient.get('/api/analytics/trends/analyze', {
      params: { metric_type: metricType, timeframe, granularity }
    });
  }

  /**
   * Detect anomalies in metrics and trends
   * Maps to: Anomaly detection in analytics
   */
  static async detectAnomalies(metricType: string, sensitivity?: number): Promise<any[]> {
    return apiClient.get('/api/analytics/trends/anomalies', {
      params: { metric_type: metricType, sensitivity }
    });
  }

  /**
   * Generate forecasts based on historical data
   * Maps to: Predictive forecasting
   */
  static async generateForecasts(metricType: string, horizon: string, confidence?: number): Promise<any> {
    return apiClient.get('/api/analytics/trends/forecast', {
      params: { metric_type: metricType, horizon, confidence }
    });
  }

  /**
   * Compare trends across different segments
   * Maps to: Comparative trend analysis
   */
  static async compareTrends(segments: string[], metricType: string, timeframe: string): Promise<any> {
    return apiClient.post('/api/analytics/trends/compare', {
      segments,
      metric_type: metricType,
      timeframe
    });
  }

  /**
   * Get seasonal patterns and cyclical trends
   * Maps to: Seasonal trend analysis
   */
  static async getSeasonalPatterns(metricType: string, periodicity?: string): Promise<any> {
    return apiClient.get('/api/analytics/trends/seasonal', {
      params: { metric_type: metricType, periodicity }
    });
  }
}

/**
 * ==============================================
 * COMPREHENSIVE ANALYTICS API
 * ==============================================
 */

export class AnalyticsAPI {
  // Combine all analytics APIs
  static readonly CatalogAnalytics = CatalogAnalyticsAPI;
  static readonly ComprehensiveAnalytics = ComprehensiveAnalyticsAPI;
  static readonly BusinessIntelligence = BusinessIntelligenceAPI;
  static readonly CustomAnalytics = CustomAnalyticsAPI;
  static readonly SpecializedMetrics = SpecializedMetricsAPI;
  static readonly TrendAnalysis = TrendAnalysisAPI;

  /**
   * Get unified analytics dashboard combining all metrics
   * Maps to: Master analytics dashboard aggregation
   */
  static async getUnifiedAnalyticsDashboard(options?: {
    include_catalog?: boolean;
    include_quality?: boolean;
    include_usage?: boolean;
    include_business_metrics?: boolean;
    include_predictions?: boolean;
    timeframe?: string;
  }): Promise<any> {
    return apiClient.get('/api/analytics/unified/dashboard', { params: options });
  }

  /**
   * Perform comprehensive analytics health check
   * Maps to: Analytics system health monitoring
   */
  static async performAnalyticsHealthCheck(): Promise<any> {
    return apiClient.get('/api/analytics/health-check');
  }

  /**
   * Export comprehensive analytics package
   * Maps to: Complete analytics data export
   */
  static async exportComprehensiveAnalytics(format: string, filters?: any): Promise<Blob> {
    return apiClient.get('/api/analytics/export/comprehensive', {
      params: { format, ...filters },
      responseType: 'blob'
    });
  }

  /**
   * Get analytics API usage statistics
   * Maps to: API usage monitoring and metrics
   */
  static async getAnalyticsAPIUsage(timeframe?: string): Promise<any> {
    return apiClient.get('/api/analytics/api-usage', {
      params: { timeframe }
    });
  }

  /**
   * Refresh analytics cache and recalculate metrics
   * Maps to: Analytics cache management
   */
  static async refreshAnalyticsCache(components?: string[]): Promise<any> {
    return apiClient.post('/api/analytics/cache/refresh', { components });
  }
}

// Default export with all analytics APIs
export default AnalyticsAPI;