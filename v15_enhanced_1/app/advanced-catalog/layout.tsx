import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Advanced Catalog - Data Governance Platform',
  description: 'Intelligent data catalog with AI-powered discovery, lineage tracking, and metadata management',
  keywords: 'data catalog, metadata management, data lineage, data discovery, AI catalog'
};

interface AdvancedCatalogLayoutProps {
  children: React.ReactNode;
}

export default function AdvancedCatalogLayout({ children }: AdvancedCatalogLayoutProps) {
  return (
    <div className="advanced-catalog-layout">
      {children}
    </div>
  );
}