/**
 * 🛡️ RBAC SYSTEM SPA PAGE
 * ========================
 * 
 * Next.js App Router page for the RBAC System SPA
 * Integrates with the RBACSystemSPAOrchestrator to provide
 * comprehensive role-based access control and security management.
 */

import React from 'react';
import { Metadata } from 'next';
import { RBACSystemSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'RBAC System | Enterprise Data Governance Platform',
  description: 'Manage role-based access control, user permissions, and security policies for enterprise data governance.',
  keywords: 'RBAC, access control, permissions, security, roles, authentication, authorization',
  openGraph: {
    title: 'RBAC System Management',
    description: 'Role-based access control and security management',
    type: 'website'
  }
};

// ============================================================================
// MAIN RBAC SYSTEM PAGE
// ============================================================================

export default function RBACSystemPage() {
  return (
    <RBACSystemSPAOrchestrator 
      mode="full-spa"
      enableRoleManagement={true}
      enablePermissionMatrix={true}
      enableUserManagement={true}
      enableGroupManagement={true}
      enablePolicyBuilder={true}
      enableAccessReviews={true}
      enableAuditLogging={true}
      enableSecurityAnalytics={true}
      enableMFAManagement={true}
      enableAPIKeyManagement={true}
      enableNotifications={true}
      showSecurityScore={true}
      showAccessPatterns={true}
      showViolationHistory={true}
      showQuickActions={true}
      showRecommendations={true}
      adminOnly={true}
    />
  );
}