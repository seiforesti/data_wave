/**
 * Activity Page - Next.js App Router
 * ==================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Activity, Loader2 } from 'lucide-react';

import { ActivityTrackingHub } from '@/components/racine-main-manager/components/activity-tracker/ActivityTrackingHub';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent } from '@/components/ui/card';

const ActivityLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100/50 dark:from-emerald-950/50 dark:to-teal-900/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto border-4 border-emerald-500/30 border-t-emerald-500 rounded-full"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2 justify-center">
          <Activity className="w-5 h-5" />
          Loading Activity Tracker
        </h2>
        <p className="text-emerald-600 dark:text-emerald-400">
          Initializing activity monitoring...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function ActivityPage() {
  return (
    <RouteGuard 
      requiredPermissions={['activity.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access Activity Tracking.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<ActivityLoading />}>
        <ActivityTrackingHub />
      </Suspense>
    </RouteGuard>
  );
}