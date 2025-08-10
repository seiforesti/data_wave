/**
 * AI Assistant Page - Next.js App Router
 * ======================================
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Bot, Loader2 } from 'lucide-react';

import { AIAssistantInterface } from '@/components/racine-main-manager/components/ai-assistant/AIAssistantInterface';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';
import { Card, CardContent } from '@/components/ui/card';

const AIAssistantLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100/50 dark:from-violet-950/50 dark:to-purple-900/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto border-4 border-violet-500/30 border-t-violet-500 rounded-full"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-violet-900 dark:text-violet-100 flex items-center gap-2 justify-center">
          <Bot className="w-5 h-5" />
          Loading AI Assistant
        </h2>
        <p className="text-violet-600 dark:text-violet-400">
          Initializing AI interface...
        </p>
      </div>
    </motion.div>
  </div>
);

export default function AIAssistantPage() {
  return (
    <RouteGuard 
      requiredPermissions={['ai.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access the AI Assistant.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<AIAssistantLoading />}>
        <AIAssistantInterface />
      </Suspense>
    </RouteGuard>
  );
}