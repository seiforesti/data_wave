/**
 * Settings Page - Next.js App Router
 * ==================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Settings, Loader2 } from 'lucide-react';

import { UserProfileManager } from '@/components/racine-main-manager/components/user-management/UserProfileManager';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent } from '@/components/ui/card';

const SettingsLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100/50 dark:from-gray-950/50 dark:to-slate-900/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto border-4 border-gray-500/30 border-t-gray-500 rounded-full"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 justify-center">
          <Settings className="w-5 h-5" />
          Loading Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Initializing user management...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function SettingsPage() {
  return (
    <RouteGuard 
      requiredPermissions={['profile.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access Settings.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<SettingsLoading />}>
        <UserProfileManager />
      </Suspense>
    </RouteGuard>
  );
}