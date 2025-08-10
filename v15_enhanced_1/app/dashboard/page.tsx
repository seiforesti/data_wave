/**
 * Dashboard Page - Next.js App Router
 * ===================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Loader2 } from 'lucide-react';

import { IntelligentDashboardOrchestrator } from '@/components/racine-main-manager/components/intelligent-dashboard/IntelligentDashboardOrchestrator';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent } from '@/components/ui/card';

const DashboardLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100/50 dark:from-blue-950/50 dark:to-purple-900/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2 justify-center">
          <BarChart3 className="w-5 h-5" />
          Loading Dashboard
        </h2>
        <p className="text-blue-600 dark:text-blue-400">
          Initializing intelligent dashboard...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function DashboardPage() {
  return (
    <RouteGuard 
      requiredPermissions={['dashboard.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access the Dashboard.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<DashboardLoading />}>
        <IntelligentDashboardOrchestrator />
      </Suspense>
    </RouteGuard>
  );
}
