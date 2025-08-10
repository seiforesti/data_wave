/**
 * Pipelines Page - Next.js App Router
 * ===================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Loader2 } from 'lucide-react';

import { PipelineDesigner } from '@/components/racine-main-manager/components/pipeline-manager/PipelineDesigner';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent } from '@/components/ui/card';

const PipelinesLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100/50 dark:from-purple-950/50 dark:to-pink-900/30 flex items-center justify-center">
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
          <GitBranch className="w-5 h-5" />
          Loading Pipelines
        </h2>
        <p className="text-purple-600 dark:text-purple-400">
          Initializing pipeline designer...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function PipelinesPage() {
  return (
    <RouteGuard 
      requiredPermissions={['pipelines.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access Pipelines.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<PipelinesLoading />}>
        <PipelineDesigner />
      </Suspense>
    </RouteGuard>
  );
}