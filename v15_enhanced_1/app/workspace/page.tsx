/**
 * Workspace Page - Next.js App Router
 * ===================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Loader2 } from 'lucide-react';

import { WorkspaceOrchestrator } from '@/components/racine-main-manager/components/workspace/WorkspaceOrchestrator';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent } from '@/components/ui/card';

const WorkspaceLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100/50 dark:from-green-950/50 dark:to-blue-900/30 flex items-center justify-center">
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
          <Briefcase className="w-5 h-5" />
          Loading Workspace
        </h2>
        <p className="text-green-600 dark:text-green-400">
          Initializing workspace management...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function WorkspacePage() {
  return (
    <RouteGuard 
      requiredPermissions={['workspace.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access Workspace Management.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<WorkspaceLoading />}>
        <WorkspaceOrchestrator />
      </Suspense>
    </RouteGuard>
  );
}