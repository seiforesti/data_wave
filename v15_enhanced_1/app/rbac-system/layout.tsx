import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'RBAC System - Data Governance Platform',
  description: 'Role-based access control system for enterprise data governance with advanced user management',
  keywords: 'RBAC, access control, user management, roles, permissions, security'
};

interface RBACSystemLayoutProps {
  children: React.ReactNode;
}

export default function RBACSystemLayout({ children }: RBACSystemLayoutProps) {
  return (
    <div className="rbac-system-layout">
      {children}
    </div>
  );
}