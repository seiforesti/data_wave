/**
 * Advanced Catalog - Main Exports
 * ===============================
 * 
 * Central export file for all Advanced Catalog components, hooks, services, and utilities.
 * This provides a clean API for importing Advanced Catalog functionality.
 */

// ========================= MAIN SPA =========================
export { default as AdvancedCatalogSPA } from './spa/AdvancedCatalogSPA';

// ========================= CORE COMPONENTS =========================

// Intelligent Discovery
export { default as AIDiscoveryEngine } from './components/intelligent-discovery/AIDiscoveryEngine';

// Catalog Intelligence  
export { default as IntelligentCatalogViewer } from './components/catalog-intelligence/IntelligentCatalogViewer';

// ========================= TYPES =========================
export * from './types/catalog-core.types';
export * from './types/search.types';
export * from './types/governance.types';

// ========================= HOOKS =========================
export * from './hooks/useCatalogAssets';

// ========================= SERVICES =========================
export * from './services/enterprise-catalog-apis';

// ========================= UTILITIES =========================
export * from './utils/catalog-utils';

// ========================= CONSTANTS =========================
export * from './constants/catalog-constants';

// ========================= TYPE DEFINITIONS =========================

/**
 * Advanced Catalog Module Interface
 * Defines the complete public API for the Advanced Catalog system
 */
export interface AdvancedCatalogModule {
  // Main SPA Component
  SPA: typeof AdvancedCatalogSPA;
  
  // Core Components
  components: {
    AIDiscoveryEngine: typeof AIDiscoveryEngine;
    IntelligentCatalogViewer: typeof IntelligentCatalogViewer;
  };
  
  // Hooks
  hooks: {
    useCatalogAssets: any;
  };
  
  // Services
  services: {
    EnterpriseCatalogAPI: any;
  };
  
  // Utilities
  utils: {
    calculateAssetHealthScore: any;
    getAssetTypeInfo: any;
    formatFileSize: any;
    formatRelativeTime: any;
    formatNumber: any;
    formatPercentage: any;
  };
}

// ========================= VERSION INFO =========================
export const ADVANCED_CATALOG_VERSION = '1.0.0';
export const ADVANCED_CATALOG_BUILD = 'production';

// ========================= FEATURE FLAGS =========================
export const ADVANCED_CATALOG_FEATURES = {
  AI_DISCOVERY: true,
  INTELLIGENT_BROWSING: true,
  SEMANTIC_SEARCH: true,
  REAL_TIME_COLLABORATION: true,
  ADVANCED_ANALYTICS: true,
  QUALITY_MANAGEMENT: true,
  DATA_LINEAGE: true,
  GOVERNANCE_POLICIES: true,
  BULK_OPERATIONS: true,
  EXPORT_IMPORT: true
} as const;