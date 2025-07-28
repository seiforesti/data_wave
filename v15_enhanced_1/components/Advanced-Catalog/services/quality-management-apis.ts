/**
 * Quality Management APIs - Advanced Data Quality System
 * ======================================================
 * 
 * Complete mapping to backend quality services:
 * - catalog_quality_service.py (1196 lines, 30+ endpoints)
 * - data_profiling_service.py (18KB)
 * - catalog_quality_models.py (6+ classes)
 * - enterprise_catalog_routes.py (quality features)
 * 
 * This service provides comprehensive data quality management:
 * - AI-powered quality assessment
 * - Configurable quality rules engine
 * - Real-time quality monitoring
 * - Advanced data profiling
 * - Quality trend analysis
 * - Automated quality alerts
 * - Quality reporting and dashboards
 * - Quality optimization recommendations
 */

import { apiClient } from '../../shared/utils/api-client';
import type {
  DataQualityAssessment,
  DataQualityRule,
  QualityScorecard,
  QualityMonitoringConfig,
  QualityMonitoringAlert,
  QualityReport,
  DataProfilingResult,
  QualityMetrics,
  QualityTrend,
  QualityRuleExecutionResult,
  QualityDashboardData,
  QualityOptimizationRecommendation,
  QualityValidationResult,
  DataHealthIndicator,
  QualityAssessmentRequest,
  QualityRuleRequest,
  QualityMonitoringRequest,
  ProfilingRequest,
  QualityReportRequest,
  QualityAnalysisRequest
} from '../types/quality.types';

/**
 * ==============================================
 * DATA QUALITY ASSESSMENT (catalog_quality_service.py)
 * ==============================================
 */

export class DataQualityAPI {
  /**
   * Perform comprehensive quality assessment on data assets
   * Maps to: CatalogQualityService.assess_data_quality()
   */
  static async assessDataQuality(request: QualityAssessmentRequest): Promise<DataQualityAssessment> {
    return apiClient.post('/api/catalog/quality/assess', request);
  }

  /**
   * Get quality assessment for specific asset
   * Maps to: DataQualityAssessment model retrieval
   */
  static async getQualityAssessment(assetId: string): Promise<DataQualityAssessment> {
    return apiClient.get(`/api/catalog/quality/assessment/${assetId}`);
  }

  /**
   * Get quality assessment history
   * Maps to: Quality assessment tracking
   */
  static async getQualityAssessmentHistory(assetId: string, timeframe?: string): Promise<DataQualityAssessment[]> {
    return apiClient.get(`/api/catalog/quality/assessment/${assetId}/history`, {
      params: { timeframe }
    });
  }

  /**
   * Generate quality scorecard for assets
   * Maps to: QualityScorecard model
   */
  static async generateQualityScorecard(assetIds: string[]): Promise<QualityScorecard[]> {
    return apiClient.post('/api/catalog/quality/scorecard', { asset_ids: assetIds });
  }

  /**
   * Get comprehensive quality dashboard data
   * Maps to: Quality dashboard aggregation
   */
  static async getQualityDashboard(filters?: any): Promise<QualityDashboardData> {
    return apiClient.get('/api/catalog/quality/dashboard', { params: filters });
  }

  /**
   * Get quality metrics for assets
   * Maps to: Quality metrics calculation
   */
  static async getQualityMetrics(assetId: string, metricTypes?: string[]): Promise<QualityMetrics> {
    return apiClient.get(`/api/catalog/quality/metrics/${assetId}`, {
      params: { metric_types: metricTypes }
    });
  }

  /**
   * Compare quality assessments between assets
   * Maps to: Quality comparison analysis
   */
  static async compareQualityAssessments(assetIds: string[]): Promise<any> {
    return apiClient.post('/api/catalog/quality/compare', { asset_ids: assetIds });
  }

  /**
   * Get quality improvement recommendations
   * Maps to: AI-powered quality optimization
   */
  static async getQualityRecommendations(assetId: string): Promise<QualityOptimizationRecommendation[]> {
    return apiClient.get(`/api/catalog/quality/recommendations/${assetId}`);
  }
}

/**
 * ==============================================
 * QUALITY RULES ENGINE
 * ==============================================
 */

export class QualityRulesAPI {
  /**
   * Create new quality rule
   * Maps to: DataQualityRule model creation
   */
  static async createQualityRule(rule: QualityRuleRequest): Promise<DataQualityRule> {
    return apiClient.post('/api/catalog/quality/rules', rule);
  }

  /**
   * Get all quality rules
   * Maps to: DataQualityRule model retrieval
   */
  static async getQualityRules(filters?: any): Promise<DataQualityRule[]> {
    return apiClient.get('/api/catalog/quality/rules', { params: filters });
  }

  /**
   * Update quality rule
   * Maps to: DataQualityRule model update
   */
  static async updateQualityRule(ruleId: string, updates: Partial<DataQualityRule>): Promise<DataQualityRule> {
    return apiClient.put(`/api/catalog/quality/rules/${ruleId}`, updates);
  }

  /**
   * Delete quality rule
   * Maps to: DataQualityRule model deletion
   */
  static async deleteQualityRule(ruleId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/quality/rules/${ruleId}`);
  }

  /**
   * Execute quality rule on specific asset
   * Maps to: Quality rule execution engine
   */
  static async executeQualityRule(ruleId: string, assetId: string): Promise<QualityRuleExecutionResult> {
    return apiClient.post(`/api/catalog/quality/rules/${ruleId}/execute`, { asset_id: assetId });
  }

  /**
   * Execute multiple quality rules
   * Maps to: Batch quality rule execution
   */
  static async executeQualityRules(assetId: string, ruleIds?: string[]): Promise<QualityRuleExecutionResult[]> {
    return apiClient.post('/api/catalog/quality/rules/execute-batch', {
      asset_id: assetId,
      rule_ids: ruleIds
    });
  }

  /**
   * Validate data against quality rules
   * Maps to: Data validation framework
   */
  static async validateData(assetId: string, validationRules?: any[]): Promise<QualityValidationResult> {
    return apiClient.post('/api/catalog/quality/validate', {
      asset_id: assetId,
      validation_rules: validationRules
    });
  }

  /**
   * Test quality rule logic
   * Maps to: Quality rule testing framework
   */
  static async testQualityRule(rule: any, sampleData?: any): Promise<any> {
    return apiClient.post('/api/catalog/quality/rules/test', { rule, sample_data: sampleData });
  }

  /**
   * Get quality rule templates
   * Maps to: Pre-defined quality rule templates
   */
  static async getQualityRuleTemplates(category?: string): Promise<any[]> {
    return apiClient.get('/api/catalog/quality/rules/templates', { params: { category } });
  }
}

/**
 * ==============================================
 * QUALITY MONITORING & ALERTS
 * ==============================================
 */

export class QualityMonitoringAPI {
  /**
   * Configure quality monitoring for assets
   * Maps to: QualityMonitoringConfig model
   */
  static async configureMonitoring(config: QualityMonitoringRequest): Promise<QualityMonitoringConfig> {
    return apiClient.post('/api/catalog/quality/monitoring/configure', config);
  }

  /**
   * Get monitoring configurations
   * Maps to: QualityMonitoringConfig retrieval
   */
  static async getMonitoringConfigs(assetId?: string): Promise<QualityMonitoringConfig[]> {
    return apiClient.get('/api/catalog/quality/monitoring/configs', {
      params: { asset_id: assetId }
    });
  }

  /**
   * Update monitoring configuration
   * Maps to: QualityMonitoringConfig update
   */
  static async updateMonitoringConfig(configId: string, updates: any): Promise<QualityMonitoringConfig> {
    return apiClient.put(`/api/catalog/quality/monitoring/configs/${configId}`, updates);
  }

  /**
   * Get quality monitoring alerts
   * Maps to: QualityMonitoringAlert model
   */
  static async getQualityAlerts(filters?: any): Promise<QualityMonitoringAlert[]> {
    return apiClient.get('/api/catalog/quality/monitoring/alerts', { params: filters });
  }

  /**
   * Acknowledge quality alert
   * Maps to: Alert acknowledgment
   */
  static async acknowledgeAlert(alertId: string, notes?: string): Promise<void> {
    return apiClient.post(`/api/catalog/quality/monitoring/alerts/${alertId}/acknowledge`, { notes });
  }

  /**
   * Resolve quality alert
   * Maps to: Alert resolution
   */
  static async resolveAlert(alertId: string, resolution: any): Promise<void> {
    return apiClient.post(`/api/catalog/quality/monitoring/alerts/${alertId}/resolve`, resolution);
  }

  /**
   * Get quality monitoring dashboard
   * Maps to: Real-time monitoring dashboard
   */
  static async getMonitoringDashboard(timeframe?: string): Promise<any> {
    return apiClient.get('/api/catalog/quality/monitoring/dashboard', { params: { timeframe } });
  }

  /**
   * Get data health indicators
   * Maps to: Health indicator tracking
   */
  static async getDataHealthIndicators(assetIds?: string[]): Promise<DataHealthIndicator[]> {
    return apiClient.post('/api/catalog/quality/monitoring/health', { asset_ids: assetIds });
  }
}

/**
 * ==============================================
 * DATA PROFILING (data_profiling_service.py)
 * ==============================================
 */

export class DataProfilingAPI {
  /**
   * Profile data asset comprehensively
   * Maps to: DataProfilingService.profile_data()
   */
  static async profileData(request: ProfilingRequest): Promise<DataProfilingResult> {
    return apiClient.post('/api/catalog/profiling/profile', request);
  }

  /**
   * Get existing profiling results
   * Maps to: DataProfilingResult model retrieval
   */
  static async getProfilingResults(assetId: string): Promise<DataProfilingResult[]> {
    return apiClient.get(`/api/catalog/profiling/results/${assetId}`);
  }

  /**
   * Get statistical summary of data
   * Maps to: Statistical profiling features
   */
  static async getStatisticalSummary(assetId: string, columns?: string[]): Promise<any> {
    return apiClient.get(`/api/catalog/profiling/statistics/${assetId}`, {
      params: { columns }
    });
  }

  /**
   * Detect data patterns and anomalies
   * Maps to: Pattern detection in profiling
   */
  static async detectDataPatterns(assetId: string, patternTypes?: string[]): Promise<any[]> {
    return apiClient.post('/api/catalog/profiling/patterns', {
      asset_id: assetId,
      pattern_types: patternTypes
    });
  }

  /**
   * Get data distribution analysis
   * Maps to: Distribution analysis features
   */
  static async getDataDistribution(assetId: string, column: string): Promise<any> {
    return apiClient.get(`/api/catalog/profiling/distribution/${assetId}/${column}`);
  }

  /**
   * Compare profiling results between assets
   * Maps to: Profiling comparison analysis
   */
  static async compareProfilingResults(assetIds: string[], columns?: string[]): Promise<any> {
    return apiClient.post('/api/catalog/profiling/compare', {
      asset_ids: assetIds,
      columns
    });
  }

  /**
   * Schedule periodic profiling
   * Maps to: Automated profiling scheduling
   */
  static async scheduleProfiler(assetId: string, schedule: any): Promise<any> {
    return apiClient.post(`/api/catalog/profiling/schedule/${assetId}`, schedule);
  }

  /**
   * Get profiling job status
   * Maps to: Profiling job tracking
   */
  static async getProfilingJobStatus(jobId: string): Promise<any> {
    return apiClient.get(`/api/catalog/profiling/jobs/${jobId}/status`);
  }
}

/**
 * ==============================================
 * QUALITY REPORTING & ANALYTICS
 * ==============================================
 */

export class QualityReportingAPI {
  /**
   * Generate quality report
   * Maps to: QualityReport model and generation
   */
  static async generateQualityReport(request: QualityReportRequest): Promise<QualityReport> {
    return apiClient.post('/api/catalog/quality/reports/generate', request);
  }

  /**
   * Get existing quality reports
   * Maps to: QualityReport model retrieval
   */
  static async getQualityReports(filters?: any): Promise<QualityReport[]> {
    return apiClient.get('/api/catalog/quality/reports', { params: filters });
  }

  /**
   * Download quality report
   * Maps to: Report export functionality
   */
  static async downloadQualityReport(reportId: string, format: 'pdf' | 'csv' | 'json'): Promise<Blob> {
    return apiClient.get(`/api/catalog/quality/reports/${reportId}/download`, {
      params: { format },
      responseType: 'blob'
    });
  }

  /**
   * Get quality trends analysis
   * Maps to: Quality trend analytics
   */
  static async getQualityTrends(assetId: string, timeframe?: string): Promise<QualityTrend[]> {
    return apiClient.get(`/api/catalog/quality/trends/${assetId}`, {
      params: { timeframe }
    });
  }

  /**
   * Get quality analytics dashboard
   * Maps to: Quality analytics aggregation
   */
  static async getQualityAnalytics(request: QualityAnalysisRequest): Promise<any> {
    return apiClient.post('/api/catalog/quality/analytics', request);
  }

  /**
   * Export quality metrics
   * Maps to: Quality metrics export
   */
  static async exportQualityMetrics(assetIds: string[], format: string): Promise<Blob> {
    return apiClient.post('/api/catalog/quality/metrics/export', {
      asset_ids: assetIds,
      format
    }, { responseType: 'blob' });
  }

  /**
   * Schedule quality report generation
   * Maps to: Automated report scheduling
   */
  static async scheduleQualityReport(reportConfig: any, schedule: any): Promise<any> {
    return apiClient.post('/api/catalog/quality/reports/schedule', {
      report_config: reportConfig,
      schedule
    });
  }

  /**
   * Get quality benchmarks and KPIs
   * Maps to: Quality benchmarking
   */
  static async getQualityBenchmarks(assetType?: string, industry?: string): Promise<any> {
    return apiClient.get('/api/catalog/quality/benchmarks', {
      params: { asset_type: assetType, industry }
    });
  }
}

/**
 * ==============================================
 * QUALITY OPTIMIZATION & RECOMMENDATIONS
 * ==============================================
 */

export class QualityOptimizationAPI {
  /**
   * Get quality optimization recommendations
   * Maps to: AI-powered quality optimization
   */
  static async getOptimizationRecommendations(assetId: string): Promise<QualityOptimizationRecommendation[]> {
    return apiClient.get(`/api/catalog/quality/optimization/recommendations/${assetId}`);
  }

  /**
   * Apply quality optimization recommendations
   * Maps to: Recommendation implementation
   */
  static async applyOptimizations(assetId: string, optimizations: any[]): Promise<any> {
    return apiClient.post(`/api/catalog/quality/optimization/apply/${assetId}`, {
      optimizations
    });
  }

  /**
   * Simulate quality improvements
   * Maps to: Quality improvement simulation
   */
  static async simulateQualityImprovements(assetId: string, improvements: any[]): Promise<any> {
    return apiClient.post(`/api/catalog/quality/optimization/simulate/${assetId}`, {
      improvements
    });
  }

  /**
   * Get quality ROI analysis
   * Maps to: Quality improvement ROI calculation
   */
  static async getQualityROIAnalysis(assetId: string, improvements: any[]): Promise<any> {
    return apiClient.post(`/api/catalog/quality/optimization/roi/${assetId}`, {
      improvements
    });
  }

  /**
   * Track quality improvement progress
   * Maps to: Quality improvement tracking
   */
  static async trackQualityImprovements(assetId: string, timeframe?: string): Promise<any> {
    return apiClient.get(`/api/catalog/quality/optimization/progress/${assetId}`, {
      params: { timeframe }
    });
  }
}

/**
 * ==============================================
 * COMPREHENSIVE QUALITY MANAGEMENT API
 * ==============================================
 */

export class QualityManagementAPI {
  // Combine all quality APIs
  static readonly DataQuality = DataQualityAPI;
  static readonly QualityRules = QualityRulesAPI;
  static readonly Monitoring = QualityMonitoringAPI;
  static readonly Profiling = DataProfilingAPI;
  static readonly Reporting = QualityReportingAPI;
  static readonly Optimization = QualityOptimizationAPI;

  /**
   * Get comprehensive quality overview
   * Maps to: Complete quality system overview
   */
  static async getQualityOverview(filters?: any): Promise<any> {
    return apiClient.get('/api/catalog/quality/overview', { params: filters });
  }

  /**
   * Perform full quality analysis on asset
   * Maps to: Complete quality assessment pipeline
   */
  static async performFullQualityAnalysis(assetId: string, options?: any): Promise<any> {
    return apiClient.post(`/api/catalog/quality/analyze/${assetId}`, options);
  }

  /**
   * Get quality system health status
   * Maps to: Quality system monitoring
   */
  static async getQualitySystemHealth(): Promise<any> {
    return apiClient.get('/api/catalog/quality/system/health');
  }

  /**
   * Export comprehensive quality report
   * Maps to: Complete quality reporting
   */
  static async exportComprehensiveReport(filters?: any, format?: string): Promise<Blob> {
    return apiClient.get('/api/catalog/quality/export/comprehensive', {
      params: { ...filters, format },
      responseType: 'blob'
    });
  }
}

// Default export with all quality management APIs
export default QualityManagementAPI;