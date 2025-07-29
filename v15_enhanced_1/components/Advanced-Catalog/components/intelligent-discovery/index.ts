// ============================================================================
// INTELLIGENT DISCOVERY COMPONENTS INDEX - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Centralized export for all Intelligent Discovery components
// ============================================================================

// Core Discovery Components
export { default as AIDiscoveryEngine } from './AIDiscoveryEngine';
export { default as SemanticSchemaAnalyzer } from './SemanticSchemaAnalyzer';
export { default as AutoClassificationEngine } from './AutoClassificationEngine';
export { default as MetadataEnrichmentEngine } from './MetadataEnrichmentEngine';

// Component Props Types (for external use)
export type { AIDiscoveryEngineProps } from './AIDiscoveryEngine';
export type { SemanticSchemaAnalyzerProps } from './SemanticSchemaAnalyzer';
export type { AutoClassificationEngineProps } from './AutoClassificationEngine';
export type { MetadataEnrichmentEngineProps } from './MetadataEnrichmentEngine';

// Re-export component types for convenience
export type {
  DiscoveryJob,
  DiscoveryJobConfig,
  DiscoverySource,
  DiscoveryMetrics,
  SchemaAnalysis,
  SchemaElement,
  SemanticMapping,
  DataRelationship,
  SchemaPattern,
  ClassificationResult,
  ClassificationRule,
  MetadataEnrichment,
  EnrichmentSuggestion
} from '../../types';

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

/**
 * Registry of all Intelligent Discovery components
 */
export const IntelligentDiscoveryComponents = {
  AIDiscoveryEngine,
  SemanticSchemaAnalyzer,
  AutoClassificationEngine,
  MetadataEnrichmentEngine,
} as const;

/**
 * Component names for dynamic imports
 */
export const INTELLIGENT_DISCOVERY_COMPONENT_NAMES = {
  AI_DISCOVERY_ENGINE: 'AIDiscoveryEngine',
  SEMANTIC_SCHEMA_ANALYZER: 'SemanticSchemaAnalyzer',
  AUTO_CLASSIFICATION_ENGINE: 'AutoClassificationEngine',
  METADATA_ENRICHMENT_ENGINE: 'MetadataEnrichmentEngine',
} as const;

export type IntelligentDiscoveryComponentName = keyof typeof INTELLIGENT_DISCOVERY_COMPONENT_NAMES;

/**
 * Get component by name
 */
export function getIntelligentDiscoveryComponent(name: IntelligentDiscoveryComponentName) {
  return IntelligentDiscoveryComponents[INTELLIGENT_DISCOVERY_COMPONENT_NAMES[name] as keyof typeof IntelligentDiscoveryComponents];
}

// Default export
export default IntelligentDiscoveryComponents;