/**
 * Governance APIs - Advanced Governance Management System
 * =======================================================
 * 
 * Complete mapping to backend governance services:
 * - enterprise_catalog_service.py (governance features)
 * - enterprise_integration_service.py (governance coordination)
 * - unified_governance_coordinator.py (cross-system governance)
 * - comprehensive_analytics_service.py (governance analytics)
 * - Various models supporting governance across the system
 * 
 * This service provides comprehensive governance management:
 * - Policy definition and enforcement
 * - Compliance monitoring and reporting
 * - Audit trail management
 * - Governance workflow orchestration
 * - Risk assessment and mitigation
 * - Regulatory framework compliance
 * - Cross-system governance coordination
 * - Governance analytics and insights
 */

import { apiClient } from '../../shared/utils/api-client';
import type {
  GovernancePolicy,
  ComplianceRule,
  ComplianceAssessment,
  AuditTrail,
  GovernanceWorkflow,
  RiskAssessment,
  RegulatoryFramework,
  GovernanceMetrics,
  PolicyEnforcement,
  ComplianceReport,
  GovernanceAlert,
  PolicyViolation,
  GovernanceInsight,
  GovernanceConfiguration,
  AccessControlPolicy,
  DataRetentionPolicy,
  PrivacyPolicy,
  PolicyRequest,
  ComplianceRequest,
  AuditRequest,
  WorkflowRequest,
  RiskRequest,
  EnforcementRequest,
  GovernanceAnalytics,
  PolicyTemplate,
  ComplianceFramework
} from '../types/governance.types';

/**
 * ==============================================
 * GOVERNANCE POLICY MANAGEMENT
 * ==============================================
 */

export class GovernancePolicyAPI {
  /**
   * Create governance policy
   * Maps to: Governance policy management
   */
  static async createGovernancePolicy(policy: PolicyRequest): Promise<GovernancePolicy> {
    return apiClient.post('/api/catalog/governance/policies', policy);
  }

  /**
   * Get governance policies
   * Maps to: Policy retrieval and filtering
   */
  static async getGovernancePolicies(filters?: any): Promise<GovernancePolicy[]> {
    return apiClient.get('/api/catalog/governance/policies', { params: filters });
  }

  /**
   * Update governance policy
   * Maps to: Policy modification
   */
  static async updateGovernancePolicy(policyId: string, updates: Partial<GovernancePolicy>): Promise<GovernancePolicy> {
    return apiClient.put(`/api/catalog/governance/policies/${policyId}`, updates);
  }

  /**
   * Delete governance policy
   * Maps to: Policy deletion
   */
  static async deleteGovernancePolicy(policyId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/governance/policies/${policyId}`);
  }

  /**
   * Enforce governance policy
   * Maps to: enterprise_catalog_service.govern_catalog_access()
   */
  static async enforceGovernancePolicy(policyId: string, scope?: any): Promise<PolicyEnforcement> {
    return apiClient.post(`/api/catalog/governance/policies/${policyId}/enforce`, { scope });
  }

  /**
   * Get policy enforcement status
   * Maps to: Policy enforcement monitoring
   */
  static async getPolicyEnforcementStatus(policyId: string): Promise<PolicyEnforcement> {
    return apiClient.get(`/api/catalog/governance/policies/${policyId}/enforcement`);
  }

  /**
   * Get policy violations
   * Maps to: Policy violation tracking
   */
  static async getPolicyViolations(policyId?: string, timeframe?: string): Promise<PolicyViolation[]> {
    return apiClient.get('/api/catalog/governance/policies/violations', {
      params: { policy_id: policyId, timeframe }
    });
  }

  /**
   * Create policy template
   * Maps to: Policy template management
   */
  static async createPolicyTemplate(template: any): Promise<PolicyTemplate> {
    return apiClient.post('/api/catalog/governance/policies/templates', template);
  }

  /**
   * Get policy templates
   * Maps to: Template retrieval
   */
  static async getPolicyTemplates(category?: string): Promise<PolicyTemplate[]> {
    return apiClient.get('/api/catalog/governance/policies/templates', {
      params: { category }
    });
  }

  /**
   * Validate policy compliance
   * Maps to: Policy compliance validation
   */
  static async validatePolicyCompliance(assetId: string, policyIds?: string[]): Promise<any[]> {
    return apiClient.post('/api/catalog/governance/policies/validate', {
      asset_id: assetId,
      policy_ids: policyIds
    });
  }
}

/**
 * ==============================================
 * COMPLIANCE MANAGEMENT
 * ==============================================
 */

export class ComplianceAPI {
  /**
   * Create compliance rule
   * Maps to: Compliance rule management
   */
  static async createComplianceRule(rule: ComplianceRequest): Promise<ComplianceRule> {
    return apiClient.post('/api/catalog/governance/compliance/rules', rule);
  }

  /**
   * Get compliance rules
   * Maps to: Compliance rule retrieval
   */
  static async getComplianceRules(framework?: string, category?: string): Promise<ComplianceRule[]> {
    return apiClient.get('/api/catalog/governance/compliance/rules', {
      params: { framework, category }
    });
  }

  /**
   * Assess compliance status
   * Maps to: Compliance assessment
   */
  static async assessCompliance(assetId: string, framework?: string): Promise<ComplianceAssessment> {
    return apiClient.post('/api/catalog/governance/compliance/assess', {
      asset_id: assetId,
      framework
    });
  }

  /**
   * Get compliance assessment history
   * Maps to: Compliance history tracking
   */
  static async getComplianceHistory(assetId: string, timeframe?: string): Promise<ComplianceAssessment[]> {
    return apiClient.get(`/api/catalog/governance/compliance/history/${assetId}`, {
      params: { timeframe }
    });
  }

  /**
   * Generate compliance report
   * Maps to: unified_governance_coordinator.generate_compliance_reports()
   */
  static async generateComplianceReport(reportConfig: any): Promise<ComplianceReport> {
    return apiClient.post('/api/catalog/governance/compliance/reports', reportConfig);
  }

  /**
   * Get compliance dashboard
   * Maps to: Compliance monitoring dashboard
   */
  static async getComplianceDashboard(framework?: string, scope?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/compliance/dashboard', {
      params: { framework, scope }
    });
  }

  /**
   * Track compliance metrics
   * Maps to: comprehensive_analytics_service.track_governance_compliance()
   */
  static async trackComplianceMetrics(timeframe?: string, framework?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/compliance/metrics', {
      params: { timeframe, framework }
    });
  }

  /**
   * Get regulatory frameworks
   * Maps to: Regulatory framework management
   */
  static async getRegulatoryFrameworks(): Promise<RegulatoryFramework[]> {
    return apiClient.get('/api/catalog/governance/compliance/frameworks');
  }

  /**
   * Map assets to compliance frameworks
   * Maps to: Framework-asset mapping
   */
  static async mapAssetsToFramework(frameworkId: string, assetIds: string[]): Promise<any> {
    return apiClient.post(`/api/catalog/governance/compliance/frameworks/${frameworkId}/map`, {
      asset_ids: assetIds
    });
  }

  /**
   * Get compliance gaps analysis
   * Maps to: Compliance gap identification
   */
  static async getComplianceGapsAnalysis(framework: string, scope?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/compliance/gaps', {
      params: { framework, scope }
    });
  }
}

/**
 * ==============================================
 * AUDIT TRAIL MANAGEMENT
 * ==============================================
 */

export class AuditTrailAPI {
  /**
   * Get audit trail for asset
   * Maps to: Audit trail tracking
   */
  static async getAuditTrail(assetId: string, timeframe?: string, eventTypes?: string[]): Promise<AuditTrail[]> {
    return apiClient.get(`/api/catalog/governance/audit/trail/${assetId}`, {
      params: { timeframe, event_types: eventTypes }
    });
  }

  /**
   * Create audit entry
   * Maps to: Audit entry creation
   */
  static async createAuditEntry(auditEntry: AuditRequest): Promise<AuditTrail> {
    return apiClient.post('/api/catalog/governance/audit/entries', auditEntry);
  }

  /**
   * Search audit trails
   * Maps to: Audit search functionality
   */
  static async searchAuditTrails(searchCriteria: any): Promise<AuditTrail[]> {
    return apiClient.post('/api/catalog/governance/audit/search', searchCriteria);
  }

  /**
   * Get audit summary
   * Maps to: Audit summary aggregation
   */
  static async getAuditSummary(scope?: string, timeframe?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/audit/summary', {
      params: { scope, timeframe }
    });
  }

  /**
   * Export audit trail
   * Maps to: Audit trail export
   */
  static async exportAuditTrail(exportConfig: any): Promise<Blob> {
    return apiClient.post('/api/catalog/governance/audit/export', exportConfig, {
      responseType: 'blob'
    });
  }

  /**
   * Get audit analytics
   * Maps to: Audit pattern analysis
   */
  static async getAuditAnalytics(timeframe?: string, analysisType?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/audit/analytics', {
      params: { timeframe, analysis_type: analysisType }
    });
  }

  /**
   * Configure audit retention policies
   * Maps to: Audit retention management
   */
  static async configureAuditRetention(retentionConfig: any): Promise<any> {
    return apiClient.put('/api/catalog/governance/audit/retention', retentionConfig);
  }

  /**
   * Get audit compliance report
   * Maps to: Audit compliance reporting
   */
  static async getAuditComplianceReport(framework?: string, timeframe?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/audit/compliance-report', {
      params: { framework, timeframe }
    });
  }
}

/**
 * ==============================================
 * GOVERNANCE WORKFLOW MANAGEMENT
 * ==============================================
 */

export class GovernanceWorkflowAPI {
  /**
   * Create governance workflow
   * Maps to: unified_governance_coordinator.manage_governance_workflows()
   */
  static async createGovernanceWorkflow(workflow: WorkflowRequest): Promise<GovernanceWorkflow> {
    return apiClient.post('/api/catalog/governance/workflows', workflow);
  }

  /**
   * Get governance workflows
   * Maps to: Workflow retrieval and filtering
   */
  static async getGovernanceWorkflows(status?: string, type?: string): Promise<GovernanceWorkflow[]> {
    return apiClient.get('/api/catalog/governance/workflows', {
      params: { status, type }
    });
  }

  /**
   * Execute governance workflow
   * Maps to: Workflow execution
   */
  static async executeGovernanceWorkflow(workflowId: string, executionParams?: any): Promise<any> {
    return apiClient.post(`/api/catalog/governance/workflows/${workflowId}/execute`, executionParams);
  }

  /**
   * Get workflow execution status
   * Maps to: Workflow monitoring
   */
  static async getWorkflowExecutionStatus(workflowId: string, executionId: string): Promise<any> {
    return apiClient.get(`/api/catalog/governance/workflows/${workflowId}/executions/${executionId}`);
  }

  /**
   * Approve workflow step
   * Maps to: Workflow approval process
   */
  static async approveWorkflowStep(workflowId: string, stepId: string, approvalData: any): Promise<any> {
    return apiClient.post(`/api/catalog/governance/workflows/${workflowId}/steps/${stepId}/approve`, approvalData);
  }

  /**
   * Reject workflow step
   * Maps to: Workflow rejection process
   */
  static async rejectWorkflowStep(workflowId: string, stepId: string, rejectionReason: string): Promise<any> {
    return apiClient.post(`/api/catalog/governance/workflows/${workflowId}/steps/${stepId}/reject`, {
      rejection_reason: rejectionReason
    });
  }

  /**
   * Get workflow templates
   * Maps to: Workflow template management
   */
  static async getWorkflowTemplates(category?: string): Promise<any[]> {
    return apiClient.get('/api/catalog/governance/workflows/templates', {
      params: { category }
    });
  }

  /**
   * Get workflow analytics
   * Maps to: Workflow performance analytics
   */
  static async getWorkflowAnalytics(timeframe?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/workflows/analytics', {
      params: { timeframe }
    });
  }
}

/**
 * ==============================================
 * RISK ASSESSMENT & MANAGEMENT
 * ==============================================
 */

export class RiskAssessmentAPI {
  /**
   * Perform risk assessment
   * Maps to: Risk assessment engine
   */
  static async performRiskAssessment(request: RiskRequest): Promise<RiskAssessment> {
    return apiClient.post('/api/catalog/governance/risk/assess', request);
  }

  /**
   * Get risk assessments
   * Maps to: Risk assessment retrieval
   */
  static async getRiskAssessments(assetId?: string, riskLevel?: string): Promise<RiskAssessment[]> {
    return apiClient.get('/api/catalog/governance/risk/assessments', {
      params: { asset_id: assetId, risk_level: riskLevel }
    });
  }

  /**
   * Update risk assessment
   * Maps to: Risk assessment updates
   */
  static async updateRiskAssessment(assessmentId: string, updates: any): Promise<RiskAssessment> {
    return apiClient.put(`/api/catalog/governance/risk/assessments/${assessmentId}`, updates);
  }

  /**
   * Get risk dashboard
   * Maps to: Risk monitoring dashboard
   */
  static async getRiskDashboard(scope?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/risk/dashboard', {
      params: { scope }
    });
  }

  /**
   * Create risk mitigation plan
   * Maps to: Risk mitigation planning
   */
  static async createRiskMitigationPlan(assessmentId: string, mitigationPlan: any): Promise<any> {
    return apiClient.post(`/api/catalog/governance/risk/assessments/${assessmentId}/mitigation`, mitigationPlan);
  }

  /**
   * Get risk trends analysis
   * Maps to: Risk trend tracking
   */
  static async getRiskTrends(timeframe?: string, riskCategory?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/risk/trends', {
      params: { timeframe, risk_category: riskCategory }
    });
  }

  /**
   * Generate risk report
   * Maps to: Risk reporting
   */
  static async generateRiskReport(reportConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/governance/risk/reports', reportConfig);
  }

  /**
   * Get risk heat map
   * Maps to: Risk visualization
   */
  static async getRiskHeatMap(scope?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/risk/heatmap', {
      params: { scope }
    });
  }
}

/**
 * ==============================================
 * ACCESS CONTROL & PERMISSIONS
 * ==============================================
 */

export class AccessControlAPI {
  /**
   * Create access control policy
   * Maps to: Access control policy management
   */
  static async createAccessControlPolicy(policy: any): Promise<AccessControlPolicy> {
    return apiClient.post('/api/catalog/governance/access-control/policies', policy);
  }

  /**
   * Get access control policies
   * Maps to: Access policy retrieval
   */
  static async getAccessControlPolicies(scope?: string): Promise<AccessControlPolicy[]> {
    return apiClient.get('/api/catalog/governance/access-control/policies', {
      params: { scope }
    });
  }

  /**
   * Check access permissions
   * Maps to: Permission validation
   */
  static async checkAccessPermissions(userId: string, resourceId: string, action: string): Promise<boolean> {
    return apiClient.post('/api/catalog/governance/access-control/check', {
      user_id: userId,
      resource_id: resourceId,
      action
    });
  }

  /**
   * Grant access permissions
   * Maps to: Permission granting
   */
  static async grantAccessPermissions(userId: string, resourceId: string, permissions: string[]): Promise<any> {
    return apiClient.post('/api/catalog/governance/access-control/grant', {
      user_id: userId,
      resource_id: resourceId,
      permissions
    });
  }

  /**
   * Revoke access permissions
   * Maps to: Permission revocation
   */
  static async revokeAccessPermissions(userId: string, resourceId: string, permissions: string[]): Promise<any> {
    return apiClient.post('/api/catalog/governance/access-control/revoke', {
      user_id: userId,
      resource_id: resourceId,
      permissions
    });
  }

  /**
   * Get user permissions
   * Maps to: User permission retrieval
   */
  static async getUserPermissions(userId: string, resourceType?: string): Promise<any[]> {
    return apiClient.get(`/api/catalog/governance/access-control/users/${userId}/permissions`, {
      params: { resource_type: resourceType }
    });
  }

  /**
   * Get access control audit
   * Maps to: Access control auditing
   */
  static async getAccessControlAudit(timeframe?: string, userId?: string): Promise<any[]> {
    return apiClient.get('/api/catalog/governance/access-control/audit', {
      params: { timeframe, user_id: userId }
    });
  }

  /**
   * Configure role-based access control
   * Maps to: RBAC configuration
   */
  static async configureRBAC(rbacConfig: any): Promise<any> {
    return apiClient.put('/api/catalog/governance/access-control/rbac', rbacConfig);
  }
}

/**
 * ==============================================
 * DATA RETENTION & PRIVACY
 * ==============================================
 */

export class DataRetentionPrivacyAPI {
  /**
   * Create data retention policy
   * Maps to: Data retention policy management
   */
  static async createDataRetentionPolicy(policy: any): Promise<DataRetentionPolicy> {
    return apiClient.post('/api/catalog/governance/retention/policies', policy);
  }

  /**
   * Get data retention policies
   * Maps to: Retention policy retrieval
   */
  static async getDataRetentionPolicies(dataType?: string): Promise<DataRetentionPolicy[]> {
    return apiClient.get('/api/catalog/governance/retention/policies', {
      params: { data_type: dataType }
    });
  }

  /**
   * Apply retention policy to assets
   * Maps to: Retention policy application
   */
  static async applyRetentionPolicy(policyId: string, assetIds: string[]): Promise<any> {
    return apiClient.post(`/api/catalog/governance/retention/policies/${policyId}/apply`, {
      asset_ids: assetIds
    });
  }

  /**
   * Create privacy policy
   * Maps to: Privacy policy management
   */
  static async createPrivacyPolicy(policy: any): Promise<PrivacyPolicy> {
    return apiClient.post('/api/catalog/governance/privacy/policies', policy);
  }

  /**
   * Get privacy compliance status
   * Maps to: Privacy compliance monitoring
   */
  static async getPrivacyComplianceStatus(regulation?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/privacy/compliance', {
      params: { regulation }
    });
  }

  /**
   * Handle data subject requests
   * Maps to: Data subject request processing
   */
  static async handleDataSubjectRequest(requestType: string, requestData: any): Promise<any> {
    return apiClient.post('/api/catalog/governance/privacy/data-subject-requests', {
      request_type: requestType,
      request_data: requestData
    });
  }

  /**
   * Get data processing activities
   * Maps to: Data processing record keeping
   */
  static async getDataProcessingActivities(): Promise<any[]> {
    return apiClient.get('/api/catalog/governance/privacy/processing-activities');
  }

  /**
   * Conduct privacy impact assessment
   * Maps to: Privacy impact assessment
   */
  static async conductPrivacyImpactAssessment(assetId: string, assessmentConfig: any): Promise<any> {
    return apiClient.post(`/api/catalog/governance/privacy/impact-assessment/${assetId}`, assessmentConfig);
  }
}

/**
 * ==============================================
 * GOVERNANCE ANALYTICS & INSIGHTS
 * ==============================================
 */

export class GovernanceAnalyticsAPI {
  /**
   * Get governance analytics dashboard
   * Maps to: comprehensive_analytics_service.track_governance_metrics()
   */
  static async getGovernanceAnalyticsDashboard(timeframe?: string, scope?: string): Promise<GovernanceAnalytics> {
    return apiClient.get('/api/catalog/governance/analytics/dashboard', {
      params: { timeframe, scope }
    });
  }

  /**
   * Get governance metrics
   * Maps to: Governance KPI tracking
   */
  static async getGovernanceMetrics(metricTypes?: string[], timeframe?: string): Promise<GovernanceMetrics> {
    return apiClient.get('/api/catalog/governance/analytics/metrics', {
      params: { metric_types: metricTypes, timeframe }
    });
  }

  /**
   * Generate governance insights
   * Maps to: AI-powered governance insights
   */
  static async generateGovernanceInsights(analysisType?: string, scope?: string): Promise<GovernanceInsight[]> {
    return apiClient.get('/api/catalog/governance/analytics/insights', {
      params: { analysis_type: analysisType, scope }
    });
  }

  /**
   * Get governance ROI analysis
   * Maps to: Governance value assessment
   */
  static async getGovernanceROIAnalysis(timeframe?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/analytics/roi', {
      params: { timeframe }
    });
  }

  /**
   * Get compliance effectiveness metrics
   * Maps to: Compliance effectiveness tracking
   */
  static async getComplianceEffectiveness(framework?: string, timeframe?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/analytics/compliance-effectiveness', {
      params: { framework, timeframe }
    });
  }

  /**
   * Generate governance maturity assessment
   * Maps to: Governance maturity evaluation
   */
  static async generateMaturityAssessment(scope?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/analytics/maturity', {
      params: { scope }
    });
  }

  /**
   * Get governance benchmark data
   * Maps to: Industry benchmarking
   */
  static async getGovernanceBenchmarks(industry?: string, organizationSize?: string): Promise<any> {
    return apiClient.get('/api/catalog/governance/analytics/benchmarks', {
      params: { industry, organization_size: organizationSize }
    });
  }

  /**
   * Export governance analytics
   * Maps to: Analytics data export
   */
  static async exportGovernanceAnalytics(exportConfig: any): Promise<Blob> {
    return apiClient.post('/api/catalog/governance/analytics/export', exportConfig, {
      responseType: 'blob'
    });
  }
}

/**
 * ==============================================
 * GOVERNANCE CONFIGURATION & SETTINGS
 * ==============================================
 */

export class GovernanceConfigurationAPI {
  /**
   * Get governance configuration
   * Maps to: Governance system configuration
   */
  static async getGovernanceConfiguration(): Promise<GovernanceConfiguration> {
    return apiClient.get('/api/catalog/governance/configuration');
  }

  /**
   * Update governance configuration
   * Maps to: Configuration updates
   */
  static async updateGovernanceConfiguration(config: Partial<GovernanceConfiguration>): Promise<GovernanceConfiguration> {
    return apiClient.put('/api/catalog/governance/configuration', config);
  }

  /**
   * Get governance alerts configuration
   * Maps to: Alert configuration management
   */
  static async getGovernanceAlertsConfig(): Promise<any> {
    return apiClient.get('/api/catalog/governance/configuration/alerts');
  }

  /**
   * Configure governance alerts
   * Maps to: Alert configuration
   */
  static async configureGovernanceAlerts(alertConfig: any): Promise<any> {
    return apiClient.put('/api/catalog/governance/configuration/alerts', alertConfig);
  }

  /**
   * Get active governance alerts
   * Maps to: Active alert monitoring
   */
  static async getActiveGovernanceAlerts(severity?: string): Promise<GovernanceAlert[]> {
    return apiClient.get('/api/catalog/governance/alerts/active', {
      params: { severity }
    });
  }

  /**
   * Acknowledge governance alert
   * Maps to: Alert acknowledgment
   */
  static async acknowledgeGovernanceAlert(alertId: string, acknowledgment: any): Promise<any> {
    return apiClient.post(`/api/catalog/governance/alerts/${alertId}/acknowledge`, acknowledgment);
  }

  /**
   * Configure governance thresholds
   * Maps to: Threshold configuration
   */
  static async configureGovernanceThresholds(thresholds: any): Promise<any> {
    return apiClient.put('/api/catalog/governance/configuration/thresholds', thresholds);
  }

  /**
   * Reset governance configuration
   * Maps to: Configuration reset
   */
  static async resetGovernanceConfiguration(): Promise<any> {
    return apiClient.post('/api/catalog/governance/configuration/reset');
  }
}

/**
 * ==============================================
 * COMPREHENSIVE GOVERNANCE API
 * ==============================================
 */

export class GovernanceAPI {
  // Combine all governance APIs
  static readonly Policy = GovernancePolicyAPI;
  static readonly Compliance = ComplianceAPI;
  static readonly AuditTrail = AuditTrailAPI;
  static readonly Workflow = GovernanceWorkflowAPI;
  static readonly RiskAssessment = RiskAssessmentAPI;
  static readonly AccessControl = AccessControlAPI;
  static readonly DataRetentionPrivacy = DataRetentionPrivacyAPI;
  static readonly Analytics = GovernanceAnalyticsAPI;
  static readonly Configuration = GovernanceConfigurationAPI;

  /**
   * Get comprehensive governance overview
   * Maps to: unified_governance_coordinator complete overview
   */
  static async getGovernanceOverview(options?: {
    include_policies?: boolean;
    include_compliance?: boolean;
    include_risks?: boolean;
    include_audit?: boolean;
    include_workflows?: boolean;
    include_analytics?: boolean;
  }): Promise<any> {
    return apiClient.get('/api/catalog/governance/overview', { params: options });
  }

  /**
   * Initialize governance for new system or asset
   * Maps to: Governance initialization
   */
  static async initializeGovernance(initConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/governance/initialize', initConfig);
  }

  /**
   * Perform governance health check
   * Maps to: unified_governance_coordinator.ensure_governance_consistency()
   */
  static async performGovernanceHealthCheck(): Promise<any> {
    return apiClient.get('/api/catalog/governance/health-check');
  }

  /**
   * Get governance system status
   * Maps to: System-wide governance monitoring
   */
  static async getGovernanceSystemStatus(): Promise<any> {
    return apiClient.get('/api/catalog/governance/system/status');
  }

  /**
   * Synchronize governance across systems
   * Maps to: Cross-system governance synchronization
   */
  static async synchronizeGovernance(systems?: string[]): Promise<any> {
    return apiClient.post('/api/catalog/governance/synchronize', { systems });
  }

  /**
   * Generate comprehensive governance report
   * Maps to: Complete governance reporting
   */
  static async generateComprehensiveReport(reportConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/governance/reports/comprehensive', reportConfig);
  }

  /**
   * Get governance recommendations
   * Maps to: AI-powered governance recommendations
   */
  static async getGovernanceRecommendations(scope?: string): Promise<any[]> {
    return apiClient.get('/api/catalog/governance/recommendations', {
      params: { scope }
    });
  }

  /**
   * Execute governance remediation
   * Maps to: Automated governance remediation
   */
  static async executeGovernanceRemediation(remediationPlan: any): Promise<any> {
    return apiClient.post('/api/catalog/governance/remediate', remediationPlan);
  }
}

// Default export with all governance APIs
export default GovernanceAPI;