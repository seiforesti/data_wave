import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Scan Logic - Data Governance Platform',
  description: 'Advanced scan orchestration and logic management with AI-powered optimization',
  keywords: 'scan logic, data scanning, orchestration, AI optimization, scan management'
};

interface ScanLogicLayoutProps {
  children: React.ReactNode;
}

export default function ScanLogicLayout({ children }: ScanLogicLayoutProps) {
  return (
    <div className="scan-logic-layout">
      {children}
    </div>
  );
}