/**
 * Metadata Management APIs - Advanced Metadata System
 * ===================================================
 * 
 * Complete mapping to backend metadata services:
 * - enterprise_catalog_service.py (metadata features)
 * - intelligent_discovery_service.py (metadata enrichment)
 * - advanced_catalog_models.py (metadata models)
 * - classification_service.py (metadata classification)
 * - enterprise_integration_service.py (metadata coordination)
 * 
 * This service provides comprehensive metadata management:
 * - Automated metadata enrichment
 * - Schema discovery and management
 * - Metadata governance and validation
 * - Business glossary integration
 * - Tag and classification management
 * - Metadata lineage tracking
 * - Metadata quality assessment
 * - Cross-system metadata harmonization
 */

import { apiClient } from '../../shared/utils/api-client';
import type {
  AssetMetadata,
  MetadataSchema,
  MetadataEnrichmentRequest,
  MetadataEnrichmentResult,
  BusinessGlossaryTerm,
  MetadataTag,
  MetadataClassification,
  MetadataValidationResult,
  MetadataGovernanceRule,
  MetadataLineage,
  MetadataQualityScore,
  SchemaEvolution,
  MetadataMapping,
  MetadataHarmonization,
  MetadataExport,
  MetadataAnalytics,
  MetadataRequest,
  SchemaRequest,
  GlossaryRequest,
  TagRequest,
  ClassificationRequest,
  ValidationRequest,
  GovernanceRequest,
  HarmonizationRequest
} from '../types/metadata.types';

/**
 * ==============================================
 * METADATA ENRICHMENT ENGINE
 * ==============================================
 */

export class MetadataEnrichmentAPI {
  /**
   * Enrich metadata automatically using AI
   * Maps to: enterprise_catalog_service.enrich_metadata_automatically()
   */
  static async enrichMetadataAutomatically(request: MetadataEnrichmentRequest): Promise<MetadataEnrichmentResult> {
    return apiClient.post('/api/catalog/metadata/enrich/auto', request);
  }

  /**
   * Get enriched metadata for asset
   * Maps to: Enhanced metadata retrieval
   */
  static async getEnrichedMetadata(assetId: string): Promise<AssetMetadata> {
    return apiClient.get(`/api/catalog/metadata/enriched/${assetId}`);
  }

  /**
   * Enrich metadata using external sources
   * Maps to: External metadata source integration
   */
  static async enrichFromExternalSources(assetId: string, sources: string[]): Promise<MetadataEnrichmentResult> {
    return apiClient.post(`/api/catalog/metadata/enrich/external/${assetId}`, { sources });
  }

  /**
   * Generate business context for technical metadata
   * Maps to: Business context generation
   */
  static async generateBusinessContext(assetId: string): Promise<any> {
    return apiClient.post(`/api/catalog/metadata/enrich/business-context/${assetId}`);
  }

  /**
   * Extract metadata from data samples
   * Maps to: Sample-based metadata extraction
   */
  static async extractMetadataFromSamples(assetId: string, samples: any[]): Promise<any> {
    return apiClient.post(`/api/catalog/metadata/enrich/extract-samples/${assetId}`, { samples });
  }

  /**
   * Validate enriched metadata quality
   * Maps to: Metadata quality validation
   */
  static async validateEnrichedMetadata(assetId: string): Promise<MetadataValidationResult> {
    return apiClient.post(`/api/catalog/metadata/enrich/validate/${assetId}`);
  }

  /**
   * Schedule periodic metadata enrichment
   * Maps to: Automated enrichment scheduling
   */
  static async scheduleMetadataEnrichment(assetIds: string[], schedule: any): Promise<any> {
    return apiClient.post('/api/catalog/metadata/enrich/schedule', {
      asset_ids: assetIds,
      schedule
    });
  }

  /**
   * Get metadata enrichment suggestions
   * Maps to: Enrichment recommendations
   */
  static async getEnrichmentSuggestions(assetId: string): Promise<any[]> {
    return apiClient.get(`/api/catalog/metadata/enrich/suggestions/${assetId}`);
  }
}

/**
 * ==============================================
 * SCHEMA MANAGEMENT
 * ==============================================
 */

export class SchemaManagementAPI {
  /**
   * Create or update metadata schema
   * Maps to: Schema definition management
   */
  static async createMetadataSchema(schema: SchemaRequest): Promise<MetadataSchema> {
    return apiClient.post('/api/catalog/metadata/schemas', schema);
  }

  /**
   * Get metadata schemas
   * Maps to: Schema retrieval and filtering
   */
  static async getMetadataSchemas(filters?: any): Promise<MetadataSchema[]> {
    return apiClient.get('/api/catalog/metadata/schemas', { params: filters });
  }

  /**
   * Update metadata schema
   * Maps to: Schema modification
   */
  static async updateMetadataSchema(schemaId: string, updates: Partial<MetadataSchema>): Promise<MetadataSchema> {
    return apiClient.put(`/api/catalog/metadata/schemas/${schemaId}`, updates);
  }

  /**
   * Validate schema against metadata
   * Maps to: Schema validation
   */
  static async validateSchemaCompliance(assetId: string, schemaId: string): Promise<MetadataValidationResult> {
    return apiClient.post('/api/catalog/metadata/schemas/validate', {
      asset_id: assetId,
      schema_id: schemaId
    });
  }

  /**
   * Track schema evolution over time
   * Maps to: intelligent_discovery_service.track_schema_evolution()
   */
  static async trackSchemaEvolution(assetId: string, timeframe?: string): Promise<SchemaEvolution[]> {
    return apiClient.get(`/api/catalog/metadata/schemas/evolution/${assetId}`, {
      params: { timeframe }
    });
  }

  /**
   * Compare schemas between assets
   * Maps to: Schema comparison analysis
   */
  static async compareSchemas(schemaIds: string[]): Promise<any> {
    return apiClient.post('/api/catalog/metadata/schemas/compare', { schema_ids: schemaIds });
  }

  /**
   * Generate schema from existing metadata
   * Maps to: Schema inference from metadata
   */
  static async generateSchemaFromMetadata(assetIds: string[]): Promise<MetadataSchema> {
    return apiClient.post('/api/catalog/metadata/schemas/generate', { asset_ids: assetIds });
  }

  /**
   * Export schema definitions
   * Maps to: Schema export functionality
   */
  static async exportSchemas(schemaIds: string[], format: string): Promise<Blob> {
    return apiClient.post('/api/catalog/metadata/schemas/export', {
      schema_ids: schemaIds,
      format
    }, { responseType: 'blob' });
  }
}

/**
 * ==============================================
 * BUSINESS GLOSSARY MANAGEMENT
 * ==============================================
 */

export class BusinessGlossaryAPI {
  /**
   * Create business glossary term
   * Maps to: Business glossary management
   */
  static async createGlossaryTerm(term: GlossaryRequest): Promise<BusinessGlossaryTerm> {
    return apiClient.post('/api/catalog/metadata/glossary/terms', term);
  }

  /**
   * Get business glossary terms
   * Maps to: Glossary term retrieval
   */
  static async getGlossaryTerms(filters?: any): Promise<BusinessGlossaryTerm[]> {
    return apiClient.get('/api/catalog/metadata/glossary/terms', { params: filters });
  }

  /**
   * Update glossary term
   * Maps to: Term modification
   */
  static async updateGlossaryTerm(termId: string, updates: Partial<BusinessGlossaryTerm>): Promise<BusinessGlossaryTerm> {
    return apiClient.put(`/api/catalog/metadata/glossary/terms/${termId}`, updates);
  }

  /**
   * Associate glossary terms with assets
   * Maps to: BusinessGlossaryAssociation model
   */
  static async associateTermsWithAsset(assetId: string, termIds: string[]): Promise<any> {
    return apiClient.post(`/api/catalog/metadata/glossary/associate/${assetId}`, {
      term_ids: termIds
    });
  }

  /**
   * Search glossary terms
   * Maps to: Glossary search functionality
   */
  static async searchGlossaryTerms(query: string, filters?: any): Promise<BusinessGlossaryTerm[]> {
    return apiClient.get('/api/catalog/metadata/glossary/search', {
      params: { query, ...filters }
    });
  }

  /**
   * Get glossary term relationships
   * Maps to: Term relationship mapping
   */
  static async getTermRelationships(termId: string): Promise<any> {
    return apiClient.get(`/api/catalog/metadata/glossary/terms/${termId}/relationships`);
  }

  /**
   * Validate glossary term usage
   * Maps to: Term usage validation
   */
  static async validateTermUsage(termId: string): Promise<any> {
    return apiClient.get(`/api/catalog/metadata/glossary/terms/${termId}/validate-usage`);
  }

  /**
   * Export business glossary
   * Maps to: Glossary export functionality
   */
  static async exportGlossary(format: string, filters?: any): Promise<Blob> {
    return apiClient.get('/api/catalog/metadata/glossary/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
  }
}

/**
 * ==============================================
 * TAG & CLASSIFICATION MANAGEMENT
 * ==============================================
 */

export class TagClassificationAPI {
  /**
   * Create metadata tag
   * Maps to: Tag management system
   */
  static async createMetadataTag(tag: TagRequest): Promise<MetadataTag> {
    return apiClient.post('/api/catalog/metadata/tags', tag);
  }

  /**
   * Get metadata tags
   * Maps to: Tag retrieval and filtering
   */
  static async getMetadataTags(filters?: any): Promise<MetadataTag[]> {
    return apiClient.get('/api/catalog/metadata/tags', { params: filters });
  }

  /**
   * Apply tags to assets
   * Maps to: Asset tagging
   */
  static async applyTagsToAsset(assetId: string, tagIds: string[]): Promise<any> {
    return apiClient.post(`/api/catalog/metadata/tags/apply/${assetId}`, { tag_ids: tagIds });
  }

  /**
   * Create classification scheme
   * Maps to: enterprise_catalog_service.classify_data_intelligently()
   */
  static async createClassificationScheme(classification: ClassificationRequest): Promise<MetadataClassification> {
    return apiClient.post('/api/catalog/metadata/classifications', classification);
  }

  /**
   * Classify metadata automatically
   * Maps to: Automated classification
   */
  static async classifyMetadataAutomatically(assetId: string, classificationScheme?: string): Promise<any> {
    return apiClient.post(`/api/catalog/metadata/classify/auto/${assetId}`, {
      classification_scheme: classificationScheme
    });
  }

  /**
   * Get asset classifications
   * Maps to: Classification retrieval
   */
  static async getAssetClassifications(assetId: string): Promise<MetadataClassification[]> {
    return apiClient.get(`/api/catalog/metadata/classifications/asset/${assetId}`);
  }

  /**
   * Update asset classification
   * Maps to: Classification updates
   */
  static async updateAssetClassification(assetId: string, classificationId: string, updates: any): Promise<any> {
    return apiClient.put(`/api/catalog/metadata/classifications/${classificationId}/asset/${assetId}`, updates);
  }

  /**
   * Get classification analytics
   * Maps to: Classification usage analytics
   */
  static async getClassificationAnalytics(timeframe?: string): Promise<any> {
    return apiClient.get('/api/catalog/metadata/classifications/analytics', {
      params: { timeframe }
    });
  }
}

/**
 * ==============================================
 * METADATA GOVERNANCE
 * ==============================================
 */

export class MetadataGovernanceAPI {
  /**
   * Create metadata governance rule
   * Maps to: Metadata governance management
   */
  static async createGovernanceRule(rule: GovernanceRequest): Promise<MetadataGovernanceRule> {
    return apiClient.post('/api/catalog/metadata/governance/rules', rule);
  }

  /**
   * Get metadata governance rules
   * Maps to: Governance rule retrieval
   */
  static async getGovernanceRules(scope?: string, category?: string): Promise<MetadataGovernanceRule[]> {
    return apiClient.get('/api/catalog/metadata/governance/rules', {
      params: { scope, category }
    });
  }

  /**
   * Validate metadata against governance rules
   * Maps to: Governance compliance validation
   */
  static async validateMetadataGovernance(request: ValidationRequest): Promise<MetadataValidationResult> {
    return apiClient.post('/api/catalog/metadata/governance/validate', request);
  }

  /**
   * Get metadata governance compliance status
   * Maps to: Compliance status tracking
   */
  static async getGovernanceComplianceStatus(assetId?: string): Promise<any> {
    return apiClient.get('/api/catalog/metadata/governance/compliance', {
      params: { asset_id: assetId }
    });
  }

  /**
   * Create metadata approval workflow
   * Maps to: Approval workflow management
   */
  static async createApprovalWorkflow(workflowConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/metadata/governance/approval-workflows', workflowConfig);
  }

  /**
   * Submit metadata for approval
   * Maps to: Approval submission process
   */
  static async submitMetadataForApproval(assetId: string, approvalRequest: any): Promise<any> {
    return apiClient.post(`/api/catalog/metadata/governance/approve/${assetId}`, approvalRequest);
  }

  /**
   * Get metadata audit trail
   * Maps to: Metadata change tracking
   */
  static async getMetadataAuditTrail(assetId: string, timeframe?: string): Promise<any[]> {
    return apiClient.get(`/api/catalog/metadata/governance/audit/${assetId}`, {
      params: { timeframe }
    });
  }

  /**
   * Generate governance compliance report
   * Maps to: Governance reporting
   */
  static async generateGovernanceReport(reportConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/metadata/governance/reports', reportConfig);
  }
}

/**
 * ==============================================
 * METADATA QUALITY ASSESSMENT
 * ==============================================
 */

export class MetadataQualityAPI {
  /**
   * Assess metadata quality
   * Maps to: Metadata quality scoring
   */
  static async assessMetadataQuality(assetId: string, qualityDimensions?: string[]): Promise<MetadataQualityScore> {
    return apiClient.post(`/api/catalog/metadata/quality/assess/${assetId}`, {
      quality_dimensions: qualityDimensions
    });
  }

  /**
   * Get metadata quality metrics
   * Maps to: Quality metrics aggregation
   */
  static async getMetadataQualityMetrics(scope?: string): Promise<any> {
    return apiClient.get('/api/catalog/metadata/quality/metrics', {
      params: { scope }
    });
  }

  /**
   * Get metadata completeness analysis
   * Maps to: Completeness assessment
   */
  static async getMetadataCompleteness(assetIds?: string[]): Promise<any> {
    return apiClient.post('/api/catalog/metadata/quality/completeness', { asset_ids: assetIds });
  }

  /**
   * Identify metadata quality issues
   * Maps to: Quality issue detection
   */
  static async identifyQualityIssues(assetId: string): Promise<any[]> {
    return apiClient.get(`/api/catalog/metadata/quality/issues/${assetId}`);
  }

  /**
   * Get metadata quality recommendations
   * Maps to: Quality improvement suggestions
   */
  static async getQualityRecommendations(assetId: string): Promise<any[]> {
    return apiClient.get(`/api/catalog/metadata/quality/recommendations/${assetId}`);
  }

  /**
   * Track metadata quality trends
   * Maps to: Quality trend analysis
   */
  static async trackQualityTrends(timeframe?: string, scope?: string): Promise<any> {
    return apiClient.get('/api/catalog/metadata/quality/trends', {
      params: { timeframe, scope }
    });
  }

  /**
   * Benchmark metadata quality
   * Maps to: Quality benchmarking
   */
  static async benchmarkMetadataQuality(industry?: string, assetType?: string): Promise<any> {
    return apiClient.get('/api/catalog/metadata/quality/benchmark', {
      params: { industry, asset_type: assetType }
    });
  }
}

/**
 * ==============================================
 * METADATA LINEAGE & TRACEABILITY
 * ==============================================
 */

export class MetadataLineageAPI {
  /**
   * Track metadata lineage
   * Maps to: Metadata lineage tracking
   */
  static async trackMetadataLineage(assetId: string): Promise<MetadataLineage> {
    return apiClient.get(`/api/catalog/metadata/lineage/${assetId}`);
  }

  /**
   * Get metadata change history
   * Maps to: Metadata version history
   */
  static async getMetadataChangeHistory(assetId: string, timeframe?: string): Promise<any[]> {
    return apiClient.get(`/api/catalog/metadata/lineage/history/${assetId}`, {
      params: { timeframe }
    });
  }

  /**
   * Analyze metadata impact
   * Maps to: Metadata impact analysis
   */
  static async analyzeMetadataImpact(assetId: string, changeType: string): Promise<any> {
    return apiClient.post(`/api/catalog/metadata/lineage/impact/${assetId}`, {
      change_type: changeType
    });
  }

  /**
   * Get metadata dependencies
   * Maps to: Metadata dependency tracking
   */
  static async getMetadataDependencies(assetId: string, direction?: 'upstream' | 'downstream' | 'both'): Promise<any> {
    return apiClient.get(`/api/catalog/metadata/lineage/dependencies/${assetId}`, {
      params: { direction }
    });
  }

  /**
   * Compare metadata versions
   * Maps to: Version comparison
   */
  static async compareMetadataVersions(assetId: string, versionA: string, versionB: string): Promise<any> {
    return apiClient.get(`/api/catalog/metadata/lineage/compare/${assetId}`, {
      params: { version_a: versionA, version_b: versionB }
    });
  }
}

/**
 * ==============================================
 * CROSS-SYSTEM METADATA HARMONIZATION
 * ==============================================
 */

export class MetadataHarmonizationAPI {
  /**
   * Harmonize metadata across systems
   * Maps to: Cross-system metadata harmonization
   */
  static async harmonizeMetadata(request: HarmonizationRequest): Promise<MetadataHarmonization> {
    return apiClient.post('/api/catalog/metadata/harmonization/harmonize', request);
  }

  /**
   * Create metadata mapping between systems
   * Maps to: Metadata mapping management
   */
  static async createMetadataMapping(mappingConfig: any): Promise<MetadataMapping> {
    return apiClient.post('/api/catalog/metadata/harmonization/mappings', mappingConfig);
  }

  /**
   * Get metadata mappings
   * Maps to: Mapping retrieval
   */
  static async getMetadataMappings(sourceSystem?: string, targetSystem?: string): Promise<MetadataMapping[]> {
    return apiClient.get('/api/catalog/metadata/harmonization/mappings', {
      params: { source_system: sourceSystem, target_system: targetSystem }
    });
  }

  /**
   * Validate metadata mappings
   * Maps to: Mapping validation
   */
  static async validateMetadataMappings(mappingId: string): Promise<any> {
    return apiClient.post(`/api/catalog/metadata/harmonization/mappings/${mappingId}/validate`);
  }

  /**
   * Synchronize metadata between systems
   * Maps to: Metadata synchronization
   */
  static async synchronizeMetadata(systems: string[], options?: any): Promise<any> {
    return apiClient.post('/api/catalog/metadata/harmonization/synchronize', {
      systems,
      options
    });
  }

  /**
   * Get harmonization conflicts
   * Maps to: Conflict identification and resolution
   */
  static async getHarmonizationConflicts(): Promise<any[]> {
    return apiClient.get('/api/catalog/metadata/harmonization/conflicts');
  }

  /**
   * Resolve harmonization conflicts
   * Maps to: Conflict resolution
   */
  static async resolveHarmonizationConflicts(conflictId: string, resolution: any): Promise<any> {
    return apiClient.post(`/api/catalog/metadata/harmonization/conflicts/${conflictId}/resolve`, resolution);
  }
}

/**
 * ==============================================
 * METADATA ANALYTICS & REPORTING
 * ==============================================
 */

export class MetadataAnalyticsAPI {
  /**
   * Get comprehensive metadata analytics
   * Maps to: Metadata usage and quality analytics
   */
  static async getMetadataAnalytics(timeframe?: string, scope?: string): Promise<MetadataAnalytics> {
    return apiClient.get('/api/catalog/metadata/analytics', {
      params: { timeframe, scope }
    });
  }

  /**
   * Analyze metadata usage patterns
   * Maps to: Usage pattern analysis
   */
  static async analyzeMetadataUsage(assetIds?: string[], timeframe?: string): Promise<any> {
    return apiClient.post('/api/catalog/metadata/analytics/usage', {
      asset_ids: assetIds,
      timeframe
    });
  }

  /**
   * Get metadata coverage reports
   * Maps to: Coverage analysis
   */
  static async getMetadataCoverage(scope?: string): Promise<any> {
    return apiClient.get('/api/catalog/metadata/analytics/coverage', {
      params: { scope }
    });
  }

  /**
   * Generate metadata insights
   * Maps to: AI-powered metadata insights
   */
  static async generateMetadataInsights(analysisType?: string): Promise<any[]> {
    return apiClient.get('/api/catalog/metadata/analytics/insights', {
      params: { analysis_type: analysisType }
    });
  }

  /**
   * Get metadata ROI analysis
   * Maps to: Metadata value assessment
   */
  static async getMetadataROIAnalysis(timeframe?: string): Promise<any> {
    return apiClient.get('/api/catalog/metadata/analytics/roi', {
      params: { timeframe }
    });
  }

  /**
   * Export metadata analytics
   * Maps to: Analytics export functionality
   */
  static async exportMetadataAnalytics(exportConfig: MetadataExport): Promise<Blob> {
    return apiClient.post('/api/catalog/metadata/analytics/export', exportConfig, {
      responseType: 'blob'
    });
  }
}

/**
 * ==============================================
 * COMPREHENSIVE METADATA API
 * ==============================================
 */

export class MetadataAPI {
  // Combine all metadata APIs
  static readonly Enrichment = MetadataEnrichmentAPI;
  static readonly SchemaManagement = SchemaManagementAPI;
  static readonly BusinessGlossary = BusinessGlossaryAPI;
  static readonly TagClassification = TagClassificationAPI;
  static readonly Governance = MetadataGovernanceAPI;
  static readonly Quality = MetadataQualityAPI;
  static readonly Lineage = MetadataLineageAPI;
  static readonly Harmonization = MetadataHarmonizationAPI;
  static readonly Analytics = MetadataAnalyticsAPI;

  /**
   * Get comprehensive metadata overview for asset
   * Maps to: Complete metadata system overview
   */
  static async getMetadataOverview(assetId: string, options?: {
    include_enrichment?: boolean;
    include_quality?: boolean;
    include_lineage?: boolean;
    include_governance?: boolean;
    include_classifications?: boolean;
  }): Promise<any> {
    return apiClient.get(`/api/catalog/metadata/overview/${assetId}`, { params: options });
  }

  /**
   * Initialize metadata for new asset
   * Maps to: Metadata initialization
   */
  static async initializeAssetMetadata(assetId: string, initConfig?: any): Promise<any> {
    return apiClient.post(`/api/catalog/metadata/initialize/${assetId}`, initConfig);
  }

  /**
   * Perform metadata health check
   * Maps to: Metadata system health monitoring
   */
  static async performMetadataHealthCheck(): Promise<any> {
    return apiClient.get('/api/catalog/metadata/health-check');
  }

  /**
   * Get metadata system statistics
   * Maps to: System-wide metadata statistics
   */
  static async getMetadataSystemStats(): Promise<any> {
    return apiClient.get('/api/catalog/metadata/system/stats');
  }

  /**
   * Refresh metadata cache
   * Maps to: Metadata cache management
   */
  static async refreshMetadataCache(assetIds?: string[]): Promise<any> {
    return apiClient.post('/api/catalog/metadata/cache/refresh', { asset_ids: assetIds });
  }

  /**
   * Backup metadata configurations
   * Maps to: Metadata backup and restore
   */
  static async backupMetadataConfigurations(): Promise<any> {
    return apiClient.post('/api/catalog/metadata/backup');
  }

  /**
   * Restore metadata configurations
   * Maps to: Configuration restore
   */
  static async restoreMetadataConfigurations(backupId: string): Promise<any> {
    return apiClient.post(`/api/catalog/metadata/restore/${backupId}`);
  }
}

// Default export with all metadata APIs
export default MetadataAPI;