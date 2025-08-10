/**
 * RBAC System Page - Next.js App Router
 * =====================================
 * 
 * Admin-only access to the RBAC system management interface.
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Loader2 } from 'lucide-react';

import { RBACSystemSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators/RBACSystemSPAOrchestrator';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RBACSystemLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 justify-center">
          <Shield className="w-5 h-5" />
          Loading RBAC System
        </h2>
        <p className="text-indigo-600 dark:text-indigo-400">
          Initializing access control management interface...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function RBACSystemPage() {
  return (
    <RouteGuard 
      requiredPermissions={['rbac.admin']}
      adminOnly={true}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>You don't have administrative privileges to access the RBAC System.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<RBACSystemLoading />}>
        <RBACSystemSPAOrchestrator 
          mode="full-spa"
          racineContext={{
            currentView: 'rbac-system',
            workspaceId: null,
            userRole: 'admin',
            crossGroupIntegrations: [],
            aiInsights: [],
            collaborationSessions: []
          }}
          onCrossGroupAction={(action) => {
            console.log('Cross-group action:', action);
          }}
          layoutMode="single-pane"
        />
      </Suspense>
    </RouteGuard>
  );
}