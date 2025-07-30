// ============================================================================
// QUALITY SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced service for quality management functionality
// Integrates with backend quality APIs for comprehensive data governance
// ============================================================================

import axios, { AxiosResponse } from 'axios';
import { 
  DataQualityIssue,
  GovernancePolicy,
  ComplianceCheck,
  QualityMetrics,
  StewardshipMetrics,
  QualityRule,
  QualityAssessment,
  DataQualityReport,
  QualityDimension,
  QualityThreshold,
  ValidationResult,
  IssueResolution,
  QualityTrend,
  ComplianceStatus
} from '../types/collaboration.types';

import { CatalogApiResponse } from '../types/catalog-core.types';
import { API_CONFIG, buildUrl, buildUrlWithQuery } from '../constants/endpoints';

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class QualityService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // ============================================================================
  // QUALITY ISSUES
  // ============================================================================

  async getQualityIssues(params: { workspaceId?: string }): Promise<DataQualityIssue[]> {
    try {
      const response = await axios.get<CatalogApiResponse<DataQualityIssue[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/quality/issues', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch quality issues:', error);
      return [];
    }
  }

  async getQualityIssueById(id: string): Promise<DataQualityIssue | null> {
    try {
      const response = await axios.get<CatalogApiResponse<DataQualityIssue>>(
        buildUrl(this.baseURL, `/api/v1/quality/issues/${id}`),
        { timeout: this.timeout }
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to fetch quality issue:', error);
      return null;
    }
  }

  async createQualityIssue(issue: Partial<DataQualityIssue>): Promise<DataQualityIssue> {
    try {
      const response = await axios.post<CatalogApiResponse<DataQualityIssue>>(
        buildUrl(this.baseURL, '/api/v1/quality/issues'),
        issue,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create quality issue:', error);
      throw error;
    }
  }

  async updateQualityIssue(id: string, updates: Partial<DataQualityIssue>): Promise<DataQualityIssue> {
    try {
      const response = await axios.put<CatalogApiResponse<DataQualityIssue>>(
        buildUrl(this.baseURL, `/api/v1/quality/issues/${id}`),
        updates,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to update quality issue:', error);
      throw error;
    }
  }

  async resolveQualityIssue(id: string, resolution: IssueResolution): Promise<DataQualityIssue> {
    try {
      const response = await axios.post<CatalogApiResponse<DataQualityIssue>>(
        buildUrl(this.baseURL, `/api/v1/quality/issues/${id}/resolve`),
        { resolution },
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to resolve quality issue:', error);
      throw error;
    }
  }

  async deleteQualityIssue(id: string): Promise<void> {
    try {
      await axios.delete(
        buildUrl(this.baseURL, `/api/v1/quality/issues/${id}`),
        { timeout: this.timeout }
      );
    } catch (error) {
      console.error('Failed to delete quality issue:', error);
      throw error;
    }
  }

  // ============================================================================
  // QUALITY RULES
  // ============================================================================

  async getQualityRules(params: { workspaceId?: string }): Promise<QualityRule[]> {
    try {
      const response = await axios.get<CatalogApiResponse<QualityRule[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/quality/rules', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch quality rules:', error);
      return [];
    }
  }

  async getQualityRuleById(id: string): Promise<QualityRule | null> {
    try {
      const response = await axios.get<CatalogApiResponse<QualityRule>>(
        buildUrl(this.baseURL, `/api/v1/quality/rules/${id}`),
        { timeout: this.timeout }
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to fetch quality rule:', error);
      return null;
    }
  }

  async createQualityRule(rule: Partial<QualityRule>): Promise<QualityRule> {
    try {
      const response = await axios.post<CatalogApiResponse<QualityRule>>(
        buildUrl(this.baseURL, '/api/v1/quality/rules'),
        rule,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create quality rule:', error);
      throw error;
    }
  }

  async updateQualityRule(id: string, updates: Partial<QualityRule>): Promise<QualityRule> {
    try {
      const response = await axios.put<CatalogApiResponse<QualityRule>>(
        buildUrl(this.baseURL, `/api/v1/quality/rules/${id}`),
        updates,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to update quality rule:', error);
      throw error;
    }
  }

  async deleteQualityRule(id: string): Promise<void> {
    try {
      await axios.delete(
        buildUrl(this.baseURL, `/api/v1/quality/rules/${id}`),
        { timeout: this.timeout }
      );
    } catch (error) {
      console.error('Failed to delete quality rule:', error);
      throw error;
    }
  }

  async enableQualityRule(id: string): Promise<QualityRule> {
    try {
      const response = await axios.post<CatalogApiResponse<QualityRule>>(
        buildUrl(this.baseURL, `/api/v1/quality/rules/${id}/enable`),
        {},
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to enable quality rule:', error);
      throw error;
    }
  }

  async disableQualityRule(id: string): Promise<QualityRule> {
    try {
      const response = await axios.post<CatalogApiResponse<QualityRule>>(
        buildUrl(this.baseURL, `/api/v1/quality/rules/${id}/disable`),
        {},
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to disable quality rule:', error);
      throw error;
    }
  }

  async testQualityRule(rule: QualityRule, sampleData?: any): Promise<ValidationResult> {
    try {
      const response = await axios.post<CatalogApiResponse<ValidationResult>>(
        buildUrl(this.baseURL, '/api/v1/quality/rules/test'),
        { rule, sampleData },
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to test quality rule:', error);
      throw error;
    }
  }

  // ============================================================================
  // GOVERNANCE POLICIES
  // ============================================================================

  async getGovernancePolicies(params: { workspaceId?: string }): Promise<GovernancePolicy[]> {
    try {
      const response = await axios.get<CatalogApiResponse<GovernancePolicy[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/governance/policies', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch governance policies:', error);
      return [];
    }
  }

  async getGovernancePolicyById(id: string): Promise<GovernancePolicy | null> {
    try {
      const response = await axios.get<CatalogApiResponse<GovernancePolicy>>(
        buildUrl(this.baseURL, `/api/v1/governance/policies/${id}`),
        { timeout: this.timeout }
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to fetch governance policy:', error);
      return null;
    }
  }

  async createGovernancePolicy(policy: Partial<GovernancePolicy>): Promise<GovernancePolicy> {
    try {
      const response = await axios.post<CatalogApiResponse<GovernancePolicy>>(
        buildUrl(this.baseURL, '/api/v1/governance/policies'),
        policy,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create governance policy:', error);
      throw error;
    }
  }

  async updateGovernancePolicy(id: string, updates: Partial<GovernancePolicy>): Promise<GovernancePolicy> {
    try {
      const response = await axios.put<CatalogApiResponse<GovernancePolicy>>(
        buildUrl(this.baseURL, `/api/v1/governance/policies/${id}`),
        updates,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to update governance policy:', error);
      throw error;
    }
  }

  async deleteGovernancePolicy(id: string): Promise<void> {
    try {
      await axios.delete(
        buildUrl(this.baseURL, `/api/v1/governance/policies/${id}`),
        { timeout: this.timeout }
      );
    } catch (error) {
      console.error('Failed to delete governance policy:', error);
      throw error;
    }
  }

  async publishGovernancePolicy(id: string): Promise<GovernancePolicy> {
    try {
      const response = await axios.post<CatalogApiResponse<GovernancePolicy>>(
        buildUrl(this.baseURL, `/api/v1/governance/policies/${id}/publish`),
        {},
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to publish governance policy:', error);
      throw error;
    }
  }

  async archiveGovernancePolicy(id: string): Promise<GovernancePolicy> {
    try {
      const response = await axios.post<CatalogApiResponse<GovernancePolicy>>(
        buildUrl(this.baseURL, `/api/v1/governance/policies/${id}/archive`),
        {},
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to archive governance policy:', error);
      throw error;
    }
  }

  // ============================================================================
  // COMPLIANCE CHECKS
  // ============================================================================

  async getComplianceChecks(params: { workspaceId?: string }): Promise<ComplianceCheck[]> {
    try {
      const response = await axios.get<CatalogApiResponse<ComplianceCheck[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/compliance/checks', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch compliance checks:', error);
      return [];
    }
  }

  async runComplianceCheck(assetId: string, policyIds?: string[]): Promise<ComplianceCheck> {
    try {
      const response = await axios.post<CatalogApiResponse<ComplianceCheck>>(
        buildUrl(this.baseURL, `/api/v1/compliance/checks`),
        { assetId, policyIds },
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to run compliance check:', error);
      throw error;
    }
  }

  async getComplianceStatus(assetId: string): Promise<ComplianceStatus> {
    try {
      const response = await axios.get<CatalogApiResponse<ComplianceStatus>>(
        buildUrl(this.baseURL, `/api/v1/compliance/status/${assetId}`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get compliance status:', error);
      throw error;
    }
  }

  async scheduleComplianceCheck(assetId: string, schedule: any): Promise<void> {
    try {
      await axios.post(
        buildUrl(this.baseURL, `/api/v1/compliance/schedule`),
        { assetId, schedule },
        { timeout: this.timeout }
      );
    } catch (error) {
      console.error('Failed to schedule compliance check:', error);
      throw error;
    }
  }

  async getComplianceHistory(assetId: string): Promise<ComplianceCheck[]> {
    try {
      const response = await axios.get<CatalogApiResponse<ComplianceCheck[]>>(
        buildUrl(this.baseURL, `/api/v1/compliance/history/${assetId}`),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get compliance history:', error);
      return [];
    }
  }

  // ============================================================================
  // QUALITY ASSESSMENT
  // ============================================================================

  async getQualityAssessments(params: { workspaceId?: string }): Promise<QualityAssessment[]> {
    try {
      const response = await axios.get<CatalogApiResponse<QualityAssessment[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/quality/assessments', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch quality assessments:', error);
      return [];
    }
  }

  async runQualityAssessment(assetId: string, dimensions?: QualityDimension[]): Promise<QualityAssessment> {
    try {
      const response = await axios.post<CatalogApiResponse<QualityAssessment>>(
        buildUrl(this.baseURL, '/api/v1/quality/assessments'),
        { assetId, dimensions },
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to run quality assessment:', error);
      throw error;
    }
  }

  async getQualityAssessmentHistory(assetId: string): Promise<QualityAssessment[]> {
    try {
      const response = await axios.get<CatalogApiResponse<QualityAssessment[]>>(
        buildUrl(this.baseURL, `/api/v1/quality/assessments/history/${assetId}`),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get assessment history:', error);
      return [];
    }
  }

  async setQualityThresholds(assetId: string, thresholds: QualityThreshold[]): Promise<void> {
    try {
      await axios.post(
        buildUrl(this.baseURL, `/api/v1/quality/thresholds/${assetId}`),
        { thresholds },
        { timeout: this.timeout }
      );
    } catch (error) {
      console.error('Failed to set quality thresholds:', error);
      throw error;
    }
  }

  // ============================================================================
  // METRICS & ANALYTICS
  // ============================================================================

  async getQualityMetrics(params: { workspaceId?: string }): Promise<QualityMetrics> {
    try {
      const response = await axios.get<CatalogApiResponse<QualityMetrics>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/quality/metrics', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch quality metrics:', error);
      throw error;
    }
  }

  async getStewardshipMetrics(params: { workspaceId?: string }): Promise<StewardshipMetrics> {
    try {
      const response = await axios.get<CatalogApiResponse<StewardshipMetrics>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/stewardship/metrics', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch stewardship metrics:', error);
      throw error;
    }
  }

  async getQualityTrends(timeframe: string, metrics: string[]): Promise<QualityTrend[]> {
    try {
      const response = await axios.get<CatalogApiResponse<QualityTrend[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/quality/trends', undefined, { timeframe, metrics: metrics.join(',') }),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch quality trends:', error);
      return [];
    }
  }

  async getQualityMetricsByDomain(domain: string): Promise<QualityMetrics> {
    try {
      const response = await axios.get<CatalogApiResponse<QualityMetrics>>(
        buildUrl(this.baseURL, `/api/v1/quality/metrics/domain/${domain}`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch domain quality metrics:', error);
      throw error;
    }
  }

  async getSystemQualityOverview(): Promise<QualityMetrics> {
    try {
      const response = await axios.get<CatalogApiResponse<QualityMetrics>>(
        buildUrl(this.baseURL, '/api/v1/quality/metrics/overview'),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch system quality overview:', error);
      throw error;
    }
  }

  // ============================================================================
  // REPORTING
  // ============================================================================

  async getQualityReports(params: { workspaceId?: string }): Promise<DataQualityReport[]> {
    try {
      const response = await axios.get<CatalogApiResponse<DataQualityReport[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/quality/reports', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch quality reports:', error);
      return [];
    }
  }

  async generateQualityReport(options: any): Promise<DataQualityReport> {
    try {
      const response = await axios.post<CatalogApiResponse<DataQualityReport>>(
        buildUrl(this.baseURL, '/api/v1/quality/reports/generate'),
        options,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to generate quality report:', error);
      throw error;
    }
  }

  async getQualityReportById(id: string): Promise<DataQualityReport | null> {
    try {
      const response = await axios.get<CatalogApiResponse<DataQualityReport>>(
        buildUrl(this.baseURL, `/api/v1/quality/reports/${id}`),
        { timeout: this.timeout }
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to fetch quality report:', error);
      return null;
    }
  }

  async downloadQualityReport(id: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<Blob> {
    try {
      const response = await axios.get(
        buildUrl(this.baseURL, `/api/v1/quality/reports/${id}/download`),
        { 
          params: { format },
          responseType: 'blob',
          timeout: this.timeout 
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to download quality report:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  async validateDataset(datasetId: string, rules?: string[]): Promise<ValidationResult> {
    try {
      const response = await axios.post<CatalogApiResponse<ValidationResult>>(
        buildUrl(this.baseURL, '/api/v1/quality/validate'),
        { datasetId, rules },
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to validate dataset:', error);
      throw error;
    }
  }

  async getQualityScore(assetId: string): Promise<number> {
    try {
      const response = await axios.get<CatalogApiResponse<{ score: number }>>(
        buildUrl(this.baseURL, `/api/v1/quality/score/${assetId}`),
        { timeout: this.timeout }
      );
      return response.data.data.score;
    } catch (error) {
      console.error('Failed to get quality score:', error);
      return 0;
    }
  }

  async getQualityRecommendations(assetId: string): Promise<any[]> {
    try {
      const response = await axios.get<CatalogApiResponse<any[]>>(
        buildUrl(this.baseURL, `/api/v1/quality/recommendations/${assetId}`),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get quality recommendations:', error);
      return [];
    }
  }

  async exportQualityData(filters: any, format: 'json' | 'csv' | 'excel' = 'json'): Promise<Blob> {
    try {
      const response = await axios.post(
        buildUrl(this.baseURL, '/api/v1/quality/export'),
        { filters, format },
        { 
          responseType: 'blob',
          timeout: this.timeout 
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to export quality data:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const qualityService = new QualityService();
export default qualityService;