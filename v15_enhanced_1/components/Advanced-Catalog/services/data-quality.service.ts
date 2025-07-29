// ============================================================================
// DATA QUALITY SERVICE - ADVANCED QUALITY MANAGEMENT OPERATIONS
// ============================================================================
// Enterprise Data Governance System - Data Quality Service
// Comprehensive quality monitoring, issue tracking, rule management,
// alert handling, and quality improvement recommendations
// ============================================================================

import { apiClient } from '../../../shared/services/api-client';
import {
  DataQualityMetrics,
  QualityIssue,
  QualityRule,
  QualityCheck,
  QualityReport,
  QualityTrend,
  QualityAlert,
  QualityRecommendation,
  QualityProfile,
  QualityDimension,
  QualityThreshold,
  QualityScorecard,
  CatalogAsset
} from '../types/catalog-core.types';

// ============================================================================
// DATA QUALITY SERVICE CLASS
// ============================================================================

class DataQualityService {
  private readonly baseUrl = '/api/v1/catalog/quality';

  // ========================================================================
  // QUALITY METRICS OPERATIONS
  // ========================================================================

  /**
   * Get data quality metrics for an asset
   */
  async getAssetQualityMetrics(
    assetId: string,
    filters?: {
      dateRange?: { start: Date; end: Date };
      dimensions?: string[];
      includeHistory?: boolean;
    }
  ): Promise<DataQualityMetrics> {
    const response = await apiClient.get(`${this.baseUrl}/metrics/${assetId}`, {
      params: {
        startDate: filters?.dateRange?.start?.toISOString(),
        endDate: filters?.dateRange?.end?.toISOString(),
        dimensions: filters?.dimensions?.join(','),
        includeHistory: filters?.includeHistory || false
      }
    });
    return response.data;
  }

  /**
   * Get aggregated quality metrics for multiple assets
   */
  async getMultiAssetQualityMetrics(
    assetIds: string[],
    aggregationType: 'average' | 'weighted' | 'minimum' | 'maximum' = 'average'
  ): Promise<DataQualityMetrics> {
    const response = await apiClient.post(`${this.baseUrl}/metrics/multi-asset`, {
      assetIds,
      aggregationType
    });
    return response.data;
  }

  /**
   * Get quality metrics by schema or database
   */
  async getSchemaQualityMetrics(
    schemaId: string,
    includeAssetBreakdown: boolean = false
  ): Promise<{
    overallMetrics: DataQualityMetrics;
    assetMetrics?: Array<{
      assetId: string;
      assetName: string;
      metrics: DataQualityMetrics;
    }>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/metrics/schema/${schemaId}`, {
      params: { includeAssetBreakdown }
    });
    return response.data;
  }

  /**
   * Get real-time quality metrics
   */
  async getRealTimeQualityMetrics(assetId: string): Promise<{
    metrics: DataQualityMetrics;
    lastUpdated: Date;
    refreshRate: number;
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
  }> {
    const response = await apiClient.get(`${this.baseUrl}/metrics/${assetId}/realtime`);
    return response.data;
  }

  // ========================================================================
  // QUALITY ISSUES OPERATIONS
  // ========================================================================

  /**
   * Get quality issues for an asset
   */
  async getQualityIssues(
    assetId: string,
    filters?: {
      dateRange?: { start: Date; end: Date };
      severities?: string[];
      dimensions?: string[];
      status?: string[];
      assignees?: string[];
      limit?: number;
      offset?: number;
    }
  ): Promise<QualityIssue[]> {
    const response = await apiClient.get(`${this.baseUrl}/issues/${assetId}`, {
      params: {
        startDate: filters?.dateRange?.start?.toISOString(),
        endDate: filters?.dateRange?.end?.toISOString(),
        severities: filters?.severities?.join(','),
        dimensions: filters?.dimensions?.join(','),
        status: filters?.status?.join(','),
        assignees: filters?.assignees?.join(','),
        limit: filters?.limit || 50,
        offset: filters?.offset || 0
      }
    });
    return response.data;
  }

  /**
   * Get all quality issues across organization
   */
  async getAllQualityIssues(
    filters?: {
      assetTypes?: string[];
      severities?: string[];
      status?: string[];
      assignees?: string[];
      dateRange?: { start: Date; end: Date };
      search?: string;
      sortBy?: 'severity' | 'createdAt' | 'updatedAt' | 'assetName';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    issues: QualityIssue[];
    total: number;
    summary: {
      byStatus: Record<string, number>;
      bySeverity: Record<string, number>;
      byDimension: Record<string, number>;
    };
  }> {
    const response = await apiClient.post(`${this.baseUrl}/issues/search`, { filters });
    return response.data;
  }

  /**
   * Get quality issue details
   */
  async getQualityIssueDetails(issueId: string): Promise<{
    issue: QualityIssue;
    history: Array<{
      timestamp: Date;
      action: string;
      user: string;
      comment?: string;
      oldValue?: any;
      newValue?: any;
    }>;
    relatedIssues: QualityIssue[];
    affectedRecords: number;
    impactAnalysis: {
      downstreamAssets: string[];
      businessProcesses: string[];
      estimatedImpact: 'low' | 'medium' | 'high' | 'critical';
    };
  }> {
    const response = await apiClient.get(`${this.baseUrl}/issues/details/${issueId}`);
    return response.data;
  }

  /**
   * Create a new quality issue
   */
  async createQualityIssue(issue: {
    assetId: string;
    title: string;
    description: string;
    dimension: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    ruleId?: string;
    affectedRecords?: number;
    metadata?: Record<string, any>;
  }): Promise<QualityIssue> {
    const response = await apiClient.post(`${this.baseUrl}/issues`, issue);
    return response.data;
  }

  /**
   * Update quality issue
   */
  async updateQualityIssue(
    issueId: string,
    updates: {
      status?: 'open' | 'in_progress' | 'resolved' | 'closed';
      assignee?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      resolution?: string;
      comment?: string;
    }
  ): Promise<QualityIssue> {
    const response = await apiClient.patch(`${this.baseUrl}/issues/${issueId}`, updates);
    return response.data;
  }

  /**
   * Resolve quality issue
   */
  async resolveQualityIssue(
    issueId: string,
    resolution?: {
      resolutionType: 'fixed' | 'false_positive' | 'accepted' | 'duplicate';
      comment: string;
      relatedIssueId?: string;
    }
  ): Promise<QualityIssue> {
    const response = await apiClient.post(`${this.baseUrl}/issues/${issueId}/resolve`, resolution);
    return response.data;
  }

  /**
   * Assign quality issue to user
   */
  async assignQualityIssue(issueId: string, assigneeId: string, comment?: string): Promise<QualityIssue> {
    const response = await apiClient.post(`${this.baseUrl}/issues/${issueId}/assign`, {
      assigneeId,
      comment
    });
    return response.data;
  }

  // ========================================================================
  // QUALITY RULES OPERATIONS
  // ========================================================================

  /**
   * Get quality rules for an asset
   */
  async getQualityRules(assetId: string): Promise<QualityRule[]> {
    const response = await apiClient.get(`${this.baseUrl}/rules/asset/${assetId}`);
    return response.data;
  }

  /**
   * Get all quality rules
   */
  async getAllQualityRules(
    filters?: {
      enabled?: boolean;
      dimensions?: string[];
      assetTypes?: string[];
      search?: string;
      sortBy?: 'name' | 'dimension' | 'createdAt' | 'lastRun';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<QualityRule[]> {
    const response = await apiClient.get(`${this.baseUrl}/rules`, { params: filters });
    return response.data;
  }

  /**
   * Get quality rule details
   */
  async getQualityRuleDetails(ruleId: string): Promise<{
    rule: QualityRule;
    executionHistory: Array<{
      timestamp: Date;
      status: 'success' | 'failed' | 'warning';
      score: number;
      executionTime: number;
      recordsChecked: number;
      issuesFound: number;
      message?: string;
    }>;
    performance: {
      averageExecutionTime: number;
      successRate: number;
      averageScore: number;
      trend: 'improving' | 'declining' | 'stable';
    };
  }> {
    const response = await apiClient.get(`${this.baseUrl}/rules/details/${ruleId}`);
    return response.data;
  }

  /**
   * Create a new quality rule
   */
  async createQualityRule(rule: Partial<QualityRule>): Promise<QualityRule> {
    const response = await apiClient.post(`${this.baseUrl}/rules`, rule);
    return response.data;
  }

  /**
   * Update quality rule
   */
  async updateQualityRule(ruleId: string, updates: Partial<QualityRule>): Promise<QualityRule> {
    const response = await apiClient.patch(`${this.baseUrl}/rules/${ruleId}`, updates);
    return response.data;
  }

  /**
   * Delete quality rule
   */
  async deleteQualityRule(ruleId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/rules/${ruleId}`);
  }

  /**
   * Execute quality rule
   */
  async executeQualityRule(
    ruleId: string,
    options?: {
      assetIds?: string[];
      scheduleLater?: Date;
      notifyOnCompletion?: boolean;
    }
  ): Promise<{
    executionId: string;
    status: 'scheduled' | 'running' | 'completed';
    estimatedCompletion?: Date;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/rules/${ruleId}/execute`, options);
    return response.data;
  }

  /**
   * Test quality rule
   */
  async testQualityRule(
    rule: Partial<QualityRule>,
    assetId: string,
    sampleSize?: number
  ): Promise<{
    isValid: boolean;
    testResults: {
      score: number;
      recordsChecked: number;
      executionTime: number;
      sampleData: Array<{
        passed: boolean;
        value: any;
        reason?: string;
      }>;
    };
    recommendations: string[];
  }> {
    const response = await apiClient.post(`${this.baseUrl}/rules/test`, {
      rule,
      assetId,
      sampleSize: sampleSize || 1000
    });
    return response.data;
  }

  // ========================================================================
  // QUALITY ALERTS OPERATIONS
  // ========================================================================

  /**
   * Get quality alerts for an asset
   */
  async getQualityAlerts(assetId: string): Promise<QualityAlert[]> {
    const response = await apiClient.get(`${this.baseUrl}/alerts/asset/${assetId}`);
    return response.data;
  }

  /**
   * Get all quality alerts
   */
  async getAllQualityAlerts(
    filters?: {
      status?: ('active' | 'acknowledged' | 'resolved')[];
      severities?: string[];
      types?: string[];
      assetIds?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    alerts: QualityAlert[];
    total: number;
    summary: {
      active: number;
      acknowledged: number;
      resolved: number;
      bySeverity: Record<string, number>;
    };
  }> {
    const response = await apiClient.post(`${this.baseUrl}/alerts/search`, { filters });
    return response.data;
  }

  /**
   * Acknowledge quality alert
   */
  async acknowledgeQualityAlert(alertId: string, comment?: string): Promise<QualityAlert> {
    const response = await apiClient.post(`${this.baseUrl}/alerts/${alertId}/acknowledge`, {
      comment
    });
    return response.data;
  }

  /**
   * Resolve quality alert
   */
  async resolveQualityAlert(
    alertId: string,
    resolution: {
      resolutionType: 'fixed' | 'false_positive' | 'accepted';
      comment: string;
      preventRecurrence?: boolean;
    }
  ): Promise<QualityAlert> {
    const response = await apiClient.post(`${this.baseUrl}/alerts/${alertId}/resolve`, resolution);
    return response.data;
  }

  /**
   * Create quality alert
   */
  async createQualityAlert(alert: {
    assetId: string;
    title: string;
    message: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    ruleId?: string;
    issueId?: string;
    metadata?: Record<string, any>;
  }): Promise<QualityAlert> {
    const response = await apiClient.post(`${this.baseUrl}/alerts`, alert);
    return response.data;
  }

  // ========================================================================
  // QUALITY TRENDS OPERATIONS
  // ========================================================================

  /**
   * Get quality trends for an asset
   */
  async getQualityTrends(
    assetId: string,
    timeRange: { start: Date; end: Date },
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<QualityTrend[]> {
    const response = await apiClient.get(`${this.baseUrl}/trends/${assetId}`, {
      params: {
        startDate: timeRange.start.toISOString(),
        endDate: timeRange.end.toISOString(),
        granularity
      }
    });
    return response.data;
  }

  /**
   * Get quality trends for multiple assets
   */
  async getMultiAssetQualityTrends(
    assetIds: string[],
    timeRange: { start: Date; end: Date },
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<Array<{
    assetId: string;
    assetName: string;
    trends: QualityTrend[];
  }>> {
    const response = await apiClient.post(`${this.baseUrl}/trends/multi-asset`, {
      assetIds,
      timeRange: {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      },
      granularity
    });
    return response.data;
  }

  /**
   * Get quality trends by dimension
   */
  async getQualityTrendsByDimension(
    dimension: string,
    timeRange: { start: Date; end: Date },
    assetFilters?: {
      assetTypes?: string[];
      schemas?: string[];
      tags?: string[];
    }
  ): Promise<QualityTrend[]> {
    const response = await apiClient.post(`${this.baseUrl}/trends/dimension/${dimension}`, {
      timeRange: {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      },
      assetFilters
    });
    return response.data;
  }

  // ========================================================================
  // QUALITY RECOMMENDATIONS OPERATIONS
  // ========================================================================

  /**
   * Get quality recommendations for an asset
   */
  async getQualityRecommendations(assetId: string): Promise<QualityRecommendation[]> {
    const response = await apiClient.get(`${this.baseUrl}/recommendations/${assetId}`);
    return response.data;
  }

  /**
   * Get organization-wide quality recommendations
   */
  async getOrganizationQualityRecommendations(
    filters?: {
      priority?: ('low' | 'medium' | 'high')[];
      types?: string[];
      impact?: ('low' | 'medium' | 'high')[];
      assetTypes?: string[];
      limit?: number;
    }
  ): Promise<QualityRecommendation[]> {
    const response = await apiClient.get(`${this.baseUrl}/recommendations`, { params: filters });
    return response.data;
  }

  /**
   * Apply quality recommendation
   */
  async applyQualityRecommendation(
    recommendationId: string,
    options?: {
      scheduleLater?: Date;
      notifyOnCompletion?: boolean;
      dryRun?: boolean;
    }
  ): Promise<{
    applicationId: string;
    status: 'scheduled' | 'running' | 'completed' | 'failed';
    estimatedCompletion?: Date;
    dryRunResults?: {
      wouldAffect: number;
      estimatedImprovement: number;
      potentialRisks: string[];
    };
  }> {
    const response = await apiClient.post(`${this.baseUrl}/recommendations/${recommendationId}/apply`, options);
    return response.data;
  }

  /**
   * Dismiss quality recommendation
   */
  async dismissQualityRecommendation(
    recommendationId: string,
    reason: string
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/recommendations/${recommendationId}/dismiss`, {
      reason
    });
  }

  // ========================================================================
  // QUALITY REPORTS OPERATIONS
  // ========================================================================

  /**
   * Generate quality report
   */
  async generateQualityReport(
    config: {
      assetIds?: string[];
      reportType: 'summary' | 'detailed' | 'trends' | 'compliance';
      timeRange: { start: Date; end: Date };
      includeRecommendations: boolean;
      format: 'pdf' | 'xlsx' | 'csv' | 'json';
      recipients?: string[];
    }
  ): Promise<{
    reportId: string;
    status: 'generating' | 'completed' | 'failed';
    downloadUrl?: string;
    estimatedCompletion?: Date;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/reports/generate`, {
      ...config,
      timeRange: {
        start: config.timeRange.start.toISOString(),
        end: config.timeRange.end.toISOString()
      }
    });
    return response.data;
  }

  /**
   * Get quality report status
   */
  async getQualityReportStatus(reportId: string): Promise<{
    status: 'generating' | 'completed' | 'failed';
    progress: number;
    downloadUrl?: string;
    error?: string;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/reports/${reportId}/status`);
    return response.data;
  }

  /**
   * Get saved quality reports
   */
  async getSavedQualityReports(
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    reports: Array<{
      id: string;
      name: string;
      type: string;
      createdAt: Date;
      createdBy: string;
      downloadUrl: string;
      expiresAt: Date;
    }>;
    total: number;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/reports`, {
      params: { limit, offset }
    });
    return response.data;
  }

  // ========================================================================
  // QUALITY PROFILES OPERATIONS
  // ========================================================================

  /**
   * Get quality profile for an asset
   */
  async getQualityProfile(assetId: string): Promise<QualityProfile> {
    const response = await apiClient.get(`${this.baseUrl}/profiles/${assetId}`);
    return response.data;
  }

  /**
   * Create or update quality profile
   */
  async saveQualityProfile(
    assetId: string,
    profile: {
      dimensions: Array<{
        name: string;
        weight: number;
        threshold: number;
        enabled: boolean;
      }>;
      rules: string[];
      alertThresholds: Record<string, number>;
      checkFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
      autoRemediation: boolean;
    }
  ): Promise<QualityProfile> {
    const response = await apiClient.put(`${this.baseUrl}/profiles/${assetId}`, profile);
    return response.data;
  }

  // ========================================================================
  // QUALITY SCORECARD OPERATIONS
  // ========================================================================

  /**
   * Get quality scorecard for asset or organization
   */
  async getQualityScorecard(
    scope: 'asset' | 'schema' | 'organization',
    id?: string
  ): Promise<QualityScorecard> {
    const response = await apiClient.get(`${this.baseUrl}/scorecard/${scope}`, {
      params: { id }
    });
    return response.data;
  }

  /**
   * Generate quality scorecard comparison
   */
  async compareQualityScorecard(
    entities: Array<{ type: 'asset' | 'schema'; id: string; name: string }>,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    comparison: Array<{
      entity: { type: string; id: string; name: string };
      scorecard: QualityScorecard;
      rank: number;
    }>;
    summary: {
      bestPerforming: { entity: any; score: number };
      worstPerforming: { entity: any; score: number };
      averageScore: number;
      improvementOpportunities: string[];
    };
  }> {
    const response = await apiClient.post(`${this.baseUrl}/scorecard/compare`, {
      entities,
      timeRange: {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      }
    });
    return response.data;
  }

  // ========================================================================
  // REAL-TIME MONITORING
  // ========================================================================

  /**
   * Subscribe to quality events
   */
  subscribeToQualityEvents(
    assetId: string,
    eventTypes: ('metric_update' | 'issue_created' | 'alert_triggered' | 'rule_executed')[],
    callback: (event: {
      type: string;
      assetId: string;
      timestamp: Date;
      data: any;
    }) => void
  ): () => void {
    const eventSource = new EventSource(
      `${this.baseUrl}/events/subscribe/${assetId}?eventTypes=${eventTypes.join(',')}`
    );

    eventSource.onmessage = (event) => {
      const qualityEvent = JSON.parse(event.data);
      callback(qualityEvent);
    };

    return () => {
      eventSource.close();
    };
  }

  /**
   * Get quality health status
   */
  async getQualityHealthStatus(assetId: string): Promise<{
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
    score: number;
    issues: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    trends: {
      direction: 'improving' | 'declining' | 'stable';
      changePercent: number;
    };
    lastChecked: Date;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/health/${assetId}`);
    return response.data;
  }

  // ========================================================================
  // BULK OPERATIONS
  // ========================================================================

  /**
   * Run quality checks on multiple assets
   */
  async runBulkQualityChecks(
    assetIds: string[],
    ruleIds?: string[],
    scheduleFor?: Date
  ): Promise<{
    batchId: string;
    status: 'scheduled' | 'running' | 'completed';
    progress: {
      total: number;
      completed: number;
      failed: number;
      inProgress: number;
    };
    estimatedCompletion?: Date;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/bulk/checks`, {
      assetIds,
      ruleIds,
      scheduleFor: scheduleFor?.toISOString()
    });
    return response.data;
  }

  /**
   * Update multiple quality issues
   */
  async bulkUpdateQualityIssues(
    issueIds: string[],
    updates: {
      status?: 'open' | 'in_progress' | 'resolved' | 'closed';
      assignee?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      comment?: string;
    }
  ): Promise<{
    updated: number;
    failed: number;
    errors: Array<{ issueId: string; error: string }>;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/bulk/issues/update`, {
      issueIds,
      updates
    });
    return response.data;
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const dataQualityService = new DataQualityService();
export default dataQualityService;