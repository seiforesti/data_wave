/**
 * Data Sources Layout - Next.js App Router
 * ========================================
 * 
 * Layout component for all data sources related routes.
 * Provides consistent layout and metadata for the data sources SPA.
 */

import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Data Sources - Data Governance Platform',
  description: 'Manage and monitor data sources across your organization with advanced governance capabilities',
  keywords: 'data sources, database connections, data governance, monitoring, analytics'
};

interface DataSourcesLayoutProps {
  children: React.ReactNode;
}

export default function DataSourcesLayout({ children }: DataSourcesLayoutProps) {
  return (
    <div className="data-sources-layout">
      {children}
    </div>
  );
}