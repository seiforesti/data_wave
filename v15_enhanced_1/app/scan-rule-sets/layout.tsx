import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Scan Rule Sets - Data Governance Platform',
  description: 'Manage and configure advanced scan rule sets for comprehensive data governance',
  keywords: 'scan rules, data scanning, governance rules, compliance scanning'
};

interface ScanRuleSetsLayoutProps {
  children: React.ReactNode;
}

export default function ScanRuleSetsLayout({ children }: ScanRuleSetsLayoutProps) {
  return (
    <div className="scan-rule-sets-layout">
      {children}
    </div>
  );
}