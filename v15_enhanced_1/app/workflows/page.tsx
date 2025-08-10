/**
 * Workflows Page - Next.js App Router
 * ===================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Workflow, Loader2 } from 'lucide-react';

import { JobWorkflowBuilder } from '@/components/racine-main-manager/components/job-workflow-space/JobWorkflowBuilder';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent } from '@/components/ui/card';

const WorkflowsLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100/50 dark:from-orange-950/50 dark:to-red-900/30 flex items-center justify-center">
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
          <Workflow className="w-5 h-5" />
          Loading Workflows
        </h2>
        <p className="text-orange-600 dark:text-orange-400">
          Initializing workflow builder...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function WorkflowsPage() {
  return (
    <RouteGuard 
      requiredPermissions={['workflows.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access Workflows.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<WorkflowsLoading />}>
        <JobWorkflowBuilder />
      </Suspense>
    </RouteGuard>
  );
}