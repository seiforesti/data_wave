/**
 * Scan Rule Sets Page - Next.js App Router
 * ========================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';

import { ScanRuleSetsSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators/ScanRuleSetsSPAOrchestrator';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ScanRuleSetsLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto border-4 border-orange-500/30 border-t-orange-500 rounded-full"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2 justify-center">
          <Shield className="w-5 h-5" />
          Loading Scan Rule Sets
        </h2>
        <p className="text-orange-600 dark:text-orange-400">
          Initializing scan rule management interface...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function ScanRuleSetsPage() {
  return (
    <RouteGuard 
      requiredPermissions={['scan_rules.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access Scan Rule Sets.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<ScanRuleSetsLoading />}>
        <ScanRuleSetsSPAOrchestrator 
          mode="full-spa"
          racineContext={{
            currentView: 'scan-rule-sets',
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