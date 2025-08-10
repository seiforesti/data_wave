/**
 * Collaboration Page - Next.js App Router
 * =======================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Loader2 } from 'lucide-react';

import { MasterCollaborationHub } from '@/components/racine-main-manager/components/collaboration/MasterCollaborationHub';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent } from '@/components/ui/card';

const CollaborationLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100/50 dark:from-pink-950/50 dark:to-rose-900/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto border-4 border-pink-500/30 border-t-pink-500 rounded-full"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-pink-900 dark:text-pink-100 flex items-center gap-2 justify-center">
          <MessageCircle className="w-5 h-5" />
          Loading Collaboration Hub
        </h2>
        <p className="text-pink-600 dark:text-pink-400">
          Initializing collaboration interface...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function CollaborationPage() {
  return (
    <RouteGuard 
      requiredPermissions={['collaboration.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access Collaboration Hub.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<CollaborationLoading />}>
        <MasterCollaborationHub />
      </Suspense>
    </RouteGuard>
  );
}