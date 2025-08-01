// Advanced-Scan-Logic/services/scan-analytics-apis.ts
// Comprehensive scan analytics API service aligned with backend routes

import {
  ScanAnalytics,
  AnalyticsMetric,
  AnalyticsInsight,
  AnalyticsReport,
  TrendAnalysis,
  PredictiveAnalytics,
  PerformanceAnalytics,
  BusinessInsight,
  AnalyticsScope,
  AnalyticsGranularity,
  InsightType,
  InsightPriority,
  ReportType,
  ReportFormat
} from '../types/analytics.types';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Request types based on backend models
interface ScanAnalyticsRequest {
  analysis_type: string;
  scope?: string;
  target_ids?: string[];
  timeframe?: string;
  granularity?: string;
  include_predictions?: boolean;
  include_anomalies?: boolean;
}

interface PerformanceAnalyticsRequest {
  metric_types: string[];
  aggregation_method?: string;
  comparison_baseline?: string;
  include_bottlenecks?: boolean;
  optimization_focus?: string;
}

interface TrendAnalysisRequest {
  trend_dimensions: string[];
  forecasting_horizon?: string;
  confidence_level?: number;
  seasonal_analysis?: boolean;
  correlation_analysis?: boolean;
}

interface ScanInsightsRequest {
  insight_categories: string[];
  priority_threshold?: number;
  actionable_only?: boolean;
  business_context?: Record<string, any>;
}

interface ReportRequest {
  report_type: string;
  sections: string[];
  format?: string;
  delivery_method?: string;
}

class ScanAnalyticsAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/v1/scan-analytics`;
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================== COMPREHENSIVE ANALYTICS ====================

  /**
   * Generate comprehensive scan analytics
   * Maps to: POST /scan-analytics/analyze
   * Backend: scan_analytics_routes.py -> generate_scan_analytics
   */
  async generateScanAnalytics(request: ScanAnalyticsRequest): Promise<{
    analytics_id: string;
    analytics: ScanAnalytics;
    insights: AnalyticsInsight[];
    recommendations: string[];
    metadata: any;
  }> {
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get analytics overview
   * Maps to: GET /scan-analytics/overview
   * Backend: scan_analytics_routes.py -> get_analytics_overview
   */
  async getAnalyticsOverview(params: {
    scope?: AnalyticsScope;
    time_range?: string;
    include_trends?: boolean;
    include_forecasts?: boolean;
  } = {}): Promise<{
    overview: any;
    key_metrics: AnalyticsMetric[];
    performance_summary: any;
    insights_summary: any;
    recent_trends: TrendAnalysis[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.scope) queryParams.append('scope', params.scope);
    if (params.time_range) queryParams.append('time_range', params.time_range);
    if (params.include_trends !== undefined) queryParams.append('include_trends', params.include_trends.toString());
    if (params.include_forecasts !== undefined) queryParams.append('include_forecasts', params.include_forecasts.toString());

    const response = await fetch(`${this.baseUrl}/overview?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get real-time analytics metrics
   * Maps to: GET /scan-analytics/metrics/realtime
   * Backend: scan_analytics_routes.py -> get_realtime_metrics
   */
  async getRealtimeMetrics(params: {
    metric_types?: string[];
    granularity?: AnalyticsGranularity;
    refresh_interval?: number;
  } = {}): Promise<{
    metrics: AnalyticsMetric[];
    timestamp: string;
    next_refresh: string;
    performance_indicators: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.metric_types) {
      params.metric_types.forEach(type => queryParams.append('metric_types', type));
    }
    if (params.granularity) queryParams.append('granularity', params.granularity);
    if (params.refresh_interval) queryParams.append('refresh_interval', params.refresh_interval.toString());

    const response = await fetch(`${this.baseUrl}/metrics/realtime?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== PERFORMANCE ANALYTICS ====================

  /**
   * Analyze scan performance metrics
   * Maps to: POST /scan-analytics/performance/analyze
   * Backend: scan_analytics_routes.py -> analyze_performance_metrics
   */
  async analyzePerformanceMetrics(request: PerformanceAnalyticsRequest): Promise<{
    performance_analytics: PerformanceAnalytics;
    bottleneck_analysis: any;
    optimization_recommendations: string[];
    benchmark_comparisons: any;
    efficiency_scores: any;
  }> {
    const response = await fetch(`${this.baseUrl}/performance/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get performance benchmarks
   * Maps to: GET /scan-analytics/performance/benchmarks
   * Backend: scan_analytics_routes.py -> get_performance_benchmarks
   */
  async getPerformanceBenchmarks(params: {
    benchmark_type?: string[];
    time_range?: string;
    comparison_scope?: string;
  } = {}): Promise<{
    benchmarks: any[];
    industry_comparisons: any;
    historical_performance: any;
    improvement_areas: string[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.benchmark_type) {
      params.benchmark_type.forEach(type => queryParams.append('benchmark_type', type));
    }
    if (params.time_range) queryParams.append('time_range', params.time_range);
    if (params.comparison_scope) queryParams.append('comparison_scope', params.comparison_scope);

    const response = await fetch(`${this.baseUrl}/performance/benchmarks?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get efficiency analysis
   * Maps to: GET /scan-analytics/performance/efficiency
   * Backend: scan_analytics_routes.py -> get_efficiency_analysis
   */
  async getEfficiencyAnalysis(params: {
    analysis_scope?: AnalyticsScope;
    time_range?: string;
    include_recommendations?: boolean;
  } = {}): Promise<{
    efficiency_metrics: any;
    resource_utilization: any;
    cost_effectiveness: any;
    optimization_opportunities: any[];
    efficiency_trends: TrendAnalysis[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.analysis_scope) queryParams.append('analysis_scope', params.analysis_scope);
    if (params.time_range) queryParams.append('time_range', params.time_range);
    if (params.include_recommendations !== undefined) queryParams.append('include_recommendations', params.include_recommendations.toString());

    const response = await fetch(`${this.baseUrl}/performance/efficiency?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== TREND ANALYSIS ====================

  /**
   * Perform comprehensive trend analysis
   * Maps to: POST /scan-analytics/trends/analyze
   * Backend: scan_analytics_routes.py -> analyze_trends
   */
  async analyzeTrends(request: TrendAnalysisRequest): Promise<{
    trend_analysis: TrendAnalysis;
    pattern_recognition: any;
    seasonal_patterns: any;
    correlation_matrix: any;
    forecast_accuracy: any;
  }> {
    const response = await fetch(`${this.baseUrl}/trends/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get trending metrics
   * Maps to: GET /scan-analytics/trends/metrics
   * Backend: scan_analytics_routes.py -> get_trending_metrics
   */
  async getTrendingMetrics(params: {
    time_range?: string;
    trend_direction?: 'up' | 'down' | 'stable';
    significance_threshold?: number;
    metric_categories?: string[];
  } = {}): Promise<{
    trending_up: AnalyticsMetric[];
    trending_down: AnalyticsMetric[];
    stable_metrics: AnalyticsMetric[];
    significant_changes: any[];
    trend_summary: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.time_range) queryParams.append('time_range', params.time_range);
    if (params.trend_direction) queryParams.append('trend_direction', params.trend_direction);
    if (params.significance_threshold) queryParams.append('significance_threshold', params.significance_threshold.toString());
    if (params.metric_categories) {
      params.metric_categories.forEach(cat => queryParams.append('metric_categories', cat));
    }

    const response = await fetch(`${this.baseUrl}/trends/metrics?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get predictive forecasts
   * Maps to: GET /scan-analytics/trends/forecasts
   * Backend: scan_analytics_routes.py -> get_predictive_forecasts
   */
  async getPredictiveForecasts(params: {
    forecast_horizon?: string;
    metric_types?: string[];
    confidence_intervals?: boolean;
    scenario_analysis?: boolean;
  } = {}): Promise<{
    forecasts: PredictiveAnalytics[];
    confidence_intervals: any;
    scenario_outcomes: any;
    forecast_accuracy: any;
    risk_assessments: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.forecast_horizon) queryParams.append('forecast_horizon', params.forecast_horizon);
    if (params.metric_types) {
      params.metric_types.forEach(type => queryParams.append('metric_types', type));
    }
    if (params.confidence_intervals !== undefined) queryParams.append('confidence_intervals', params.confidence_intervals.toString());
    if (params.scenario_analysis !== undefined) queryParams.append('scenario_analysis', params.scenario_analysis.toString());

    const response = await fetch(`${this.baseUrl}/trends/forecasts?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== INSIGHTS GENERATION ====================

  /**
   * Generate actionable insights
   * Maps to: POST /scan-analytics/insights/generate
   * Backend: scan_analytics_routes.py -> generate_insights
   */
  async generateInsights(request: ScanInsightsRequest): Promise<{
    insights: AnalyticsInsight[];
    prioritized_recommendations: any[];
    business_impact_analysis: any;
    implementation_roadmap: any;
    roi_projections: any;
  }> {
    const response = await fetch(`${this.baseUrl}/insights/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get business insights
   * Maps to: GET /scan-analytics/insights/business
   * Backend: scan_analytics_routes.py -> get_business_insights
   */
  async getBusinessInsights(params: {
    insight_types?: InsightType[];
    priority_filter?: InsightPriority[];
    business_domain?: string[];
    time_range?: string;
  } = {}): Promise<{
    business_insights: BusinessInsight[];
    value_propositions: any[];
    cost_benefit_analysis: any;
    strategic_recommendations: string[];
    competitive_advantages: any[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.insight_types) {
      params.insight_types.forEach(type => queryParams.append('insight_types', type));
    }
    if (params.priority_filter) {
      params.priority_filter.forEach(priority => queryParams.append('priority_filter', priority));
    }
    if (params.business_domain) {
      params.business_domain.forEach(domain => queryParams.append('business_domain', domain));
    }
    if (params.time_range) queryParams.append('time_range', params.time_range);

    const response = await fetch(`${this.baseUrl}/insights/business?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get operational insights
   * Maps to: GET /scan-analytics/insights/operational
   * Backend: scan_analytics_routes.py -> get_operational_insights
   */
  async getOperationalInsights(params: {
    operational_areas?: string[];
    urgency_filter?: string[];
    include_automation_opportunities?: boolean;
  } = {}): Promise<{
    operational_insights: AnalyticsInsight[];
    automation_opportunities: any[];
    process_improvements: any[];
    resource_optimizations: any[];
    efficiency_gains: any[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.operational_areas) {
      params.operational_areas.forEach(area => queryParams.append('operational_areas', area));
    }
    if (params.urgency_filter) {
      params.urgency_filter.forEach(urgency => queryParams.append('urgency_filter', urgency));
    }
    if (params.include_automation_opportunities !== undefined) {
      queryParams.append('include_automation_opportunities', params.include_automation_opportunities.toString());
    }

    const response = await fetch(`${this.baseUrl}/insights/operational?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== ANOMALY DETECTION ====================

  /**
   * Detect analytics anomalies
   * Maps to: POST /scan-analytics/anomalies/detect
   * Backend: scan_analytics_routes.py -> detect_anomalies
   */
  async detectAnomalies(request: {
    detection_scope: AnalyticsScope;
    sensitivity_level?: number;
    anomaly_types?: string[];
    time_range?: string;
    baseline_period?: string;
  }): Promise<{
    anomalies: any[];
    anomaly_patterns: any;
    severity_distribution: any;
    root_cause_analysis: any;
    remediation_suggestions: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/anomalies/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get active anomalies
   * Maps to: GET /scan-analytics/anomalies/active
   * Backend: scan_analytics_routes.py -> get_active_anomalies
   */
  async getActiveAnomalies(params: {
    severity_filter?: string[];
    anomaly_types?: string[];
    time_range?: string;
  } = {}): Promise<{
    active_anomalies: any[];
    critical_anomalies: any[];
    anomaly_trends: any;
    impact_assessment: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.severity_filter) {
      params.severity_filter.forEach(severity => queryParams.append('severity_filter', severity));
    }
    if (params.anomaly_types) {
      params.anomaly_types.forEach(type => queryParams.append('anomaly_types', type));
    }
    if (params.time_range) queryParams.append('time_range', params.time_range);

    const response = await fetch(`${this.baseUrl}/anomalies/active?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== ANALYTICS REPORTS ====================

  /**
   * Generate analytics report
   * Maps to: POST /scan-analytics/reports/generate
   * Backend: scan_analytics_routes.py -> generate_analytics_report
   */
  async generateAnalyticsReport(request: ReportRequest): Promise<{
    report_id: string;
    report: AnalyticsReport;
    generation_status: string;
    estimated_completion: string;
  }> {
    const response = await fetch(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get analytics report
   * Maps to: GET /scan-analytics/reports/{report_id}
   * Backend: scan_analytics_routes.py -> get_analytics_report
   */
  async getAnalyticsReport(reportId: string, format?: ReportFormat): Promise<AnalyticsReport | Blob> {
    const queryParams = new URLSearchParams();
    if (format) queryParams.append('format', format);

    const response = await fetch(`${this.baseUrl}/reports/${reportId}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (format === ReportFormat.PDF || format === ReportFormat.EXCEL) {
      return response.blob();
    }

    return this.handleResponse(response);
  }

  /**
   * Get available reports
   * Maps to: GET /scan-analytics/reports
   * Backend: scan_analytics_routes.py -> list_analytics_reports
   */
  async getAvailableReports(params: {
    report_type?: ReportType[];
    date_range?: { start: string; end: string };
    status?: string[];
  } = {}): Promise<{
    reports: AnalyticsReport[];
    total: number;
    report_categories: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.report_type) {
      params.report_type.forEach(type => queryParams.append('report_type', type));
    }
    if (params.date_range) {
      queryParams.append('start_date', params.date_range.start);
      queryParams.append('end_date', params.date_range.end);
    }
    if (params.status) {
      params.status.forEach(status => queryParams.append('status', status));
    }

    const response = await fetch(`${this.baseUrl}/reports?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== COMPARATIVE ANALYTICS ====================

  /**
   * Perform comparative analysis
   * Maps to: POST /scan-analytics/compare
   * Backend: scan_analytics_routes.py -> perform_comparative_analysis
   */
  async performComparativeAnalysis(request: {
    comparison_type: string;
    baseline_period: string;
    comparison_period: string;
    metrics_to_compare: string[];
    comparison_scope?: AnalyticsScope;
  }): Promise<{
    comparison_results: any;
    variance_analysis: any;
    significant_changes: any[];
    trend_comparisons: any;
    performance_deltas: any;
  }> {
    const response = await fetch(`${this.baseUrl}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get benchmark comparisons
   * Maps to: GET /scan-analytics/compare/benchmarks
   * Backend: scan_analytics_routes.py -> get_benchmark_comparisons
   */
  async getBenchmarkComparisons(params: {
    benchmark_type?: string;
    comparison_metrics?: string[];
    industry_segment?: string;
  } = {}): Promise<{
    benchmark_results: any;
    industry_percentiles: any;
    competitive_positioning: any;
    improvement_gaps: any[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.benchmark_type) queryParams.append('benchmark_type', params.benchmark_type);
    if (params.comparison_metrics) {
      params.comparison_metrics.forEach(metric => queryParams.append('comparison_metrics', metric));
    }
    if (params.industry_segment) queryParams.append('industry_segment', params.industry_segment);

    const response = await fetch(`${this.baseUrl}/compare/benchmarks?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== REAL-TIME ANALYTICS ====================

  /**
   * Subscribe to real-time analytics updates
   * Maps to: WebSocket /scan-analytics/ws/realtime
   * Backend: scan_analytics_routes.py -> websocket_realtime_analytics
   */
  subscribeToRealtimeAnalytics(
    params: { metric_types?: string[]; update_frequency?: number },
    onUpdate: (data: any) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws/realtime`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', ...params }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (error) {
        console.error('Failed to parse analytics update:', error);
      }
    };

    ws.onerror = (error) => {
      if (onError) onError(error);
    };

    return ws;
  }

  /**
   * Subscribe to analytics alerts
   * Maps to: WebSocket /scan-analytics/ws/alerts
   * Backend: scan_analytics_routes.py -> websocket_analytics_alerts
   */
  subscribeToAnalyticsAlerts(
    onAlert: (alert: any) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws/alerts`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const alert = JSON.parse(event.data);
        onAlert(alert);
      } catch (error) {
        console.error('Failed to parse analytics alert:', error);
      }
    };

    ws.onerror = (error) => {
      if (onError) onError(error);
    };

    return ws;
  }

  // ==================== ANALYTICS CONFIGURATION ====================

  /**
   * Get analytics configuration
   * Maps to: GET /scan-analytics/config
   * Backend: scan_analytics_routes.py -> get_analytics_configuration
   */
  async getAnalyticsConfiguration(): Promise<{
    analytics_settings: any;
    data_retention_policies: any;
    processing_schedules: any;
    alert_configurations: any;
    integration_settings: any;
  }> {
    const response = await fetch(`${this.baseUrl}/config`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Update analytics configuration
   * Maps to: PUT /scan-analytics/config
   * Backend: scan_analytics_routes.py -> update_analytics_configuration
   */
  async updateAnalyticsConfiguration(config: {
    analytics_settings?: any;
    data_retention_policies?: any;
    processing_schedules?: any;
    alert_configurations?: any;
  }): Promise<{
    success: boolean;
    message: string;
    updated_config: any;
  }> {
    const response = await fetch(`${this.baseUrl}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(config)
    });

    return this.handleResponse(response);
  }
}

// Export singleton instance
export const scanAnalyticsAPI = new ScanAnalyticsAPI();
export default scanAnalyticsAPI;