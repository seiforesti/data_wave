/**
 * 📊 DATA SOURCES SPA PAGE
 * ========================
 * 
 * Next.js App Router page for the Data Sources SPA
 * Integrates with the DataSourcesSPAOrchestrator to provide
 * full data source management capabilities within the Racine Main Manager.
 */

import React from 'react';
import { Metadata } from 'next';
import { DataSourcesSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Data Sources | Enterprise Data Governance Platform',
  description: 'Manage and monitor all data source connections with advanced configuration and real-time status monitoring.',
  keywords: 'data sources, connections, database, enterprise, governance, monitoring',
  openGraph: {
    title: 'Data Sources Management',
    description: 'Comprehensive data source management and monitoring',
    type: 'website'
  }
};

// ============================================================================
// MAIN DATA SOURCES PAGE
// ============================================================================

export default function DataSourcesPage() {
  return (
    <DataSourcesSPAOrchestrator 
      mode="full-spa"
      enableRealTimeSync={true}
      enablePerformanceMonitoring={true}
      enableAdvancedFiltering={true}
      enableBulkOperations={true}
      enableExportCapabilities={true}
      showQuickActions={true}
      showStatusIndicators={true}
      showConnectionHealth={true}
      showDataQualityMetrics={true}
      enableNotifications={true}
    />
  );
}