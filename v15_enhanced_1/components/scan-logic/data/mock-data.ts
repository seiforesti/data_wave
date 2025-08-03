/**
 * DEPRECATED: Mock Data File - Enterprise Data Governance System
 * =============================================================
 * 
 * ⚠️  WARNING: This file contains mock data and is deprecated for production use.
 * 
 * All mock data has been replaced with real backend integration.
 * Please use the ProductionScanService instead:
 * 
 * @see ../services/production-scan-service.ts
 * 
 * Migration Guide:
 * ===============
 * 
 * OLD (Mock Data):
 * ```typescript
 * import { mockScanConfigs } from './mock-data'
 * ```
 * 
 * NEW (Production Service):
 * ```typescript
 * import { useScanConfigs } from '../services/production-scan-service'
 * 
 * // In your component:
 * const { data: scanConfigs, isLoading, error } = useScanConfigs(filters)
 * ```
 * 
 * Key Changes:
 * - All data is now fetched from real backend APIs
 * - RBAC integration ensures proper access control
 * - Real-time updates and error handling
 * - Production-grade performance and reliability
 * - Comprehensive audit logging
 * 
 * If you're still importing from this file, please update your imports immediately.
 */

// Temporary exports for backward compatibility during migration
// These will be removed in the next version
export const mockScanConfigs: any[] = [];
export const mockScanRuns: any[] = [];
export const mockScanSchedules: any[] = [];
export const mockDiscoveredEntities: any[] = [];
export const mockScanIssues: any[] = [];

// Log deprecation warning
console.warn(`
🚨 DEPRECATED: You are importing mock data from scan-logic/data/mock-data.ts

This file is deprecated and should not be used in production.
Please migrate to the ProductionScanService:

import { useScanConfigs, useScanRuns, useScanIssues } from '../services/production-scan-service'

For migration assistance, see: /docs/migration-guide.md
`);

// Export migration helper
export const MIGRATION_NOTICE = {
  deprecated: true,
  reason: 'Mock data replaced with production backend integration',
  migrateTo: '../services/production-scan-service.ts',
  documentationUrl: '/docs/migration-guide.md',
  removedInVersion: '2.0.0'
};
