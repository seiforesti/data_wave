// ============================================================================
// RACINE MAIN MANAGER - QUICK ACTIONS API SERVICE
// Lightweight API functions for Quick Actions Sidebar subcomponents
// Integration with all 7 existing SPA services for quick access functionality
// Maps to backend: quick_actions_routes.py + all group service endpoints
// ============================================================================

import {
  DataSourceConfig,
  DataSourceStatus,
  DataSourceMetrics,
  ScanRuleSet,
  ScanRuleStatus,
  ScanRuleMetrics,
  ClassificationRule,
  ClassificationStatus,
  ClassificationMetrics,
  ComplianceRule,
  ComplianceStatus,
  ComplianceMetrics,
  CatalogAsset,
  CatalogStatus,
  CatalogMetrics,
  ScanLogicConfig,
  ScanLogicStatus,
  ScanLogicMetrics,
  RBACUser,
  RBACRole,
  RBACMetrics,
  WorkflowTemplate,
  PipelineTemplate,
  DashboardTemplate,
  WorkspaceTemplate,
  ActivitySummary,
  APIResponse,
  APIError,
  UUID,
  ISODateString
} from '../types/racine-core.types';

// Import existing SPA services for integration
import { dataSourceApis } from './data-source-apis';
import { scanRuleSetsApis } from './scan-rule-sets-apis';
import { classificationsApis } from './classifications-apis';
import { complianceRuleApis } from './compliance-rule-apis';
import { racineAdvancedCatalogAPI } from './advanced-catalog-apis';
import { racineScanLogicAPI } from './scan-logic-apis';
import { rbacAdminAPI } from './rbac-admin-apis';
import { jobWorkflowAPI } from './job-workflow-apis';
import { pipelineManagementAPI } from './pipeline-management-apis';
import { dashboardAPI } from './dashboard-apis';
import { workspaceManagementAPI } from './workspace-management-apis';
import { activityTrackingAPI } from './activity-tracking-apis';
import { aiAssistantAPI } from './ai-assistant-apis';
import { collaborationAPI } from './collaboration-apis';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
const QUICK_ACTIONS_ENDPOINT = `${API_BASE_URL}/racine/quick-actions`;

/**
 * Quick Actions API Service for all subcomponents
 * Provides lightweight, fast access to common operations across all 7 groups
 */
class QuickActionsAPIService {
  private baseURL: string;
  private headers: HeadersInit;

  constructor() {
    this.baseURL = QUICK_ACTIONS_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Racine-Integration': 'true',
      'X-Quick-Action': 'true',
      'X-Client-Version': '2.0.0'
    };
  }

  /**
   * Make quick API request with minimal overhead
   */
  private async makeQuickRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData.details
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        'Quick action request failed',
        0,
        'QUICK_ACTION_ERROR',
        { originalError: error.message }
      );
    }
  }

  // ============================================================================
  // DATA SOURCES QUICK ACTIONS
  // For data-sources/ subcomponents
  // ============================================================================

  /**
   * Quick create data source with minimal configuration
   */
  async quickCreateDataSource(basicConfig: {
    name: string;
    type: string;
    connectionString: string;
    workspaceId?: UUID;
  }): Promise<DataSourceConfig> {
    // Use existing data source service
    const fullConfig = await dataSourceApis.createDataSource({
      ...basicConfig,
      isQuickCreate: true,
      configuration: {
        autoDetectSchema: true,
        enableAutoSync: true,
        defaultScanEnabled: true
      }
    });

    return fullConfig;
  }

  /**
   * Quick test data source connection
   */
  async quickTestConnection(dataSourceId: UUID): Promise<{ success: boolean; message: string; latency?: number }> {
    return await dataSourceApis.testConnection(dataSourceId);
  }

  /**
   * Get quick data source status overview
   */
  async getQuickDataSourceStatus(workspaceId?: UUID): Promise<{
    total: number;
    healthy: number;
    warning: number;
    error: number;
    recent: DataSourceStatus[];
  }> {
    const result = await this.makeQuickRequest<APIResponse<any>>('/data-sources/status', {
      method: 'GET',
      headers: {
        'X-Workspace-ID': workspaceId || ''
      }
    });

    return result.data;
  }

  /**
   * Get quick data source metrics
   */
  async getQuickDataSourceMetrics(workspaceId?: UUID): Promise<DataSourceMetrics> {
    return await dataSourceApis.getDataSourceMetrics(workspaceId);
  }

  // ============================================================================
  // SCAN RULE SETS QUICK ACTIONS
  // For scan-rule-sets/ subcomponents
  // ============================================================================

  /**
   * Quick create scan rule with template
   */
  async quickCreateScanRule(basicRule: {
    name: string;
    type: string;
    pattern: string;
    severity: 'low' | 'medium' | 'high';
    workspaceId?: UUID;
  }): Promise<ScanRuleSet> {
    // Use existing scan rule service
    return await scanRuleSetsApis.createScanRuleSet({
      ...basicRule,
      isQuickCreate: true,
      autoActivate: true,
      rules: [{
        name: basicRule.name,
        pattern: basicRule.pattern,
        severity: basicRule.severity,
        enabled: true
      }]
    });
  }

  /**
   * Quick test scan rule
   */
  async quickTestScanRule(ruleId: UUID, testData: string): Promise<{ matches: boolean; details: any }> {
    return await scanRuleSetsApis.testScanRule(ruleId, testData);
  }

  /**
   * Get quick scan rule status
   */
  async getQuickScanRuleStatus(workspaceId?: UUID): Promise<{
    total: number;
    active: number;
    inactive: number;
    recent: ScanRuleStatus[];
  }> {
    const result = await this.makeQuickRequest<APIResponse<any>>('/scan-rules/status', {
      method: 'GET',
      headers: {
        'X-Workspace-ID': workspaceId || ''
      }
    });

    return result.data;
  }

  /**
   * Get quick scan rule metrics
   */
  async getQuickScanRuleMetrics(workspaceId?: UUID): Promise<ScanRuleMetrics> {
    return await scanRuleSetsApis.getScanRuleMetrics(workspaceId);
  }

  // ============================================================================
  // CLASSIFICATIONS QUICK ACTIONS
  // For classifications/ subcomponents
  // ============================================================================

  /**
   * Quick create classification rule
   */
  async quickCreateClassification(basicClassification: {
    name: string;
    category: string;
    criteria: string;
    sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
    workspaceId?: UUID;
  }): Promise<ClassificationRule> {
    return await classificationsApis.createClassification({
      ...basicClassification,
      isQuickCreate: true,
      autoApply: true
    });
  }

  /**
   * Quick apply classification to data
   */
  async quickApplyClassification(classificationId: UUID, targetId: UUID): Promise<{ success: boolean; applied: any }> {
    return await classificationsApis.applyClassification(classificationId, targetId);
  }

  /**
   * Get quick classification status
   */
  async getQuickClassificationStatus(workspaceId?: UUID): Promise<{
    total: number;
    applied: number;
    pending: number;
    recent: ClassificationStatus[];
  }> {
    const result = await this.makeQuickRequest<APIResponse<any>>('/classifications/status', {
      method: 'GET',
      headers: {
        'X-Workspace-ID': workspaceId || ''
      }
    });

    return result.data;
  }

  /**
   * Get quick classification metrics
   */
  async getQuickClassificationMetrics(workspaceId?: UUID): Promise<ClassificationMetrics> {
    return await classificationsApis.getClassificationMetrics(workspaceId);
  }

  // ============================================================================
  // COMPLIANCE RULE QUICK ACTIONS
  // For compliance-rule/ subcomponents
  // ============================================================================

  /**
   * Quick compliance check
   */
  async quickComplianceCheck(targetId: UUID, ruleIds?: UUID[]): Promise<{
    compliant: boolean;
    violations: any[];
    score: number;
  }> {
    return await complianceRuleApis.executeComplianceCheck(targetId, ruleIds);
  }

  /**
   * Quick generate audit report
   */
  async quickGenerateAuditReport(scope: 'workspace' | 'asset' | 'global', targetId?: UUID): Promise<Blob> {
    return await complianceRuleApis.generateAuditReport({ scope, targetId });
  }

  /**
   * Get quick compliance status
   */
  async getQuickComplianceStatus(workspaceId?: UUID): Promise<{
    overallScore: number;
    violations: number;
    compliant: number;
    recent: ComplianceStatus[];
  }> {
    const result = await this.makeQuickRequest<APIResponse<any>>('/compliance/status', {
      method: 'GET',
      headers: {
        'X-Workspace-ID': workspaceId || ''
      }
    });

    return result.data;
  }

  /**
   * Get quick compliance metrics
   */
  async getQuickComplianceMetrics(workspaceId?: UUID): Promise<ComplianceMetrics> {
    return await complianceRuleApis.getComplianceMetrics(workspaceId);
  }

  // ============================================================================
  // ADVANCED CATALOG QUICK ACTIONS
  // For advanced-catalog/ subcomponents
  // ============================================================================

  /**
   * Quick catalog search
   */
  async quickCatalogSearch(query: string, filters?: any): Promise<{
    results: CatalogAsset[];
    total: number;
    facets: any;
  }> {
    return await advancedCatalogApis.searchCatalog(query, filters);
  }

  /**
   * Quick create catalog asset
   */
  async quickCreateAsset(basicAsset: {
    name: string;
    type: string;
    description: string;
    dataSourceId: UUID;
    workspaceId?: UUID;
  }): Promise<CatalogAsset> {
    return await advancedCatalogApis.createAsset({
      ...basicAsset,
      isQuickCreate: true,
      autoIndex: true
    });
  }

  /**
   * Quick view data lineage
   */
  async quickViewLineage(assetId: UUID, depth?: number): Promise<{ nodes: any[]; edges: any[] }> {
    return await advancedCatalogApis.getDataLineage(assetId, depth || 3);
  }

     /**
    * Get quick catalog metrics
    */
   async getQuickCatalogMetrics(workspaceId?: UUID): Promise<CatalogMetrics> {
     return await racineAdvancedCatalogAPI.getCatalogMetrics(workspaceId);
   }

  // ============================================================================
  // SCAN LOGIC QUICK ACTIONS
  // For scan-logic/ subcomponents
  // ============================================================================

  /**
   * Quick start scan
   */
  async quickStartScan(configId: UUID, options?: { priority?: 'low' | 'normal' | 'high' }): Promise<{
    scanId: UUID;
    estimatedDuration: number;
    status: ScanLogicStatus;
  }> {
    return await scanLogicApis.executeScan(configId, {
      ...options,
      isQuickAction: true
    });
  }

  /**
   * Get quick scan status
   */
  async getQuickScanStatus(workspaceId?: UUID): Promise<{
    active: number;
    completed: number;
    failed: number;
    queued: number;
    recent: any[];
  }> {
    const result = await this.makeQuickRequest<APIResponse<any>>('/scans/status', {
      method: 'GET',
      headers: {
        'X-Workspace-ID': workspaceId || ''
      }
    });

    return result.data;
  }

  /**
   * Get quick scan results
   */
  async getQuickScanResults(scanId: UUID): Promise<{
    summary: any;
    findings: any[];
    progress: number;
  }> {
    return await scanLogicApis.getScanResults(scanId);
  }

  /**
   * Get quick scan metrics
   */
  async getQuickScanMetrics(workspaceId?: UUID): Promise<ScanLogicMetrics> {
    return await scanLogicApis.getScanMetrics(workspaceId);
  }

  // ============================================================================
  // RBAC SYSTEM QUICK ACTIONS (Admin Only)
  // For rbac-system/ subcomponents
  // ============================================================================

  /**
   * Quick create user
   */
  async quickCreateUser(basicUser: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    workspaceId?: UUID;
  }): Promise<RBACUser> {
    return await rbacAdminAPI.createUser({
      ...basicUser,
      isActive: true,
      isVerified: false // Will need email verification
    });
  }

  /**
   * Quick assign role
   */
  async quickAssignRole(userId: UUID, roleId: UUID, workspaceId?: UUID): Promise<{ success: boolean }> {
    await rbacAdminAPI.assignRoleToUser(userId, roleId, workspaceId);
    return { success: true };
  }

  /**
   * Quick permission check
   */
  async quickCheckPermission(userId: UUID, resource: string, action: string): Promise<{
    hasPermission: boolean;
    reason?: string;
  }> {
    const hasPermission = await rbacAdminAPI.checkPermission(userId, resource, action);
    return {
      hasPermission,
      reason: hasPermission ? undefined : 'Permission denied'
    };
  }

  /**
   * Get quick RBAC metrics
   */
  async getQuickRBACMetrics(workspaceId?: UUID): Promise<RBACMetrics> {
    return await rbacAdminAPI.getRBACMetrics(workspaceId);
  }

  // ============================================================================
  // RACINE FEATURES QUICK ACTIONS
  // For racine-features/ subcomponents
  // ============================================================================

  /**
   * Quick create workflow
   */
  async quickCreateWorkflow(template: WorkflowTemplate, workspaceId?: UUID): Promise<{
    workflowId: UUID;
    status: string;
  }> {
    return await jobWorkflowApis.createWorkflowFromTemplate(template, {
      workspaceId,
      isQuickCreate: true
    });
  }

  /**
   * Quick create pipeline
   */
  async quickCreatePipeline(template: PipelineTemplate, workspaceId?: UUID): Promise<{
    pipelineId: UUID;
    status: string;
  }> {
    return await pipelineManagementApis.createPipelineFromTemplate(template, {
      workspaceId,
      isQuickCreate: true
    });
  }

  /**
   * Quick AI chat
   */
  async quickAIChat(message: string, context?: any): Promise<{
    response: string;
    suggestions: string[];
    actions?: any[];
  }> {
    return await aiAssistantApis.processQuickQuery(message, context);
  }

  /**
   * Quick create dashboard
   */
  async quickCreateDashboard(template: DashboardTemplate, workspaceId?: UUID): Promise<{
    dashboardId: UUID;
    url: string;
  }> {
    return await dashboardApis.createDashboardFromTemplate(template, {
      workspaceId,
      isQuickCreate: true
    });
  }

  /**
   * Quick team chat
   */
  async quickSendTeamMessage(message: string, channelId?: UUID, workspaceId?: UUID): Promise<{
    messageId: UUID;
    sent: boolean;
  }> {
    return await collaborationApis.sendQuickMessage(message, channelId, workspaceId);
  }

  /**
   * Quick create workspace
   */
  async quickCreateWorkspace(template: WorkspaceTemplate): Promise<{
    workspaceId: UUID;
    accessUrl: string;
  }> {
    return await workspaceManagementApis.createWorkspaceFromTemplate(template, {
      isQuickCreate: true
    });
  }

  /**
   * Quick activity view
   */
  async quickGetActivityView(workspaceId?: UUID, timeRange?: '1h' | '24h' | '7d'): Promise<ActivitySummary> {
    return await activityTrackingApis.getActivitySummary(workspaceId, timeRange || '24h');
  }

  // ============================================================================
  // CONTEXT-AWARE QUICK ACTIONS
  // Cross-group functionality
  // ============================================================================

  /**
   * Get contextual quick actions based on current state
   */
  async getContextualQuickActions(context: {
    currentSPA: string;
    workspaceId?: UUID;
    userId?: UUID;
    recentActions?: string[];
  }): Promise<{
    recommended: Array<{
      action: string;
      label: string;
      description: string;
      priority: number;
    }>;
    available: Array<{
      group: string;
      actions: Array<{
        action: string;
        label: string;
        enabled: boolean;
      }>;
    }>;
  }> {
    const result = await this.makeQuickRequest<APIResponse<any>>('/contextual-actions', {
      method: 'POST',
      body: JSON.stringify(context),
    });

    return result.data;
  }

  /**
   * Execute quick action by ID
   */
  async executeQuickAction(actionId: string, parameters: any): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    try {
      const result = await this.makeQuickRequest<APIResponse<any>>(`/execute/${actionId}`, {
        method: 'POST',
        body: JSON.stringify(parameters),
      });

      return {
        success: true,
        result: result.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get quick action history
   */
  async getQuickActionHistory(userId: UUID, limit = 10): Promise<Array<{
    actionId: string;
    timestamp: ISODateString;
    parameters: any;
    result: any;
  }>> {
    const result = await this.makeQuickRequest<APIResponse<any[]>>(`/history/${userId}`, {
      method: 'GET',
      headers: {
        'X-Limit': limit.toString()
      }
    });

    return result.data;
  }

  // ============================================================================
  // QUICK ANALYTICS AND METRICS
  // Aggregated metrics across all groups
  // ============================================================================

  /**
   * Get global quick metrics
   */
  async getGlobalQuickMetrics(workspaceId?: UUID): Promise<{
    dataSources: { total: number; healthy: number };
    scanRules: { total: number; active: number };
    classifications: { total: number; applied: number };
    compliance: { score: number; violations: number };
    catalog: { assets: number; indexed: number };
    scans: { active: number; completed: number };
    rbac: { users: number; roles: number };
    quickActions: { today: number; thisWeek: number };
  }> {
    const result = await this.makeQuickRequest<APIResponse<any>>('/metrics/global', {
      method: 'GET',
      headers: {
        'X-Workspace-ID': workspaceId || ''
      }
    });

    return result.data;
  }

  /**
   * Get quick action performance metrics
   */
  async getQuickActionMetrics(): Promise<{
    averageResponseTime: number;
    successRate: number;
    mostUsedActions: Array<{ action: string; count: number }>;
    errorRate: number;
  }> {
    const result = await this.makeQuickRequest<APIResponse<any>>('/metrics/performance', {
      method: 'GET',
    });

    return result.data;
  }
}

// Create and export singleton instance
export const quickActionsAPI = new QuickActionsAPIService();

// Export the class for custom instantiation
export { QuickActionsAPIService };

// Export types for external use
export type {
  DataSourceConfig,
  ScanRuleSet,
  ClassificationRule,
  ComplianceRule,
  CatalogAsset,
  ScanLogicConfig,
  RBACUser,
  WorkflowTemplate,
  PipelineTemplate,
  DashboardTemplate,
  WorkspaceTemplate,
  ActivitySummary
};