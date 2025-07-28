/**
 * Data Lineage APIs - Advanced Lineage Management System
 * ======================================================
 * 
 * Complete mapping to backend lineage services:
 * - advanced_lineage_service.py (45KB, 25+ endpoints)
 * - lineage_service.py (704 lines, core lineage management)
 * - advanced_lineage_routes.py (998 lines, 25+ endpoints)
 * - data_lineage_models.py (5+ classes)
 * - enterprise_catalog_service.py (lineage features)
 * 
 * This service provides comprehensive data lineage management:
 * - Column-level lineage tracking
 * - Interactive lineage visualization
 * - Impact analysis and dependency mapping
 * - Real-time lineage updates
 * - Cross-system lineage integration
 * - Lineage governance and validation
 * - Automated lineage discovery
 * - Lineage reporting and analytics
 */

import { apiClient } from '../../shared/utils/api-client';
import type {
  DataLineageNode,
  DataLineageEdge,
  LineageGraph,
  LineageImpactAnalysis,
  LineageVisualizationConfig,
  LineageMetrics,
  LineageTrackingRequest,
  ImpactAnalysisRequest,
  LineageDiscoveryRequest,
  LineageValidationResult,
  LineageReport,
  ColumnLineage,
  TransformationLineage,
  LineagePathway,
  LineageDependency,
  LineageGovernanceRule,
  LineageAuditTrail,
  ChangeImpactAssessment,
  LineageSearchRequest,
  LineageComparisonResult,
  AutomatedLineageResult
} from '../types/lineage.types';

/**
 * ==============================================
 * ADVANCED LINEAGE SERVICE (advanced_lineage_service.py)
 * ==============================================
 */

export class AdvancedLineageAPI {
  /**
   * Track real-time data lineage across systems
   * Maps to: AdvancedLineageService.track_data_lineage_realtime()
   */
  static async trackRealTimeLineage(request: LineageTrackingRequest): Promise<LineageGraph> {
    return apiClient.post('/api/catalog/lineage/track/realtime', request);
  }

  /**
   * Analyze impact of changes across data pipeline
   * Maps to: AdvancedLineageService.analyze_impact_changes()
   */
  static async analyzeImpactChanges(request: ImpactAnalysisRequest): Promise<LineageImpactAnalysis> {
    return apiClient.post('/api/catalog/lineage/impact/analyze', request);
  }

  /**
   * Generate interactive lineage graph visualization
   * Maps to: AdvancedLineageService.visualize_lineage_graph()
   */
  static async visualizeLineageGraph(assetId: string, config?: LineageVisualizationConfig): Promise<any> {
    return apiClient.post(`/api/catalog/lineage/visualize/${assetId}`, config);
  }

  /**
   * Validate lineage accuracy and completeness
   * Maps to: AdvancedLineageService.validate_lineage_accuracy()
   */
  static async validateLineageAccuracy(assetId: string, validationRules?: any[]): Promise<LineageValidationResult> {
    return apiClient.post(`/api/catalog/lineage/validate/${assetId}`, { validation_rules: validationRules });
  }

  /**
   * Compute dependency chains and relationships
   * Maps to: AdvancedLineageService.compute_dependency_chains()
   */
  static async computeDependencyChains(assetId: string, direction?: 'upstream' | 'downstream' | 'both'): Promise<LineageDependency[]> {
    return apiClient.get(`/api/catalog/lineage/dependencies/${assetId}`, {
      params: { direction }
    });
  }

  /**
   * Assess change impact across data systems
   * Maps to: AdvancedLineageService.assess_change_impact()
   */
  static async assessChangeImpact(changeRequest: any): Promise<ChangeImpactAssessment> {
    return apiClient.post('/api/catalog/lineage/impact/assess', changeRequest);
  }

  /**
   * Generate comprehensive lineage reports
   * Maps to: AdvancedLineageService.generate_lineage_reports()
   */
  static async generateLineageReports(reportConfig: any): Promise<LineageReport> {
    return apiClient.post('/api/catalog/lineage/reports/generate', reportConfig);
  }

  /**
   * Optimize lineage performance and tracking
   * Maps to: AdvancedLineageService.optimize_lineage_performance()
   */
  static async optimizeLineagePerformance(optimizationConfig?: any): Promise<any> {
    return apiClient.post('/api/catalog/lineage/optimize', optimizationConfig);
  }

  /**
   * Get column-level lineage details
   * Maps to: Column-level lineage tracking
   */
  static async getColumnLineage(assetId: string, columnName?: string): Promise<ColumnLineage[]> {
    return apiClient.get(`/api/catalog/lineage/column/${assetId}`, {
      params: { column_name: columnName }
    });
  }

  /**
   * Track transformation lineage and data flow
   * Maps to: Transformation tracking capabilities
   */
  static async getTransformationLineage(transformationId: string): Promise<TransformationLineage> {
    return apiClient.get(`/api/catalog/lineage/transformation/${transformationId}`);
  }
}

/**
 * ==============================================
 * CORE LINEAGE SERVICE (lineage_service.py)
 * ==============================================
 */

export class LineageManagementAPI {
  /**
   * Create new lineage relationship
   * Maps to: LineageService core functionality
   */
  static async createLineageRelationship(relationship: any): Promise<DataLineageEdge> {
    return apiClient.post('/api/catalog/lineage/relationships', relationship);
  }

  /**
   * Get lineage nodes for specific asset
   * Maps to: DataLineageNode model retrieval
   */
  static async getLineageNodes(assetId: string, depth?: number): Promise<DataLineageNode[]> {
    return apiClient.get(`/api/catalog/lineage/nodes/${assetId}`, {
      params: { depth }
    });
  }

  /**
   * Get lineage edges and connections
   * Maps to: DataLineageEdge model retrieval
   */
  static async getLineageEdges(fromAssetId?: string, toAssetId?: string): Promise<DataLineageEdge[]> {
    return apiClient.get('/api/catalog/lineage/edges', {
      params: { from_asset_id: fromAssetId, to_asset_id: toAssetId }
    });
  }

  /**
   * Update lineage relationship
   * Maps to: Lineage relationship updates
   */
  static async updateLineageRelationship(edgeId: string, updates: any): Promise<DataLineageEdge> {
    return apiClient.put(`/api/catalog/lineage/relationships/${edgeId}`, updates);
  }

  /**
   * Delete lineage relationship
   * Maps to: Lineage relationship deletion
   */
  static async deleteLineageRelationship(edgeId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/lineage/relationships/${edgeId}`);
  }

  /**
   * Get complete lineage graph for asset
   * Maps to: Complete lineage graph construction
   */
  static async getCompleteLineageGraph(assetId: string, maxDepth?: number): Promise<LineageGraph> {
    return apiClient.get(`/api/catalog/lineage/graph/${assetId}`, {
      params: { max_depth: maxDepth }
    });
  }

  /**
   * Search lineage by various criteria
   * Maps to: Lineage search functionality
   */
  static async searchLineage(request: LineageSearchRequest): Promise<any> {
    return apiClient.post('/api/catalog/lineage/search', request);
  }

  /**
   * Get lineage pathways between assets
   * Maps to: Pathway discovery between assets
   */
  static async getLineagePathways(sourceId: string, targetId: string): Promise<LineagePathway[]> {
    return apiClient.get('/api/catalog/lineage/pathways', {
      params: { source_id: sourceId, target_id: targetId }
    });
  }
}

/**
 * ==============================================
 * LINEAGE DISCOVERY & AUTOMATION
 * ==============================================
 */

export class LineageDiscoveryAPI {
  /**
   * Discover lineage automatically using AI
   * Maps to: Automated lineage discovery
   */
  static async discoverLineageAutomatically(request: LineageDiscoveryRequest): Promise<AutomatedLineageResult> {
    return apiClient.post('/api/catalog/lineage/discover/auto', request);
  }

  /**
   * Scan systems for lineage relationships
   * Maps to: System scanning for lineage
   */
  static async scanForLineage(systemIds: string[], scanConfig?: any): Promise<any> {
    return apiClient.post('/api/catalog/lineage/discover/scan', {
      system_ids: systemIds,
      scan_config: scanConfig
    });
  }

  /**
   * Parse SQL and code for lineage extraction
   * Maps to: Code parsing for lineage discovery
   */
  static async parseCodeForLineage(code: string, codeType: string, context?: any): Promise<any> {
    return apiClient.post('/api/catalog/lineage/discover/parse', {
      code,
      code_type: codeType,
      context
    });
  }

  /**
   * Import lineage from external systems
   * Maps to: External lineage import
   */
  static async importExternalLineage(importConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/lineage/import', importConfig);
  }

  /**
   * Reconcile conflicting lineage information
   * Maps to: Lineage conflict resolution
   */
  static async reconcileLineageConflicts(conflictId: string, resolution: any): Promise<any> {
    return apiClient.post(`/api/catalog/lineage/reconcile/${conflictId}`, resolution);
  }

  /**
   * Schedule periodic lineage discovery
   * Maps to: Automated lineage discovery scheduling
   */
  static async scheduleLineageDiscovery(scheduleConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/lineage/discover/schedule', scheduleConfig);
  }

  /**
   * Get lineage discovery job status
   * Maps to: Discovery job monitoring
   */
  static async getDiscoveryJobStatus(jobId: string): Promise<any> {
    return apiClient.get(`/api/catalog/lineage/discover/jobs/${jobId}/status`);
  }
}

/**
 * ==============================================
 * LINEAGE GOVERNANCE & VALIDATION
 * ==============================================
 */

export class LineageGovernanceAPI {
  /**
   * Create lineage governance rules
   * Maps to: Lineage governance management
   */
  static async createGovernanceRule(rule: LineageGovernanceRule): Promise<LineageGovernanceRule> {
    return apiClient.post('/api/catalog/lineage/governance/rules', rule);
  }

  /**
   * Get lineage governance rules
   * Maps to: Governance rules retrieval
   */
  static async getGovernanceRules(assetType?: string, scope?: string): Promise<LineageGovernanceRule[]> {
    return apiClient.get('/api/catalog/lineage/governance/rules', {
      params: { asset_type: assetType, scope }
    });
  }

  /**
   * Validate lineage against governance rules
   * Maps to: Governance validation
   */
  static async validateGovernanceCompliance(assetId: string, ruleIds?: string[]): Promise<any> {
    return apiClient.post(`/api/catalog/lineage/governance/validate/${assetId}`, {
      rule_ids: ruleIds
    });
  }

  /**
   * Get lineage audit trail
   * Maps to: Lineage audit tracking
   */
  static async getLineageAuditTrail(assetId: string, timeframe?: string): Promise<LineageAuditTrail[]> {
    return apiClient.get(`/api/catalog/lineage/audit/${assetId}`, {
      params: { timeframe }
    });
  }

  /**
   * Generate governance compliance reports
   * Maps to: Governance reporting
   */
  static async generateGovernanceReport(reportConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/lineage/governance/reports', reportConfig);
  }

  /**
   * Set lineage data quality thresholds
   * Maps to: Quality threshold management
   */
  static async setQualityThresholds(assetId: string, thresholds: any): Promise<any> {
    return apiClient.put(`/api/catalog/lineage/governance/thresholds/${assetId}`, thresholds);
  }

  /**
   * Monitor lineage data quality
   * Maps to: Continuous quality monitoring
   */
  static async monitorLineageQuality(): Promise<any> {
    return apiClient.get('/api/catalog/lineage/governance/quality-monitor');
  }
}

/**
 * ==============================================
 * IMPACT ANALYSIS & CHANGE MANAGEMENT
 * ==============================================
 */

export class ImpactAnalysisAPI {
  /**
   * Perform comprehensive impact analysis
   * Maps to: Advanced impact analysis engine
   */
  static async performImpactAnalysis(assetId: string, changeType: string, changeDetails?: any): Promise<LineageImpactAnalysis> {
    return apiClient.post(`/api/catalog/lineage/impact/analyze/${assetId}`, {
      change_type: changeType,
      change_details: changeDetails
    });
  }

  /**
   * Get downstream impact assessment
   * Maps to: Downstream impact tracking
   */
  static async getDownstreamImpact(assetId: string, maxDepth?: number): Promise<any> {
    return apiClient.get(`/api/catalog/lineage/impact/downstream/${assetId}`, {
      params: { max_depth: maxDepth }
    });
  }

  /**
   * Get upstream dependencies
   * Maps to: Upstream dependency analysis
   */
  static async getUpstreamDependencies(assetId: string, maxDepth?: number): Promise<any> {
    return apiClient.get(`/api/catalog/lineage/impact/upstream/${assetId}`, {
      params: { max_depth: maxDepth }
    });
  }

  /**
   * Simulate change impact scenarios
   * Maps to: Impact simulation
   */
  static async simulateChangeImpact(scenarioConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/lineage/impact/simulate', scenarioConfig);
  }

  /**
   * Get critical path analysis
   * Maps to: Critical path identification
   */
  static async getCriticalPathAnalysis(assetId: string): Promise<any> {
    return apiClient.get(`/api/catalog/lineage/impact/critical-path/${assetId}`);
  }

  /**
   * Generate impact assessment reports
   * Maps to: Impact reporting
   */
  static async generateImpactReport(assessmentId: string, format?: string): Promise<Blob | any> {
    return apiClient.get(`/api/catalog/lineage/impact/reports/${assessmentId}`, {
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'json'
    });
  }
}

/**
 * ==============================================
 * LINEAGE METRICS & ANALYTICS
 * ==============================================
 */

export class LineageMetricsAPI {
  /**
   * Get comprehensive lineage metrics
   * Maps to: LineageMetrics model and analytics
   */
  static async getLineageMetrics(scope?: string, timeframe?: string): Promise<LineageMetrics> {
    return apiClient.get('/api/catalog/lineage/metrics', {
      params: { scope, timeframe }
    });
  }

  /**
   * Get lineage coverage analysis
   * Maps to: Coverage analysis features
   */
  static async getLineageCoverage(systemId?: string): Promise<any> {
    return apiClient.get('/api/catalog/lineage/metrics/coverage', {
      params: { system_id: systemId }
    });
  }

  /**
   * Get lineage quality metrics
   * Maps to: Quality metrics for lineage
   */
  static async getLineageQualityMetrics(assetIds?: string[]): Promise<any> {
    return apiClient.post('/api/catalog/lineage/metrics/quality', { asset_ids: assetIds });
  }

  /**
   * Analyze lineage complexity
   * Maps to: Complexity analysis
   */
  static async analyzeLineageComplexity(assetId: string): Promise<any> {
    return apiClient.get(`/api/catalog/lineage/metrics/complexity/${assetId}`);
  }

  /**
   * Get lineage freshness metrics
   * Maps to: Freshness tracking
   */
  static async getLineageFreshness(assetId?: string): Promise<any> {
    return apiClient.get('/api/catalog/lineage/metrics/freshness', {
      params: { asset_id: assetId }
    });
  }

  /**
   * Compare lineage across time periods
   * Maps to: Temporal lineage comparison
   */
  static async compareLineageOverTime(assetId: string, timeframes: string[]): Promise<LineageComparisonResult> {
    return apiClient.post(`/api/catalog/lineage/metrics/compare/${assetId}`, { timeframes });
  }
}

/**
 * ==============================================
 * LINEAGE VISUALIZATION & REPORTING
 * ==============================================
 */

export class LineageVisualizationAPI {
  /**
   * Generate interactive lineage visualization
   * Maps to: Advanced visualization engine
   */
  static async generateInteractiveVisualization(assetId: string, vizConfig?: any): Promise<any> {
    return apiClient.post(`/api/catalog/lineage/visualization/interactive/${assetId}`, vizConfig);
  }

  /**
   * Create custom lineage diagrams
   * Maps to: Custom diagram generation
   */
  static async createCustomDiagram(diagramConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/lineage/visualization/custom', diagramConfig);
  }

  /**
   * Export lineage visualization
   * Maps to: Visualization export
   */
  static async exportVisualization(vizId: string, format: string, options?: any): Promise<Blob> {
    return apiClient.get(`/api/catalog/lineage/visualization/export/${vizId}`, {
      params: { format, ...options },
      responseType: 'blob'
    });
  }

  /**
   * Get visualization templates
   * Maps to: Pre-built visualization templates
   */
  static async getVisualizationTemplates(category?: string): Promise<any[]> {
    return apiClient.get('/api/catalog/lineage/visualization/templates', {
      params: { category }
    });
  }

  /**
   * Share lineage visualizations
   * Maps to: Visualization sharing
   */
  static async shareVisualization(vizId: string, shareConfig: any): Promise<any> {
    return apiClient.post(`/api/catalog/lineage/visualization/share/${vizId}`, shareConfig);
  }
}

/**
 * ==============================================
 * COMPREHENSIVE LINEAGE API
 * ==============================================
 */

export class LineageAPI {
  // Combine all lineage APIs
  static readonly AdvancedLineage = AdvancedLineageAPI;
  static readonly LineageManagement = LineageManagementAPI;
  static readonly LineageDiscovery = LineageDiscoveryAPI;
  static readonly LineageGovernance = LineageGovernanceAPI;
  static readonly ImpactAnalysis = ImpactAnalysisAPI;
  static readonly LineageMetrics = LineageMetricsAPI;
  static readonly LineageVisualization = LineageVisualizationAPI;

  /**
   * Get comprehensive lineage overview for asset
   * Maps to: Complete lineage system overview
   */
  static async getLineageOverview(assetId: string, options?: {
    include_metrics?: boolean;
    include_impact_analysis?: boolean;
    include_governance?: boolean;
    include_quality?: boolean;
  }): Promise<any> {
    return apiClient.get(`/api/catalog/lineage/overview/${assetId}`, { params: options });
  }

  /**
   * Perform full lineage system health check
   * Maps to: Lineage system health monitoring
   */
  static async performLineageHealthCheck(): Promise<any> {
    return apiClient.get('/api/catalog/lineage/health-check');
  }

  /**
   * Export comprehensive lineage data
   * Maps to: Complete lineage data export
   */
  static async exportComprehensiveLineage(assetIds: string[], format: string, options?: any): Promise<Blob> {
    return apiClient.post('/api/catalog/lineage/export/comprehensive', {
      asset_ids: assetIds,
      format,
      ...options
    }, { responseType: 'blob' });
  }

  /**
   * Refresh lineage cache and recalculate
   * Maps to: Lineage cache management
   */
  static async refreshLineageCache(assetIds?: string[]): Promise<any> {
    return apiClient.post('/api/catalog/lineage/cache/refresh', { asset_ids: assetIds });
  }

  /**
   * Get lineage system statistics
   * Maps to: System-wide lineage statistics
   */
  static async getLineageSystemStats(): Promise<any> {
    return apiClient.get('/api/catalog/lineage/system/stats');
  }
}

// Default export with all lineage APIs
export default LineageAPI;