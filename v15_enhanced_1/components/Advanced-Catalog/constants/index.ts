// ============================================================================
// ADVANCED CATALOG CONSTANTS INDEX - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Centralized export point for all catalog constants
// ============================================================================

// Export all constants from individual files
export * from './catalog-constants';
export * from './catalog-endpoints';
export * from './catalog-schemas';

// Re-export specific constant groups for convenience
export {
  CATALOG_CONFIG,
  ASSET_CONSTANTS,
  QUALITY_CONSTANTS,
  LINEAGE_CONSTANTS,
  SEARCH_CONSTANTS,
  ANALYTICS_CONSTANTS,
  DISCOVERY_CONSTANTS,
  UI_CONSTANTS,
  NOTIFICATION_CONSTANTS,
  ERROR_CONSTANTS,
  ALL_CONSTANTS
} from './catalog-constants';

export {
  API_CONFIG,
  API_BASE,
  ENTERPRISE_CATALOG_ENDPOINTS,
  DISCOVERY_ENDPOINTS,
  SEARCH_ENDPOINTS,
  QUALITY_ENDPOINTS,
  PROFILING_ENDPOINTS,
  LINEAGE_ENDPOINTS,
  ANALYTICS_ENDPOINTS,
  ENTERPRISE_ANALYTICS_ENDPOINTS,
  DATA_DISCOVERY_ENDPOINTS,
  AI_ENDPOINTS,
  SHARED_ENDPOINTS,
  ALL_ENDPOINTS,
  buildUrl,
  buildPaginatedUrl,
  isValidEndpoint
} from './catalog-endpoints';

export {
  ASSET_SCHEMAS,
  SUPPORTING_SCHEMAS,
  VALIDATION_RULES,
  SCHEMA_TEMPLATES,
  SCHEMA_CATEGORIES,
  DEFAULT_CONFIGS
} from './catalog-schemas';

// Default export for convenience
import ALL_CONSTANTS from './catalog-constants';
import { ALL_ENDPOINTS } from './catalog-endpoints';
import { ASSET_SCHEMAS, SUPPORTING_SCHEMAS } from './catalog-schemas';

export default {
  ...ALL_CONSTANTS,
  ENDPOINTS: ALL_ENDPOINTS,
  SCHEMAS: {
    ...ASSET_SCHEMAS,
    ...SUPPORTING_SCHEMAS
  }
};