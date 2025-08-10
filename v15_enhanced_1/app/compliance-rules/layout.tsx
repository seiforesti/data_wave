import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Compliance Rules - Data Governance Platform',
  description: 'Manage compliance rules and regulatory requirements with automated monitoring and reporting',
  keywords: 'compliance rules, regulatory compliance, audit, governance, monitoring'
};

interface ComplianceRulesLayoutProps {
  children: React.ReactNode;
}

export default function ComplianceRulesLayout({ children }: ComplianceRulesLayoutProps) {
  return (
    <div className="compliance-rules-layout">
      {children}
    </div>
  );
}