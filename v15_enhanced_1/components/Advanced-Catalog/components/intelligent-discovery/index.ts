// ============================================================================
// INTELLIGENT DISCOVERY COMPONENTS INDEX - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Centralized export for all Intelligent Discovery components
// ============================================================================

// Core Discovery Components
export { default as AIDiscoveryEngine } from './AIDiscoveryEngine';
export { default as SemanticSchemaAnalyzer } from './SemanticSchemaAnalyzer';

// Component Props Types (for external use)
export type { AIDiscoveryEngineProps } from './AIDiscoveryEngine';
export type { SemanticSchemaAnalyzerProps } from './SemanticSchemaAnalyzer';

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
  SchemaPattern
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
} as const;

/**
 * Component names for dynamic imports
 */
export const INTELLIGENT_DISCOVERY_COMPONENT_NAMES = {
  AI_DISCOVERY_ENGINE: 'AIDiscoveryEngine',
  SEMANTIC_SCHEMA_ANALYZER: 'SemanticSchemaAnalyzer',
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