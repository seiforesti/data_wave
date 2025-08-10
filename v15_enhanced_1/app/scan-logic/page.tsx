/**
 * Scan Logic Page - Next.js App Router
 * ====================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Radar, Loader2 } from 'lucide-react';

import { ScanLogicSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators/ScanLogicSPAOrchestrator';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ScanLogicLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/50 dark:to-cyan-900/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-cyan-900 dark:text-cyan-100 flex items-center gap-2 justify-center">
          <Radar className="w-5 h-5" />
          Loading Scan Logic
        </h2>
        <p className="text-cyan-600 dark:text-cyan-400">
          Initializing scan orchestration interface...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function ScanLogicPage() {
  return (
    <RouteGuard 
      requiredPermissions={['scan_logic.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access Scan Logic.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<ScanLogicLoading />}>
        <ScanLogicSPAOrchestrator 
          mode="full-spa"
          racineContext={{
            currentView: 'scan-logic',
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