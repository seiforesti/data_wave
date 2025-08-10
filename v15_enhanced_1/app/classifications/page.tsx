/**
 * Classifications Page - Next.js App Router
 * =========================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Tag, Loader2 } from 'lucide-react';

import { ClassificationsSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators/ClassificationsSPAOrchestrator';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ClassificationsLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto border-4 border-purple-500/30 border-t-purple-500 rounded-full"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2 justify-center">
          <Tag className="w-5 h-5" />
          Loading Classifications
        </h2>
        <p className="text-purple-600 dark:text-purple-400">
          Initializing data classification interface...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function ClassificationsPage() {
  return (
    <RouteGuard 
      requiredPermissions={['classifications.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access Classifications.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<ClassificationsLoading />}>
        <ClassificationsSPAOrchestrator 
          mode="full-spa"
          racineContext={{
            currentView: 'classifications',
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