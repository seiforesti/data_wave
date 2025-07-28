/**
 * Catalog Quality Management API Service
 * Maps to: catalog_quality_service.py, quality_assessment_service.py, data_profiling_service.py
 * 
 * Comprehensive API client for data quality management, assessment, monitoring,
 * and governance with AI-powered quality insights and recommendations.
 */

import { apiClient } from '@/shared/utils/api-client';
import type {
  QualityRule,
  QualityRuleExecution,
  QualityAssessment,
  QualityDimensionAssessment,
  QualityMetric,
  QualityRuleResult,
  QualityIssue,
  QualityRecommendation,
  RecommendedQualityAction,
  QualityActionItem,
  ActionItemComment,
  ActionItemStatusUpdate,
  QualityMonitor,
  QualityThreshold,
  QualityMonitorSchedule,
  QualityAlertConfig,
  QualityEscalationRule,
  QualityAlertRateLimit,
  MonitorExecutionStats,
  QualityAlert,
  HistoricalQualityComparison,
  QualityChange,
  PeerQualityComparison,
  BenchmarkQualityComparison,
  QualityGap,
  QualityDimension,
  QualityRuleType,
} from '../types/quality.types';

import type {
  DataProfile,
  ProfilingType,
  Anomaly,
  QualityMetrics,
} from '../types/metadata.types';

const API_BASE_URL = '/api/v1/catalog/quality'; // Base URL for quality APIs

export class CatalogQualityApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ===================== QUALITY RULES MANAGEMENT =====================

  /**
   * Create a new quality rule
   */
  async createQualityRule(ruleData: Partial<QualityRule>): Promise<QualityRule> {
    return apiClient.post<QualityRule>(`${this.baseUrl}/rules`, ruleData);
  }

  /**
   * Get quality rule by ID
   */
  async getQualityRuleById(ruleId: string): Promise<QualityRule> {
    return apiClient.get<QualityRule>(`${this.baseUrl}/rules/${ruleId}`);
  }

  /**
   * Get quality rules with filtering
   */
  async getQualityRules(filters: {
    target_asset_id?: string;
    rule_type?: QualityRuleType;
    dimension?: QualityDimension;
    severity?: string;
    is_active?: boolean;
    created_by?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  } = {}): Promise<{
    rules: QualityRule[];
    total_count: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    return apiClient.get(`${this.baseUrl}/rules?${params}`);
  }

  /**
   * Update quality rule
   */
  async updateQualityRule(ruleId: string, updates: Partial<QualityRule>): Promise<QualityRule> {
    return apiClient.put<QualityRule>(`${this.baseUrl}/rules/${ruleId}`, updates);
  }

  /**
   * Delete quality rule
   */
  async deleteQualityRule(ruleId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`${this.baseUrl}/rules/${ruleId}`);
  }

  /**
   * Bulk create quality rules
   */
  async bulkCreateQualityRules(rulesData: Partial<QualityRule>[]): Promise<{
    created_rules: QualityRule[];
    failed_creates: Array<{ rule_data: Partial<QualityRule>; error: string }>;
  }> {
    return apiClient.post(`${this.baseUrl}/rules/bulk-create`, { rules: rulesData });
  }

  /**
   * Test quality rule against sample data
   */
  async testQualityRule(
    ruleData: Partial<QualityRule>,
    sampleData?: Record<string, any>[]
  ): Promise<{
    test_result: QualityRuleResult;
    sample_violations: any[];
    rule_performance: {
      execution_time_ms: number;
      memory_usage_mb: number;
      rows_processed: number;
    };
  }> {
    const payload = {
      rule: ruleData,
      sample_data: sampleData,
    };
    return apiClient.post(`${this.baseUrl}/rules/test`, payload);
  }

  // ===================== QUALITY ASSESSMENT =====================

  /**
   * Trigger quality assessment for an asset
   */
  async triggerQualityAssessment(
    assetId: string,
    assessmentConfig: {
      assessment_type?: 'full' | 'quick' | 'custom' | 'scheduled';
      rules_to_execute?: string[];
      include_profiling?: boolean;
      include_anomaly_detection?: boolean;
      include_trend_analysis?: boolean;
      custom_rules?: QualityRule[];
      comparison_baseline?: string;
      notification_settings?: {
        notify_on_completion: boolean;
        notify_on_critical_issues: boolean;
        recipients: string[];
      };
    }
  ): Promise<{
    assessment_job_id: string;
    estimated_duration: number;
    rules_count: number;
    assessment_scope: string;
  }> {
    const payload = {
      asset_id: assetId,
      assessment_config: assessmentConfig,
    };
    return apiClient.post(`${this.baseUrl}/assessments/trigger`, payload);
  }

  /**
   * Get quality assessment results
   */
  async getQualityAssessment(assessmentId: string): Promise<QualityAssessment> {
    return apiClient.get<QualityAssessment>(`${this.baseUrl}/assessments/${assessmentId}`);
  }

  /**
   * Get quality assessments for an asset
   */
  async getAssetQualityAssessments(
    assetId: string,
    filters: {
      assessment_type?: string;
      date_from?: string;
      date_to?: string;
      min_score?: number;
      max_score?: number;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    assessments: QualityAssessment[];
    total_count: number;
    latest_assessment: QualityAssessment;
    quality_trend: Array<{ date: string; score: number }>;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return apiClient.get(`${this.baseUrl}/assets/${assetId}/assessments?${params}`);
  }

  /**
   * Get quality assessment job status
   */
  async getAssessmentJobStatus(jobId: string): Promise<{
    job_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    progress_percentage: number;
    rules_executed: number;
    total_rules: number;
    current_operation: string;
    estimated_completion: string;
    preliminary_results?: {
      critical_issues: number;
      warnings: number;
      overall_score_estimate: number;
    };
    error_message?: string;
  }> {
    return apiClient.get(`${this.baseUrl}/assessments/jobs/${jobId}/status`);
  }

  // ===================== QUALITY ISSUES MANAGEMENT =====================

  /**
   * Get quality issues
   */
  async getQualityIssues(filters: {
    asset_id?: string;
    severity?: string[];
    issue_type?: string[];
    status?: 'open' | 'acknowledged' | 'resolved' | 'ignored';
    assigned_to?: string;
    created_from?: string;
    created_to?: string;
    auto_fixable?: boolean;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}): Promise<{
    issues: QualityIssue[];
    total_count: number;
    issue_summary: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      total_affected_records: number;
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    return apiClient.get(`${this.baseUrl}/issues?${params}`);
  }

  /**
   * Update quality issue
   */
  async updateQualityIssue(
    issueId: string,
    updates: {
      status?: 'open' | 'acknowledged' | 'resolved' | 'ignored';
      assigned_to?: string;
      notes?: string;
      resolution_details?: string;
      priority_override?: string;
    }
  ): Promise<QualityIssue> {
    return apiClient.put<QualityIssue>(`${this.baseUrl}/issues/${issueId}`, updates);
  }

  /**
   * Bulk update quality issues
   */
  async bulkUpdateQualityIssues(
    issueIds: string[],
    updates: {
      status?: 'open' | 'acknowledged' | 'resolved' | 'ignored';
      assigned_to?: string;
      bulk_resolution_note?: string;
    }
  ): Promise<{
    updated_count: number;
    failed_updates: Array<{ issue_id: string; error: string }>;
  }> {
    const payload = {
      issue_ids: issueIds,
      updates,
    };
    return apiClient.post(`${this.baseUrl}/issues/bulk-update`, payload);
  }

  // ===================== QUALITY RECOMMENDATIONS =====================

  /**
   * Get quality recommendations for an asset
   */
  async getQualityRecommendations(
    assetId: string,
    filters: {
      recommendation_type?: string;
      priority?: string[];
      implementation_effort?: string[];
      expected_improvement_min?: number;
      include_cost_estimates?: boolean;
    } = {}
  ): Promise<{
    recommendations: QualityRecommendation[];
    prioritized_actions: RecommendedQualityAction[];
    improvement_roadmap: Array<{
      phase: number;
      phase_name: string;
      actions: RecommendedQualityAction[];
      estimated_duration: string;
      expected_improvement: number;
    }>;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    return apiClient.get(`${this.baseUrl}/assets/${assetId}/recommendations?${params}`);
  }

  /**
   * Generate AI-powered quality recommendations
   */
  async generateAIQualityRecommendations(
    assetId: string,
    analysisConfig: {
      include_historical_analysis?: boolean;
      include_peer_comparison?: boolean;
      include_industry_benchmarks?: boolean;
      focus_areas?: QualityDimension[];
      business_context?: Record<string, any>;
    }
  ): Promise<{
    job_id: string;
    estimated_analysis_time: number;
    analysis_scope: string[];
  }> {
    const payload = {
      asset_id: assetId,
      analysis_config: analysisConfig,
    };
    return apiClient.post(`${this.baseUrl}/recommendations/ai-generate`, payload);
  }

  /**
   * Get AI recommendation job results
   */
  async getAIRecommendationResults(jobId: string): Promise<{
    job_id: string;
    recommendations: QualityRecommendation[];
    ai_insights: Array<{
      insight_type: string;
      confidence: number;
      description: string;
      supporting_evidence: Record<string, any>;
    }>;
    benchmarking_results?: {
      peer_comparison: PeerQualityComparison;
      industry_benchmarks: BenchmarkQualityComparison;
      quality_gaps: QualityGap[];
    };
  }> {
    return apiClient.get(`${this.baseUrl}/recommendations/ai-jobs/${jobId}/results`);
  }

  // ===================== ACTION ITEMS MANAGEMENT =====================

  /**
   * Create quality action item
   */
  async createQualityActionItem(actionItemData: Partial<QualityActionItem>): Promise<QualityActionItem> {
    return apiClient.post<QualityActionItem>(`${this.baseUrl}/action-items`, actionItemData);
  }

  /**
   * Get quality action items
   */
  async getQualityActionItems(filters: {
    asset_id?: string;
    action_type?: string;
    priority?: string[];
    status?: string;
    assigned_to?: string;
    due_date_from?: string;
    due_date_to?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    action_items: QualityActionItem[];
    total_count: number;
    status_summary: Record<string, number>;
    overdue_count: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    return apiClient.get(`${this.baseUrl}/action-items?${params}`);
  }

  /**
   * Update action item status
   */
  async updateActionItemStatus(
    actionItemId: string,
    statusUpdate: ActionItemStatusUpdate
  ): Promise<QualityActionItem> {
    return apiClient.put<QualityActionItem>(`${this.baseUrl}/action-items/${actionItemId}/status`, statusUpdate);
  }

  /**
   * Add comment to action item
   */
  async addActionItemComment(
    actionItemId: string,
    comment: Partial<ActionItemComment>
  ): Promise<ActionItemComment> {
    return apiClient.post<ActionItemComment>(`${this.baseUrl}/action-items/${actionItemId}/comments`, comment);
  }

  // ===================== QUALITY MONITORING =====================

  /**
   * Create quality monitor
   */
  async createQualityMonitor(monitorData: Partial<QualityMonitor>): Promise<QualityMonitor> {
    return apiClient.post<QualityMonitor>(`${this.baseUrl}/monitors`, monitorData);
  }

  /**
   * Get quality monitors
   */
  async getQualityMonitors(filters: {
    asset_id?: string;
    monitor_type?: string;
    status?: 'active' | 'paused' | 'disabled';
    created_by?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    monitors: QualityMonitor[];
    total_count: number;
    active_monitors: number;
    monitors_with_alerts: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return apiClient.get(`${this.baseUrl}/monitors?${params}`);
  }

  /**
   * Update quality monitor
   */
  async updateQualityMonitor(monitorId: string, updates: Partial<QualityMonitor>): Promise<QualityMonitor> {
    return apiClient.put<QualityMonitor>(`${this.baseUrl}/monitors/${monitorId}`, updates);
  }

  /**
   * Get monitor execution stats
   */
  async getMonitorExecutionStats(
    monitorId: string,
    timeRange: string = '30d'
  ): Promise<MonitorExecutionStats> {
    const params = new URLSearchParams({ time_range: timeRange });
    return apiClient.get<MonitorExecutionStats>(`${this.baseUrl}/monitors/${monitorId}/stats?${params}`);
  }

  /**
   * Trigger manual monitor execution
   */
  async triggerMonitorExecution(monitorId: string): Promise<{
    execution_id: string;
    estimated_duration: number;
    trigger_reason: string;
  }> {
    return apiClient.post(`${this.baseUrl}/monitors/${monitorId}/execute`, {});
  }

  // ===================== QUALITY ALERTS =====================

  /**
   * Get quality alerts
   */
  async getQualityAlerts(filters: {
    monitor_id?: string;
    asset_id?: string;
    severity?: string[];
    status?: 'active' | 'acknowledged' | 'resolved';
    triggered_from?: string;
    triggered_to?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    alerts: QualityAlert[];
    total_count: number;
    active_alerts: number;
    critical_alerts: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    return apiClient.get(`${this.baseUrl}/alerts?${params}`);
  }

  /**
   * Acknowledge quality alert
   */
  async acknowledgeQualityAlert(
    alertId: string,
    acknowledgment: {
      acknowledged_by: string;
      acknowledgment_note?: string;
      estimated_resolution_time?: string;
    }
  ): Promise<QualityAlert> {
    return apiClient.post<QualityAlert>(`${this.baseUrl}/alerts/${alertId}/acknowledge`, acknowledgment);
  }

  /**
   * Resolve quality alert
   */
  async resolveQualityAlert(
    alertId: string,
    resolution: {
      resolved_by: string;
      resolution_note: string;
      root_cause?: string;
      corrective_actions?: string[];
    }
  ): Promise<QualityAlert> {
    return apiClient.post<QualityAlert>(`${this.baseUrl}/alerts/${alertId}/resolve`, resolution);
  }

  // ===================== QUALITY ANALYTICS =====================

  /**
   * Get quality trends for an asset
   */
  async getQualityTrends(
    assetId: string,
    timeRange: string = '90d',
    granularity: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<{
    overall_trend: Array<{ date: string; score: number }>;
    dimension_trends: Array<{
      dimension: QualityDimension;
      trend: Array<{ date: string; score: number }>;
    }>;
    trend_analysis: {
      trend_direction: 'improving' | 'declining' | 'stable';
      trend_strength: number;
      significant_changes: Array<{
        date: string;
        change_type: 'improvement' | 'degradation';
        magnitude: number;
        possible_causes: string[];
      }>;
    };
  }> {
    const params = new URLSearchParams({
      time_range: timeRange,
      granularity,
    });
    return apiClient.get(`${this.baseUrl}/assets/${assetId}/trends?${params}`);
  }

  /**
   * Compare quality with historical baselines
   */
  async compareQualityWithHistory(
    assetId: string,
    comparisonConfig: {
      baseline_period: string;
      comparison_period: string;
      include_peer_comparison?: boolean;
      dimensions_to_compare?: QualityDimension[];
    }
  ): Promise<HistoricalQualityComparison> {
    const payload = {
      asset_id: assetId,
      comparison_config: comparisonConfig,
    };
    return apiClient.post<HistoricalQualityComparison>(`${this.baseUrl}/analytics/historical-comparison`, payload);
  }

  /**
   * Get quality metrics summary
   */
  async getQualityMetricsSummary(filters: {
    asset_ids?: string[];
    business_domain?: string;
    asset_types?: string[];
    time_range?: string;
    include_trends?: boolean;
  } = {}): Promise<{
    overall_metrics: QualityMetrics;
    asset_metrics: Array<{
      asset_id: string;
      asset_name: string;
      metrics: QualityMetrics;
    }>;
    domain_metrics?: Array<{
      domain: string;
      metrics: QualityMetrics;
    }>;
    trend_indicators?: {
      improving_assets: number;
      declining_assets: number;
      stable_assets: number;
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    return apiClient.get(`${this.baseUrl}/analytics/metrics-summary?${params}`);
  }

  // ===================== QUALITY CONFIGURATION =====================

  /**
   * Get quality configuration
   */
  async getQualityConfiguration(): Promise<{
    default_thresholds: Record<QualityDimension, number>;
    assessment_schedules: QualityMonitorSchedule[];
    notification_settings: QualityAlertConfig;
    escalation_rules: QualityEscalationRule[];
    rate_limits: QualityAlertRateLimit[];
  }> {
    return apiClient.get(`${this.baseUrl}/configuration`);
  }

  /**
   * Update quality configuration
   */
  async updateQualityConfiguration(config: {
    default_thresholds?: Partial<Record<QualityDimension, number>>;
    assessment_schedules?: QualityMonitorSchedule[];
    notification_settings?: Partial<QualityAlertConfig>;
    escalation_rules?: QualityEscalationRule[];
    rate_limits?: QualityAlertRateLimit[];
  }): Promise<{ success: boolean; message: string }> {
    return apiClient.put(`${this.baseUrl}/configuration`, config);
  }
}

// Export singleton instance
export const catalogQualityApiClient = new CatalogQualityApiClient();