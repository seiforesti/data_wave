"use client";

/**
 * RacineMainManagerSPA - Master Data Governance Orchestrator
 * ==========================================================
 * 
 * The ultimate orchestrator and master controller for the entire advanced data governance system.
 * Provides a unified, intelligent, and modern workspace that surpasses Databricks, Microsoft Purview, 
 * and Azure in intelligence, flexibility, and enterprise power.
 * 
 * Core Features:
 * - Master orchestration of all 7 data governance groups
 * - Real-time cross-group coordination and analytics
 * - AI-powered intelligent automation and recommendations
 * - Enterprise-grade collaboration and workspace management
 * - Advanced job workflow and pipeline orchestration
 * - Comprehensive activity tracking and compliance monitoring
 * - Unified dashboard with predictive insights
 * - Multi-user real-time collaboration
 * 
 * Architecture:
 * - Single-pane-of-glass interface for all governance activities
 * - Cross-group intelligence with AI-driven coordination
 * - Real-time collaboration with multi-user workspace management
 * - Enterprise scalability with unlimited growth potential
 * - Contextual intelligence with proactive automation
 * - Unified experience across all group SPAs
 * 
 * Backend Integration:
 * - Primary Services: racine_orchestration_service.py, enterprise_integration_service.py
 * - Cross-Group Services: All 7 group services with unified coordination
 * - Real-time: WebSocket integration for live updates and collaboration
 * - AI Integration: advanced_ai_service.py for intelligent automation
 */

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';

// UI Components
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Core Layout Components
import AppNavbar from './components/navigation/AppNavbar';
import AppSideBar from './components/navigation/AppSideBar';
import LayoutContent from './components/layout/LayoutContent';

// Feature Components (Lazy Loaded)
import { lazy } from 'react';

const GlobalWorkspaceManager = lazy(() => import('./components/workspace-management/GlobalWorkspaceManager'));
const JobWorkflowSpace = lazy(() => import('./components/job-workflow/JobWorkflowSpace'));
const PipelineManager = lazy(() => import('./components/pipeline-management/PipelineManager'));
const IntegratedAIAssistant = lazy(() => import('./components/ai-assistant/IntegratedAIAssistant'));
const HistoricActivitiesTracker = lazy(() => import('./components/activity-tracking/HistoricActivitiesTracker'));
const IntelligentDashboard = lazy(() => import('./components/intelligent-dashboard/IntelligentDashboard'));
const MasterCollaborationSystem = lazy(() => import('./components/collaboration/MasterCollaborationSystem'));
const UserSettingsCenter = lazy(() => import('./components/user-management/UserSettingsCenter'));

// Hooks and Services
import { useRacineOrchestration } from './hooks/useRacineOrchestration';
import { useWorkspaceManagement } from './hooks/useWorkspaceManagement';
import { useRealTimeUpdates } from './hooks/useRealTimeUpdates';

// Types
import {
  RacineGroupType,
  RacineSystemStatus,
  SystemState,
  RacineWorkspace
} from './types/racine-core.types';

// Utils
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface RacineRoute {
  id: string;
  path: string;
  component: React.ComponentType<any>;
  label: string;
  icon?: React.ComponentType<any>;
  group: RacineGroupType;
  permissions: string[];
  preload?: boolean;
}

interface RacineFeature {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  enabled: boolean;
  group: RacineGroupType;
  dependencies: string[];
}

interface SystemConfiguration {
  features: Record<string, boolean>;
  layout: {
    sidebar_collapsed: boolean;
    theme: 'light' | 'dark' | 'auto';
    layout_mode: 'single' | 'split' | 'multi';
  };
  performance: {
    enable_real_time: boolean;
    cache_duration: number;
    prefetch_enabled: boolean;
  };
  collaboration: {
    enable_real_time_collaboration: boolean;
    max_concurrent_users: number;
    session_timeout: number;
  };
}

// ============================================================================
// CONFIGURATION AND CONSTANTS
// ============================================================================

const DEFAULT_SYSTEM_CONFIG: SystemConfiguration = {
  features: {
    real_time_updates: true,
    ai_assistant: true,
    advanced_analytics: true,
    collaboration: true,
    workflow_orchestration: true,
    pipeline_management: true,
    activity_tracking: true,
  },
  layout: {
    sidebar_collapsed: false,
    theme: 'auto',
    layout_mode: 'single',
  },
  performance: {
    enable_real_time: true,
    cache_duration: 300000, // 5 minutes
    prefetch_enabled: true,
  },
  collaboration: {
    enable_real_time_collaboration: true,
    max_concurrent_users: 100,
    session_timeout: 1800000, // 30 minutes
  },
};

const RACINE_FEATURES: RacineFeature[] = [
  {
    id: 'workspace-management',
    name: 'Global Workspace Management',
    description: 'Multi-environment workspace orchestration with cross-group resource coordination',
    component: GlobalWorkspaceManager,
    enabled: true,
    group: RacineGroupType.DATA_SOURCES,
    dependencies: [],
  },
  {
    id: 'job-workflow',
    name: 'Job Workflow Space',
    description: 'Databricks-level workflow orchestration with cross-group coordination',
    component: JobWorkflowSpace,
    enabled: true,
    group: RacineGroupType.SCAN_LOGIC,
    dependencies: ['workspace-management'],
  },
  {
    id: 'pipeline-management',
    name: 'Pipeline Manager',
    description: 'Advanced pipeline orchestration with intelligent optimization',
    component: PipelineManager,
    enabled: true,
    group: RacineGroupType.SCAN_LOGIC,
    dependencies: ['workspace-management'],
  },
  {
    id: 'ai-assistant',
    name: 'Integrated AI Assistant',
    description: 'Contextual AI assistant with cross-group knowledge integration',
    component: IntegratedAIAssistant,
    enabled: true,
    group: RacineGroupType.ADVANCED_CATALOG,
    dependencies: [],
  },
  {
    id: 'activity-tracking',
    name: 'Historic Activities Tracker',
    description: 'Real-time activity streaming with cross-group correlation',
    component: HistoricActivitiesTracker,
    enabled: true,
    group: RacineGroupType.COMPLIANCE_RULES,
    dependencies: [],
  },
  {
    id: 'intelligent-dashboard',
    name: 'Intelligent Dashboard',
    description: 'AI-powered dashboard with cross-group analytics',
    component: IntelligentDashboard,
    enabled: true,
    group: RacineGroupType.ADVANCED_CATALOG,
    dependencies: ['activity-tracking'],
  },
  {
    id: 'collaboration',
    name: 'Master Collaboration System',
    description: 'Real-time multi-user collaboration with cross-group team management',
    component: MasterCollaborationSystem,
    enabled: true,
    group: RacineGroupType.RBAC,
    dependencies: ['workspace-management'],
  },
  {
    id: 'user-management',
    name: 'User Settings & Profile Management',
    description: 'Unified profile management with cross-group access control',
    component: UserSettingsCenter,
    enabled: true,
    group: RacineGroupType.RBAC,
    dependencies: [],
  },
];

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// ============================================================================
// ERROR BOUNDARY COMPONENTS
// ============================================================================

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <div className="mb-4">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-600 text-xl">⚠</span>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-6">
            The Racine Main Manager encountered an unexpected error. 
            Please try refreshing the page or contact support if the problem persists.
          </p>
          <div className="space-y-3">
            <button
              onClick={resetErrorBoundary}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Reload Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-auto">
                {error?.message}
                {error?.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Racine Main Manager...</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RacineMainManagerSPA() {
  const router = useRouter();
  const pathname = usePathname();

  // State Management
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration>(DEFAULT_SYSTEM_CONFIG);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Custom Hooks
  const {
    systemHealth,
    systemStatus,
    isHealthy,
    isLoading: isSystemLoading,
    error: systemError,
    connectionStatus,
  } = useRacineOrchestration({
    enableRealTime: systemConfig.performance.enable_real_time,
  });

  const {
    currentWorkspace,
    workspaces,
    isLoading: isWorkspacesLoading,
  } = useWorkspaceManagement();

  const {
    isConnected: isRealTimeConnected,
    connectionStatus: realTimeConnectionStatus,
  } = useRealTimeUpdates();

  // ========================================================================
  // FEATURE MANAGEMENT
  // ========================================================================

  const enabledFeatures = useMemo(() => {
    return RACINE_FEATURES.filter(feature => 
      feature.enabled && systemConfig.features[feature.id.replace('-', '_')] !== false
    );
  }, [systemConfig.features]);

  const getFeatureComponent = useCallback((featureId: string) => {
    const feature = enabledFeatures.find(f => f.id === featureId);
    return feature?.component;
  }, [enabledFeatures]);

  // ========================================================================
  // SYSTEM INITIALIZATION
  // ========================================================================

  const initializeSystem = useCallback(async () => {
    try {
      // Initialize system configuration
      // This would typically load from user preferences or system defaults
      setSystemConfig(prev => ({
        ...prev,
        // Load saved preferences
      }));

      // Pre-load critical features
      const criticalFeatures = enabledFeatures.filter(f => f.dependencies.length === 0);
      await Promise.all(
        criticalFeatures.map(async (feature) => {
          // Preload component if needed
          if (systemConfig.performance.prefetch_enabled) {
            // Component is already imported via lazy loading
          }
        })
      );

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Racine system:', error);
    }
  }, [enabledFeatures, systemConfig.performance.prefetch_enabled]);

  // ========================================================================
  // ROUTE MANAGEMENT
  // ========================================================================

  const handleFeatureNavigation = useCallback((featureId: string) => {
    setActiveFeature(featureId);
    
    // Update URL if needed
    const feature = enabledFeatures.find(f => f.id === featureId);
    if (feature) {
      // router.push(`/racine/${featureId}`);
    }
  }, [enabledFeatures]);

  // ========================================================================
  // CONFIGURATION MANAGEMENT
  // ========================================================================

  const updateSystemConfig = useCallback((updates: Partial<SystemConfiguration>) => {
    setSystemConfig(prev => ({
      ...prev,
      ...updates,
      layout: { ...prev.layout, ...updates.layout },
      performance: { ...prev.performance, ...updates.performance },
      collaboration: { ...prev.collaboration, ...updates.collaboration },
    }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
    updateSystemConfig({
      layout: { ...systemConfig.layout, sidebar_collapsed: !isSidebarCollapsed }
    });
  }, [isSidebarCollapsed, systemConfig.layout, updateSystemConfig]);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Initialize system on mount
  useEffect(() => {
    initializeSystem();
  }, [initializeSystem]);

  // Handle route changes
  useEffect(() => {
    const pathSegments = pathname.split('/');
    const featureId = pathSegments[pathSegments.length - 1];
    
    if (featureId && enabledFeatures.some(f => f.id === featureId)) {
      setActiveFeature(featureId);
    } else {
      // Default to dashboard
      setActiveFeature('intelligent-dashboard');
    }
  }, [pathname, enabledFeatures]);

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderActiveFeature = () => {
    if (!activeFeature) {
      return <LoadingFallback />;
    }

    const FeatureComponent = getFeatureComponent(activeFeature);
    
    if (!FeatureComponent) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Feature Not Available</h2>
            <p className="text-muted-foreground">
              The requested feature "{activeFeature}" is not available or not enabled.
            </p>
          </div>
        </div>
      );
    }

    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => setActiveFeature('intelligent-dashboard')}
      >
        <Suspense fallback={<LoadingFallback />}>
          <FeatureComponent
            systemConfig={systemConfig}
            systemHealth={systemHealth}
            currentWorkspace={currentWorkspace}
            onNavigate={handleFeatureNavigation}
            onConfigUpdate={updateSystemConfig}
          />
        </Suspense>
      </ErrorBoundary>
    );
  };

  // ========================================================================
  // SYSTEM STATUS INDICATORS
  // ========================================================================

  const renderSystemStatus = () => {
    if (isSystemLoading) {
      return <div className="h-1 bg-muted animate-pulse" />;
    }

    if (systemError) {
      return <div className="h-1 bg-red-500" />;
    }

    if (!isHealthy) {
      return <div className="h-1 bg-yellow-500" />;
    }

    return <div className="h-1 bg-green-500" />;
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  if (!isInitialized) {
    return <LoadingFallback />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme={systemConfig.layout.theme}
        enableSystem
        disableTransitionOnChange
      >
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <div className="min-h-screen bg-background text-foreground">
            {/* System Status Bar */}
            {renderSystemStatus()}

            {/* Main Layout */}
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar */}
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-muted/50 border-r border-border flex-shrink-0"
                  >
                    <AppSideBar
                      enabledFeatures={enabledFeatures}
                      activeFeature={activeFeature}
                      onFeatureSelect={handleFeatureNavigation}
                      systemHealth={systemHealth}
                      currentWorkspace={currentWorkspace}
                      isCollapsed={false}
                      onToggleCollapse={toggleSidebar}
                    />
                  </motion.aside>
                )}
              </AnimatePresence>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <AppNavbar
                  systemHealth={systemHealth}
                  currentWorkspace={currentWorkspace}
                  activeFeature={activeFeature}
                  onFeatureSelect={handleFeatureNavigation}
                  isSidebarCollapsed={isSidebarCollapsed}
                  onToggleSidebar={toggleSidebar}
                  isRealTimeConnected={isRealTimeConnected}
                />

                {/* Content Area */}
                <main className="flex-1 overflow-hidden">
                  <LayoutContent
                    layoutMode={systemConfig.layout.layout_mode}
                    enableAnimations={true}
                    onLayoutChange={(mode) => 
                      updateSystemConfig({ 
                        layout: { ...systemConfig.layout, layout_mode: mode } 
                      })
                    }
                  >
                    {renderActiveFeature()}
                  </LayoutContent>
                </main>
              </div>
            </div>

            {/* Global AI Assistant (if enabled) */}
            {systemConfig.features.ai_assistant && (
              <Suspense fallback={null}>
                <IntegratedAIAssistant
                  isGlobalMode={true}
                  systemContext={{
                    activeFeature,
                    systemHealth,
                    currentWorkspace,
                    userContext: {}, // TODO: Get from auth context
                  }}
                />
              </Suspense>
            )}

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              expand={true}
              richColors
              closeButton
              duration={5000}
            />

            {/* Development Tools */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools 
                initialIsOpen={false} 
                position="bottom-right"
              />
            )}
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}