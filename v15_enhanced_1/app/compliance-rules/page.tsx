/**
 * Compliance Rules Page - Next.js App Router
 * ==========================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';

import { ComplianceRuleSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators/ComplianceRuleSPAOrchestrator';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ComplianceRulesLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto border-4 border-red-500/30 border-t-red-500 rounded-full"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 flex items-center gap-2 justify-center">
          <Shield className="w-5 h-5" />
          Loading Compliance Rules
        </h2>
        <p className="text-red-600 dark:text-red-400">
          Initializing compliance management interface...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function ComplianceRulesPage() {
  return (
    <RouteGuard 
      requiredPermissions={['compliance.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access Compliance Rules.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<ComplianceRulesLoading />}>
        <ComplianceRuleSPAOrchestrator 
          mode="full-spa"
          racineContext={{
            currentView: 'compliance-rules',
            workspaceId: null,
            userRole: 'user',
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