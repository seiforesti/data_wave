/**
 * Advanced Catalog Page - Next.js App Router
 * ==========================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Database, Loader2 } from 'lucide-react';

import { AdvancedCatalogSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators/AdvancedCatalogSPAOrchestrator';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdvancedCatalogLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto border-4 border-green-500/30 border-t-green-500 rounded-full"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 flex items-center gap-2 justify-center">
          <Database className="w-5 h-5" />
          Loading Advanced Catalog
        </h2>
        <p className="text-green-600 dark:text-green-400">
          Initializing catalog management interface...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function AdvancedCatalogPage() {
  return (
    <RouteGuard 
      requiredPermissions={['catalog.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access Advanced Catalog.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<AdvancedCatalogLoading />}>
        <AdvancedCatalogSPAOrchestrator 
          mode="full-spa"
          racineContext={{
            currentView: 'advanced-catalog',
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