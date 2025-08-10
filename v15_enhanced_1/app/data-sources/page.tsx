/**
 * Data Sources Page - Next.js App Router
 * =====================================
 * 
 * This page serves as the entry point for the Data Sources SPA within the
 * Racine Main Manager system. It uses the DataSourcesSPAOrchestrator to
 * orchestrate the existing data sources SPA with racine enhancements.
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Database, Loader2 } from 'lucide-react';

// Racine Components
import { DataSourcesSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators/DataSourcesSPAOrchestrator';
import { RouteGuard } from '@/components/racine-main-manager/components/routing/RouteGuards';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Loading Component
const DataSourcesLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto"
      >
        <div className="w-full h-full border-4 border-blue-500/30 border-t-blue-500 rounded-full" />
      </motion.div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2 justify-center">
          <Database className="w-5 h-5" />
          Loading Data Sources
        </h2>
        <p className="text-blue-600 dark:text-blue-400">
          Initializing data source management interface...
        </p>
      </div>
    </motion.div>
  </div>
);

// Error Boundary Component
const DataSourcesError = ({ error }: { error: Error }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center">
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Sources Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-600 dark:text-red-400 mb-4">
          Failed to load data sources interface: {error.message}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </CardContent>
    </Card>
  </div>
);

// Main Data Sources Page Component
export default function DataSourcesPage() {
  return (
    <RouteGuard 
      requiredPermissions={['data_sources.read']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>You don't have permission to access Data Sources.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense fallback={<DataSourcesLoading />}>
        <DataSourcesSPAOrchestrator 
          mode="full-spa"
          racineContext={{
            currentView: 'data-sources',
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