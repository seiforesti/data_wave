/**
 * Enterprise Catalog APIs - Complete Backend Mapping
 * =================================================
 * 
 * Maps 100% to:
 * - enterprise_catalog_service.py (56KB, 1448 lines)
 * - enterprise_catalog_routes.py (52KB, 1452 lines, 50+ endpoints)
 * 
 * Provides comprehensive catalog management capabilities:
 * - Intelligent data asset management with AI features
 * - Enterprise-grade lineage tracking (column-level)
 * - AI-powered quality assessment and monitoring
 * - Business glossary and semantic relationships
 * - Advanced usage analytics and metrics
 * - Comprehensive data profiling and analysis
 */

import { apiClient } from '../../../shared/utils/api-client';
import {
  IntelligentDataAsset,
  EnterpriseDataLineage,
  DataQualityAssessment,
  BusinessGlossaryTerm,
  BusinessGlossaryAssociation,
  AssetUsageMetrics,
  DataProfilingResult,
  CatalogItem,
  CatalogTag,
  CatalogItemTag,
  DataLineage,
  CatalogUsageLog,
  CatalogQualityRule
} from '../types/catalog-core.types';

// ========================= INTELLIGENT DATA ASSET MANAGEMENT =========================

export class IntelligentDataAssetAPI {
  // Core CRUD Operations
  static async createDataAsset(assetData: Partial<IntelligentDataAsset>): Promise<IntelligentDataAsset> {
    return apiClient.post('/api/catalog/assets', assetData);
  }

  static async getDataAsset(assetId: string): Promise<IntelligentDataAsset> {
    return apiClient.get(`/api/catalog/assets/${assetId}`);
  }

  static async updateDataAsset(assetId: string, updates: Partial<IntelligentDataAsset>): Promise<IntelligentDataAsset> {
    return apiClient.put(`/api/catalog/assets/${assetId}`, updates);
  }

  static async deleteDataAsset(assetId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/assets/${assetId}`);
  }

  // Advanced Asset Discovery
  static async discoverDataAssets(discoveryConfig: any): Promise<IntelligentDataAsset[]> {
    return apiClient.post('/api/catalog/assets/discover', discoveryConfig);
  }

  static async getAssetRecommendations(assetId: string, context?: any): Promise<IntelligentDataAsset[]> {
    return apiClient.get(`/api/catalog/assets/${assetId}/recommendations`, { params: context });
  }

  static async getRelatedAssets(assetId: string, relationshipType?: string): Promise<IntelligentDataAsset[]> {
    return apiClient.get(`/api/catalog/assets/${assetId}/related`, { 
      params: { relationship_type: relationshipType } 
    });
  }

  // AI-Powered Asset Analysis
  static async analyzeAssetWithAI(assetId: string, analysisType: string): Promise<any> {
    return apiClient.post(`/api/catalog/assets/${assetId}/ai-analysis`, { analysis_type: analysisType });
  }

  static async getAssetInsights(assetId: string): Promise<any> {
    return apiClient.get(`/api/catalog/assets/${assetId}/insights`);
  }

  static async generateAssetSummary(assetId: string): Promise<string> {
    return apiClient.post(`/api/catalog/assets/${assetId}/summary`);
  }

  // Asset Search and Discovery
  static async searchAssets(query: string, filters?: any, options?: any): Promise<{
    assets: IntelligentDataAsset[];
    total: number;
    facets: any;
  }> {
    return apiClient.post('/api/catalog/assets/search', { query, filters, ...options });
  }

  static async semanticSearchAssets(query: string, similarity_threshold?: number): Promise<IntelligentDataAsset[]> {
    return apiClient.post('/api/catalog/assets/semantic-search', { query, similarity_threshold });
  }

  // Asset Validation and Quality
  static async validateAsset(assetId: string, validationRules?: string[]): Promise<any> {
    return apiClient.post(`/api/catalog/assets/${assetId}/validate`, { validation_rules: validationRules });
  }

  static async getAssetHealth(assetId: string): Promise<any> {
    return apiClient.get(`/api/catalog/assets/${assetId}/health`);
  }

  // Asset Lifecycle Management
  static async publishAsset(assetId: string, publishConfig?: any): Promise<IntelligentDataAsset> {
    return apiClient.post(`/api/catalog/assets/${assetId}/publish`, publishConfig);
  }

  static async archiveAsset(assetId: string, archiveReason?: string): Promise<void> {
    return apiClient.post(`/api/catalog/assets/${assetId}/archive`, { reason: archiveReason });
  }

  static async restoreAsset(assetId: string): Promise<IntelligentDataAsset> {
    return apiClient.post(`/api/catalog/assets/${assetId}/restore`);
  }

  // Asset Collaboration
  static async shareAsset(assetId: string, shareConfig: any): Promise<any> {
    return apiClient.post(`/api/catalog/assets/${assetId}/share`, shareConfig);
  }

  static async getAssetSharing(assetId: string): Promise<any> {
    return apiClient.get(`/api/catalog/assets/${assetId}/sharing`);
  }

  // Asset Versioning
  static async createAssetVersion(assetId: string, versionData: any): Promise<IntelligentDataAsset> {
    return apiClient.post(`/api/catalog/assets/${assetId}/versions`, versionData);
  }

  static async getAssetVersions(assetId: string): Promise<IntelligentDataAsset[]> {
    return apiClient.get(`/api/catalog/assets/${assetId}/versions`);
  }

  static async getAssetVersion(assetId: string, versionId: string): Promise<IntelligentDataAsset> {
    return apiClient.get(`/api/catalog/assets/${assetId}/versions/${versionId}`);
  }

  static async compareAssetVersions(assetId: string, version1: string, version2: string): Promise<any> {
    return apiClient.get(`/api/catalog/assets/${assetId}/versions/compare`, {
      params: { version1, version2 }
    });
  }
}

// ========================= ENTERPRISE DATA LINEAGE MANAGEMENT =========================

export class EnterpriseDataLineageAPI {
  // Lineage Discovery and Creation
  static async discoverLineage(assetId: string, discoveryConfig?: any): Promise<EnterpriseDataLineage> {
    return apiClient.post(`/api/catalog/lineage/discover/${assetId}`, discoveryConfig);
  }

  static async createLineageMapping(lineageData: Partial<EnterpriseDataLineage>): Promise<EnterpriseDataLineage> {
    return apiClient.post('/api/catalog/lineage/mappings', lineageData);
  }

  static async updateLineageMapping(lineageId: string, updates: Partial<EnterpriseDataLineage>): Promise<EnterpriseDataLineage> {
    return apiClient.put(`/api/catalog/lineage/mappings/${lineageId}`, updates);
  }

  // Lineage Retrieval and Analysis
  static async getAssetLineage(assetId: string, direction: 'upstream' | 'downstream' | 'both' = 'both', depth?: number): Promise<EnterpriseDataLineage> {
    return apiClient.get(`/api/catalog/lineage/assets/${assetId}`, {
      params: { direction, depth }
    });
  }

  static async getColumnLevelLineage(assetId: string, columnName: string): Promise<EnterpriseDataLineage> {
    return apiClient.get(`/api/catalog/lineage/assets/${assetId}/columns/${columnName}`);
  }

  static async getFieldLineage(assetId: string, fieldPath: string): Promise<EnterpriseDataLineage> {
    return apiClient.get(`/api/catalog/lineage/assets/${assetId}/fields/${fieldPath}`);
  }

  // Impact Analysis
  static async performImpactAnalysis(assetId: string, changeType: string, changeScope?: any): Promise<any> {
    return apiClient.post(`/api/catalog/lineage/impact-analysis/${assetId}`, {
      change_type: changeType,
      change_scope: changeScope
    });
  }

  static async getDownstreamImpact(assetId: string, depth?: number): Promise<any> {
    return apiClient.get(`/api/catalog/lineage/downstream-impact/${assetId}`, {
      params: { depth }
    });
  }

  static async getUpstreamDependencies(assetId: string, depth?: number): Promise<any> {
    return apiClient.get(`/api/catalog/lineage/upstream-dependencies/${assetId}`, {
      params: { depth }
    });
  }

  // Lineage Validation and Quality
  static async validateLineage(lineageId: string): Promise<any> {
    return apiClient.post(`/api/catalog/lineage/validate/${lineageId}`);
  }

  static async getLineageQuality(assetId: string): Promise<any> {
    return apiClient.get(`/api/catalog/lineage/quality/${assetId}`);
  }

  // Lineage Visualization
  static async getLineageGraph(assetId: string, format: 'json' | 'graphml' | 'dot' = 'json'): Promise<any> {
    return apiClient.get(`/api/catalog/lineage/graph/${assetId}`, {
      params: { format }
    });
  }

  static async exportLineage(assetId: string, exportFormat: string): Promise<any> {
    return apiClient.get(`/api/catalog/lineage/export/${assetId}`, {
      params: { format: exportFormat }
    });
  }

  // Lineage Search and Discovery
  static async searchLineage(query: string, filters?: any): Promise<EnterpriseDataLineage[]> {
    return apiClient.post('/api/catalog/lineage/search', { query, filters });
  }

  static async getLineagePatterns(patternType?: string): Promise<any> {
    return apiClient.get('/api/catalog/lineage/patterns', {
      params: { pattern_type: patternType }
    });
  }
}

// ========================= DATA QUALITY ASSESSMENT MANAGEMENT =========================

export class DataQualityAssessmentAPI {
  // Quality Assessment Operations
  static async createQualityAssessment(assessmentData: Partial<DataQualityAssessment>): Promise<DataQualityAssessment> {
    return apiClient.post('/api/catalog/quality/assessments', assessmentData);
  }

  static async getQualityAssessment(assessmentId: string): Promise<DataQualityAssessment> {
    return apiClient.get(`/api/catalog/quality/assessments/${assessmentId}`);
  }

  static async updateQualityAssessment(assessmentId: string, updates: Partial<DataQualityAssessment>): Promise<DataQualityAssessment> {
    return apiClient.put(`/api/catalog/quality/assessments/${assessmentId}`, updates);
  }

  static async deleteQualityAssessment(assessmentId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/quality/assessments/${assessmentId}`);
  }

  // Asset Quality Analysis
  static async assessAssetQuality(assetId: string, assessmentConfig?: any): Promise<DataQualityAssessment> {
    return apiClient.post(`/api/catalog/quality/assess/${assetId}`, assessmentConfig);
  }

  static async getAssetQualityScore(assetId: string): Promise<any> {
    return apiClient.get(`/api/catalog/quality/score/${assetId}`);
  }

  static async getAssetQualityTrends(assetId: string, timeRange?: string): Promise<any> {
    return apiClient.get(`/api/catalog/quality/trends/${assetId}`, {
      params: { time_range: timeRange }
    });
  }

  // Quality Rules Management
  static async createQualityRule(ruleData: Partial<CatalogQualityRule>): Promise<CatalogQualityRule> {
    return apiClient.post('/api/catalog/quality/rules', ruleData);
  }

  static async getQualityRules(assetId?: string): Promise<CatalogQualityRule[]> {
    return apiClient.get('/api/catalog/quality/rules', {
      params: { asset_id: assetId }
    });
  }

  static async updateQualityRule(ruleId: string, updates: Partial<CatalogQualityRule>): Promise<CatalogQualityRule> {
    return apiClient.put(`/api/catalog/quality/rules/${ruleId}`, updates);
  }

  static async deleteQualityRule(ruleId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/quality/rules/${ruleId}`);
  }

  static async executeQualityRule(ruleId: string, assetId?: string): Promise<any> {
    return apiClient.post(`/api/catalog/quality/rules/${ruleId}/execute`, {
      asset_id: assetId
    });
  }

  // Quality Monitoring
  static async startQualityMonitoring(assetId: string, monitoringConfig: any): Promise<any> {
    return apiClient.post(`/api/catalog/quality/monitoring/start/${assetId}`, monitoringConfig);
  }

  static async stopQualityMonitoring(assetId: string): Promise<void> {
    return apiClient.post(`/api/catalog/quality/monitoring/stop/${assetId}`);
  }

  static async getQualityAlerts(assetId?: string, severity?: string): Promise<any[]> {
    return apiClient.get('/api/catalog/quality/alerts', {
      params: { asset_id: assetId, severity }
    });
  }

  // Quality Reporting
  static async generateQualityReport(reportConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/quality/reports/generate', reportConfig);
  }

  static async getQualityDashboard(filters?: any): Promise<any> {
    return apiClient.get('/api/catalog/quality/dashboard', { params: filters });
  }
}

// ========================= BUSINESS GLOSSARY MANAGEMENT =========================

export class BusinessGlossaryAPI {
  // Glossary Term Management
  static async createGlossaryTerm(termData: Partial<BusinessGlossaryTerm>): Promise<BusinessGlossaryTerm> {
    return apiClient.post('/api/catalog/glossary/terms', termData);
  }

  static async getGlossaryTerm(termId: string): Promise<BusinessGlossaryTerm> {
    return apiClient.get(`/api/catalog/glossary/terms/${termId}`);
  }

  static async updateGlossaryTerm(termId: string, updates: Partial<BusinessGlossaryTerm>): Promise<BusinessGlossaryTerm> {
    return apiClient.put(`/api/catalog/glossary/terms/${termId}`, updates);
  }

  static async deleteGlossaryTerm(termId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/glossary/terms/${termId}`);
  }

  static async getAllGlossaryTerms(filters?: any): Promise<BusinessGlossaryTerm[]> {
    return apiClient.get('/api/catalog/glossary/terms', { params: filters });
  }

  // Term Associations
  static async createTermAssociation(associationData: Partial<BusinessGlossaryAssociation>): Promise<BusinessGlossaryAssociation> {
    return apiClient.post('/api/catalog/glossary/associations', associationData);
  }

  static async getTermAssociations(termId: string): Promise<BusinessGlossaryAssociation[]> {
    return apiClient.get(`/api/catalog/glossary/terms/${termId}/associations`);
  }

  static async getAssetTerms(assetId: string): Promise<BusinessGlossaryTerm[]> {
    return apiClient.get(`/api/catalog/glossary/assets/${assetId}/terms`);
  }

  static async associateTermWithAsset(termId: string, assetId: string, associationData?: any): Promise<BusinessGlossaryAssociation> {
    return apiClient.post(`/api/catalog/glossary/terms/${termId}/assets/${assetId}`, associationData);
  }

  static async removeTermFromAsset(termId: string, assetId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/glossary/terms/${termId}/assets/${assetId}`);
  }

  // Glossary Search and Discovery
  static async searchGlossaryTerms(query: string, filters?: any): Promise<BusinessGlossaryTerm[]> {
    return apiClient.post('/api/catalog/glossary/search', { query, filters });
  }

  static async suggestTerms(context: string, maxSuggestions?: number): Promise<BusinessGlossaryTerm[]> {
    return apiClient.post('/api/catalog/glossary/suggest', { 
      context, 
      max_suggestions: maxSuggestions 
    });
  }

  // Glossary Analytics
  static async getGlossaryUsageAnalytics(termId?: string): Promise<any> {
    return apiClient.get('/api/catalog/glossary/analytics/usage', {
      params: { term_id: termId }
    });
  }

  static async getGlossaryCompleteness(): Promise<any> {
    return apiClient.get('/api/catalog/glossary/analytics/completeness');
  }
}

// ========================= ASSET USAGE METRICS MANAGEMENT =========================

export class AssetUsageMetricsAPI {
  // Usage Tracking
  static async trackAssetUsage(assetId: string, usageData: any): Promise<AssetUsageMetrics> {
    return apiClient.post(`/api/catalog/usage/track/${assetId}`, usageData);
  }

  static async getAssetUsageMetrics(assetId: string, timeRange?: string): Promise<AssetUsageMetrics> {
    return apiClient.get(`/api/catalog/usage/metrics/${assetId}`, {
      params: { time_range: timeRange }
    });
  }

  static async getUsageTrends(assetId: string, timeRange?: string, granularity?: string): Promise<any> {
    return apiClient.get(`/api/catalog/usage/trends/${assetId}`, {
      params: { time_range: timeRange, granularity }
    });
  }

  // Usage Analytics
  static async getPopularAssets(limit?: number, timeRange?: string): Promise<IntelligentDataAsset[]> {
    return apiClient.get('/api/catalog/usage/popular', {
      params: { limit, time_range: timeRange }
    });
  }

  static async getUnusedAssets(thresholdDays?: number): Promise<IntelligentDataAsset[]> {
    return apiClient.get('/api/catalog/usage/unused', {
      params: { threshold_days: thresholdDays }
    });
  }

  static async getUserUsagePatterns(userId?: string, timeRange?: string): Promise<any> {
    return apiClient.get('/api/catalog/usage/patterns/user', {
      params: { user_id: userId, time_range: timeRange }
    });
  }

  static async getUsageByDepartment(department?: string, timeRange?: string): Promise<any> {
    return apiClient.get('/api/catalog/usage/department', {
      params: { department, time_range: timeRange }
    });
  }

  // Usage Reporting
  static async generateUsageReport(reportConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/usage/reports/generate', reportConfig);
  }

  static async getUsageDashboard(filters?: any): Promise<any> {
    return apiClient.get('/api/catalog/usage/dashboard', { params: filters });
  }
}

// ========================= DATA PROFILING RESULTS MANAGEMENT =========================

export class DataProfilingResultAPI {
  // Profiling Operations
  static async profileDataAsset(assetId: string, profilingConfig?: any): Promise<DataProfilingResult> {
    return apiClient.post(`/api/catalog/profiling/profile/${assetId}`, profilingConfig);
  }

  static async getProfilingResult(resultId: string): Promise<DataProfilingResult> {
    return apiClient.get(`/api/catalog/profiling/results/${resultId}`);
  }

  static async getAssetProfilingResults(assetId: string, latest?: boolean): Promise<DataProfilingResult[]> {
    return apiClient.get(`/api/catalog/profiling/assets/${assetId}/results`, {
      params: { latest }
    });
  }

  static async deleteProfilingResult(resultId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/profiling/results/${resultId}`);
  }

  // Profiling Analysis
  static async compareProfilingResults(result1Id: string, result2Id: string): Promise<any> {
    return apiClient.get('/api/catalog/profiling/compare', {
      params: { result1: result1Id, result2: result2Id }
    });
  }

  static async getProfilingTrends(assetId: string, timeRange?: string): Promise<any> {
    return apiClient.get(`/api/catalog/profiling/trends/${assetId}`, {
      params: { time_range: timeRange }
    });
  }

  static async getProfilingSummary(assetId: string): Promise<any> {
    return apiClient.get(`/api/catalog/profiling/summary/${assetId}`);
  }

  // Automated Profiling
  static async scheduleProfilingJob(assetId: string, schedule: any): Promise<any> {
    return apiClient.post(`/api/catalog/profiling/schedule/${assetId}`, schedule);
  }

  static async getProfilingJobs(assetId?: string): Promise<any[]> {
    return apiClient.get('/api/catalog/profiling/jobs', {
      params: { asset_id: assetId }
    });
  }

  static async cancelProfilingJob(jobId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/profiling/jobs/${jobId}`);
  }
}

// ========================= BASIC CATALOG OPERATIONS =========================

export class BasicCatalogAPI {
  // Catalog Items
  static async createCatalogItem(itemData: Partial<CatalogItem>): Promise<CatalogItem> {
    return apiClient.post('/api/catalog/items', itemData);
  }

  static async getCatalogItem(itemId: string): Promise<CatalogItem> {
    return apiClient.get(`/api/catalog/items/${itemId}`);
  }

  static async updateCatalogItem(itemId: string, updates: Partial<CatalogItem>): Promise<CatalogItem> {
    return apiClient.put(`/api/catalog/items/${itemId}`, updates);
  }

  static async deleteCatalogItem(itemId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/items/${itemId}`);
  }

  static async getAllCatalogItems(filters?: any): Promise<CatalogItem[]> {
    return apiClient.get('/api/catalog/items', { params: filters });
  }

  // Catalog Tags
  static async createCatalogTag(tagData: Partial<CatalogTag>): Promise<CatalogTag> {
    return apiClient.post('/api/catalog/tags', tagData);
  }

  static async getCatalogTags(): Promise<CatalogTag[]> {
    return apiClient.get('/api/catalog/tags');
  }

  static async updateCatalogTag(tagId: string, updates: Partial<CatalogTag>): Promise<CatalogTag> {
    return apiClient.put(`/api/catalog/tags/${tagId}`, updates);
  }

  static async deleteCatalogTag(tagId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/tags/${tagId}`);
  }

  // Tag Associations
  static async tagCatalogItem(itemId: string, tagId: string, tagData?: any): Promise<CatalogItemTag> {
    return apiClient.post(`/api/catalog/items/${itemId}/tags/${tagId}`, tagData);
  }

  static async untagCatalogItem(itemId: string, tagId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/items/${itemId}/tags/${tagId}`);
  }

  static async getItemTags(itemId: string): Promise<CatalogTag[]> {
    return apiClient.get(`/api/catalog/items/${itemId}/tags`);
  }

  // Usage Logging
  static async logCatalogUsage(usageData: Partial<CatalogUsageLog>): Promise<CatalogUsageLog> {
    return apiClient.post('/api/catalog/usage/log', usageData);
  }

  static async getCatalogUsageLogs(itemId?: string, userId?: string, timeRange?: string): Promise<CatalogUsageLog[]> {
    return apiClient.get('/api/catalog/usage/logs', {
      params: { item_id: itemId, user_id: userId, time_range: timeRange }
    });
  }
}

// ========================= COMPREHENSIVE CATALOG API =========================

export class EnterpriseCatalogAPI {
  static readonly IntelligentAssets = IntelligentDataAssetAPI;
  static readonly DataLineage = EnterpriseDataLineageAPI;
  static readonly QualityAssessment = DataQualityAssessmentAPI;
  static readonly BusinessGlossary = BusinessGlossaryAPI;
  static readonly UsageMetrics = AssetUsageMetricsAPI;
  static readonly DataProfiling = DataProfilingResultAPI;
  static readonly BasicCatalog = BasicCatalogAPI;

  // Comprehensive Search
  static async unifiedSearch(query: string, searchConfig?: any): Promise<any> {
    return apiClient.post('/api/catalog/search/unified', { query, ...searchConfig });
  }

  // Cross-functional Operations
  static async getCatalogOverview(): Promise<any> {
    return apiClient.get('/api/catalog/overview');
  }

  static async getCatalogHealth(): Promise<any> {
    return apiClient.get('/api/catalog/health');
  }

  static async getCatalogMetrics(timeRange?: string): Promise<any> {
    return apiClient.get('/api/catalog/metrics', {
      params: { time_range: timeRange }
    });
  }

  // Batch Operations
  static async batchCreateAssets(assetsData: Partial<IntelligentDataAsset>[]): Promise<IntelligentDataAsset[]> {
    return apiClient.post('/api/catalog/assets/batch', { assets: assetsData });
  }

  static async batchUpdateAssets(updates: Array<{ id: string; data: Partial<IntelligentDataAsset> }>): Promise<IntelligentDataAsset[]> {
    return apiClient.put('/api/catalog/assets/batch', { updates });
  }

  static async batchDeleteAssets(assetIds: string[]): Promise<void> {
    return apiClient.delete('/api/catalog/assets/batch', { data: { asset_ids: assetIds } });
  }

  // Integration and Export
  static async exportCatalog(exportConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/export', exportConfig);
  }

  static async importCatalog(importConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/import', importConfig);
  }

  static async syncWithExternalSystem(systemId: string, syncConfig?: any): Promise<any> {
    return apiClient.post(`/api/catalog/sync/${systemId}`, syncConfig);
  }
}

export default EnterpriseCatalogAPI;