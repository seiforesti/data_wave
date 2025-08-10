import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Classifications - Data Governance Platform',
  description: 'Manage data classifications and governance policies with AI-powered classification engine',
  keywords: 'data classification, governance policies, AI classification, data tagging'
};

interface ClassificationsLayoutProps {
  children: React.ReactNode;
}

export default function ClassificationsLayout({ children }: ClassificationsLayoutProps) {
  return (
    <div className="classifications-layout">
      {children}
    </div>
  );
}