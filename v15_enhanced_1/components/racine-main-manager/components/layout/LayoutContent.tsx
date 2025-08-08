/**
 * LayoutContent.tsx - Layout Orchestrator Component
 * =================================================
 * 
 * Main layout orchestrator that provides comprehensive layout management
 * for the entire Racine system. This component handles dynamic layout
 * switching, workspace-aware layouts, responsive design, and deep integration
 * with all existing SPAs and backend systems.
 * 
 * Features:
 * - Dynamic layout management (single-pane, split-screen, tabbed, dashboard)
 * - Workspace-aware layout configurations
 * - Real-time layout synchronization across users
 * - Performance-optimized layout switching
 * - Integration with all 7 existing SPAs
 * - Accessibility-compliant layout management
 * - Mobile-responsive layout adaptation
 * 
 * Backend Integration:
 * - Uses workspace-management-apis.ts for workspace context
 * - Uses racine-orchestration-apis.ts for layout coordination
 * - Uses user-management-apis.ts for user preferences
 * - Integrates with all SPA orchestrators
 * 
 * Dependencies:
 * - Types: LayoutConfiguration, WorkspaceState, LayoutMode
 * - Services: workspace-management-apis, racine-orchestration-apis
 * - Hooks: useWorkspaceManagement, useLayoutManager
 * - Utils: layout-utils, responsive-utils
 */

'use client';

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  Suspense,
  ErrorBoundary as ReactErrorBoundary,
  ComponentType
} from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  Maximize2, 
  Minimize2, 
  Grid3X3, 
  Columns, 
  Layers,
  Monitor,
  Tablet,
  Smartphone,
  Settings,
  RefreshCw,
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Plus,
  Minus,
  RotateCw,
  Move,
  Copy,
  Trash2,
  Edit3,
  Search,
  Filter,
  Sort,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSub
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// Core Types
import {
  LayoutConfiguration,
  LayoutMode,
  LayoutState,
  ViewMode,
  WorkspaceState,
  WorkspaceConfiguration,
  LayoutPreferences,
  ResponsiveBreakpoints,
  LayoutTemplate,
  PaneConfiguration,
  SplitConfiguration,
  TabConfiguration,
  OverlayConfiguration,
  LayoutAnimation,
  LayoutMetrics,
  LayoutError,
  LayoutContext,
  LayoutValidation,
  UserContext,
  SystemHealth,
  PerformanceMetrics,
  CrossGroupState,
  SynchronizationStatus,
  UUID,
  ISODateString
} from '../../types/racine-core.types';

// API Types
import {
  APIResponse,
  LayoutConfigurationResponse,
  WorkspaceLayoutResponse,
  LayoutTemplateResponse,
  LayoutValidationResponse,
  LayoutSyncResponse,
  LayoutPreferencesRequest,
  LayoutConfigurationRequest
} from '../../types/api.types';

// Services
import { workspaceManagementAPI } from '../../services/workspace-management-apis';
import { racineOrchestrationAPI } from '../../services/racine-orchestration-apis';
import { userManagementAPI } from '../../services/user-management-apis';
import { crossGroupIntegrationAPI } from '../../services/cross-group-integration-apis';

// Hooks
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useLayoutManager } from '../../hooks/useLayoutManager';
import { useResponsiveDesign } from '../../hooks/useResponsiveDesign';
import { useLayoutAnimation } from '../../hooks/useLayoutAnimation';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

// Utils
import { layoutUtils } from '../../utils/layout-utils';
import { responsiveUtils } from '../../utils/responsive-utils';
import { performanceUtils } from '../../utils/performance-utils';
import { validationUtils } from '../../utils/validation-utils';
import { securityUtils } from '../../utils/security-utils';

// Constants
import {
  LAYOUT_MODES,
  VIEW_MODES,
  RESPONSIVE_BREAKPOINTS,
  LAYOUT_TEMPLATES,
  ANIMATION_PRESETS,
  PERFORMANCE_THRESHOLDS,
  DEFAULT_LAYOUT_CONFIG
} from '../../constants/layout-configs';

// Error Boundary Component
interface LayoutErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class LayoutErrorBoundary extends React.Component<
  LayoutErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: LayoutErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Layout Error Boundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

// Default Error Fallback Component
const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({
  error,
  resetError
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
    <Card className="max-w-md w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Layout Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          An error occurred while rendering the layout. This might be due to
          invalid configuration or a temporary system issue.
        </p>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription className="font-mono text-xs">
            {error.message}
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={resetError} variant="default" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Reload Page
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Loading Skeleton Component
const LayoutLoadingSkeleton: React.FC = () => (
  <div className="flex h-screen bg-background">
    <div className="w-64 border-r bg-muted/50 p-4 space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-32 col-span-2" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  </div>
);

// Performance Monitor Component
const LayoutPerformanceMonitor: React.FC<{
  isVisible: boolean;
  metrics: LayoutMetrics;
  onToggle: () => void;
}> = ({ isVisible, metrics, onToggle }) => {
  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Card className="w-80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Layout Performance</CardTitle>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Render Time</span>
              <span>{metrics.renderTime}ms</span>
            </div>
            <Progress value={(metrics.renderTime / 100) * 100} className="h-1" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Memory Usage</span>
              <span>{metrics.memoryUsage}MB</span>
            </div>
            <Progress value={(metrics.memoryUsage / 50) * 100} className="h-1" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Frame Rate</span>
              <span>{metrics.frameRate}fps</span>
            </div>
            <Progress value={(metrics.frameRate / 60) * 100} className="h-1" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Layout Toolbar Component
const LayoutToolbar: React.FC<{
  currentLayout: LayoutMode;
  layouts: LayoutTemplate[];
  onLayoutChange: (layout: LayoutMode) => void;
  onSaveLayout: () => void;
  onLoadLayout: (template: LayoutTemplate) => void;
  onResetLayout: () => void;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
}> = ({
  currentLayout,
  layouts,
  onLayoutChange,
  onSaveLayout,
  onLoadLayout,
  onResetLayout,
  isLoading,
  hasUnsavedChanges
}) => {
  return (
    <div className="flex items-center gap-2 p-2 border-b bg-background/95 backdrop-blur-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Grid3X3 className="h-4 w-4 mr-2" />
            {currentLayout}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Layout Modes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={currentLayout}
            onValueChange={(value) => onLayoutChange(value as LayoutMode)}
          >
            {LAYOUT_MODES.map((mode) => (
              <DropdownMenuRadioItem key={mode.id} value={mode.id}>
                <mode.icon className="h-4 w-4 mr-2" />
                {mode.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Layout Templates</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {layouts.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => onLoadLayout(template)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <template.icon className="h-4 w-4" />
                  <span>{template.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={onSaveLayout}
        disabled={isLoading || !hasUnsavedChanges}
      >
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onResetLayout}
        disabled={isLoading}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset
      </Button>

      {hasUnsavedChanges && (
        <Badge variant="secondary" className="text-xs">
          Unsaved Changes
        </Badge>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      )}
    </div>
  );
};

// Responsive Indicator Component
const ResponsiveIndicator: React.FC<{
  currentBreakpoint: string;
  breakpoints: ResponsiveBreakpoints;
}> = ({ currentBreakpoint, breakpoints }) => {
  const getIcon = (breakpoint: string) => {
    switch (breakpoint) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
        return Monitor;
      default:
        return Monitor;
    }
  };

  const Icon = getIcon(currentBreakpoint);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted">
            <Icon className="h-4 w-4" />
            <span className="text-xs font-medium">{currentBreakpoint}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="space-y-1">
            <p className="font-medium">Current Breakpoint</p>
            <p className="text-xs text-muted-foreground">
              {breakpoints[currentBreakpoint]?.label || 'Unknown'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Layout Preview Component
const LayoutPreview: React.FC<{
  layout: LayoutConfiguration;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}> = ({ layout, isActive, onClick, className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        cursor-pointer border rounded-lg p-3 transition-all
        ${isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{layout.name}</h4>
          {isActive && (
            <Badge variant="default" className="text-xs">
              Active
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {layout.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{layout.mode}</span>
          <Separator orientation="vertical" className="h-3" />
          <span>{layout.panes.length} panes</span>
        </div>
      </div>
    </motion.div>
  );
};

// Main Component Props
interface LayoutContentProps {
  children?: React.ReactNode;
  className?: string;
  initialLayout?: LayoutMode;
  workspaceId?: UUID;
  userId?: UUID;
  onLayoutChange?: (layout: LayoutConfiguration) => void;
  onError?: (error: LayoutError) => void;
  enablePerformanceMonitoring?: boolean;
  enableResponsiveDesign?: boolean;
  enableAnimations?: boolean;
}

// Main LayoutContent Component
export const LayoutContent: React.FC<LayoutContentProps> = ({
  children,
  className = '',
  initialLayout = 'single-pane',
  workspaceId,
  userId,
  onLayoutChange,
  onError,
  enablePerformanceMonitoring = true,
  enableResponsiveDesign = true,
  enableAnimations = true
}) => {
  // State Management
  const [layoutState, setLayoutState] = useState<LayoutState>({
    currentLayout: initialLayout,
    configuration: DEFAULT_LAYOUT_CONFIG,
    isLoading: false,
    hasUnsavedChanges: false,
    error: null,
    lastSaved: null,
    isLocked: false,
    isFullscreen: false,
    showPreview: false,
    syncStatus: 'synchronized'
  });

  const [performanceMonitorVisible, setPerformanceMonitorVisible] = useState(false);
  const [layoutPreferencesOpen, setLayoutPreferencesOpen] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<LayoutTemplate[]>([]);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutMetricsRef = useRef<LayoutMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 60,
    layoutChanges: 0,
    errorCount: 0,
    lastUpdate: new Date().toISOString()
  });

  // Custom Hooks
  const {
    workspaceState,
    currentWorkspace,
    switchWorkspace,
    getWorkspaceLayouts,
    saveWorkspaceLayout,
    isLoading: workspaceLoading,
    error: workspaceError
  } = useWorkspaceManagement(workspaceId);

  const {
    orchestrationState,
    monitorHealth,
    optimizePerformance,
    isLoading: orchestrationLoading,
    error: orchestrationError
  } = useRacineOrchestration(userId, {
    isInitialized: true,
    currentView: 'layout',
    activeWorkspaceId: workspaceId || '',
    layoutMode: layoutState.currentLayout,
    sidebarCollapsed: false,
    loading: layoutState.isLoading,
    error: layoutState.error,
    systemHealth: {
      status: 'healthy',
      services: {},
      lastCheck: new Date().toISOString(),
      uptime: 0,
      version: '1.0.0'
    },
    lastActivity: new Date(),
    performanceMetrics: {
      memoryUsage: 0,
      cpuUsage: 0,
      responseTime: 0,
      activeConnections: 0,
      lastUpdate: new Date().toISOString()
    }
  });

  const {
    userProfile,
    preferences,
    updatePreferences,
    isLoading: userLoading,
    error: userError
  } = useUserManagement(userId);

  const {
    layoutConfiguration,
    applyLayout,
    validateLayout,
    animateLayoutChange,
    resetLayout,
    isLoading: layoutLoading,
    error: layoutError
  } = useLayoutManager(layoutState.configuration);

  const {
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    dimensions,
    breakpoints
  } = useResponsiveDesign({
    enabled: enableResponsiveDesign,
    customBreakpoints: RESPONSIVE_BREAKPOINTS
  });

  const {
    performanceMetrics,
    startMonitoring,
    stopMonitoring,
    getMetrics
  } = usePerformanceMonitor({
    enabled: enablePerformanceMonitoring,
    threshold: PERFORMANCE_THRESHOLDS.layout
  });

  // Layout Operations
  const handleLayoutChange = useCallback(async (newLayout: LayoutMode) => {
    if (layoutState.isLocked) {
      return;
    }

    try {
      setLayoutState(prev => ({ ...prev, isLoading: true, error: null }));

      // Validate new layout
      const validation = await validateLayout(newLayout, workspaceId);
      if (!validation.isValid) {
        throw new Error(validation.errors[0] || 'Invalid layout configuration');
      }

      // Apply layout with animation
      if (enableAnimations) {
        await animateLayoutChange(layoutState.currentLayout, newLayout);
      }

      const newConfiguration = layoutUtils.generateConfiguration(newLayout, {
        workspaceId,
        userId,
        responsive: enableResponsiveDesign,
        breakpoint: currentBreakpoint
      });

      setLayoutState(prev => ({
        ...prev,
        currentLayout: newLayout,
        configuration: newConfiguration,
        hasUnsavedChanges: true,
        isLoading: false
      }));

      // Update metrics
      layoutMetricsRef.current.layoutChanges += 1;
      layoutMetricsRef.current.lastUpdate = new Date().toISOString();

      onLayoutChange?.(newConfiguration);

    } catch (error) {
      const layoutError: LayoutError = {
        code: 'LAYOUT_CHANGE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to change layout',
        timestamp: new Date().toISOString(),
        layoutMode: newLayout,
        workspaceId
      };

      setLayoutState(prev => ({ ...prev, error: layoutError, isLoading: false }));
      onError?.(layoutError);
      layoutMetricsRef.current.errorCount += 1;
    }
  }, [
    layoutState.currentLayout,
    layoutState.isLocked,
    workspaceId,
    userId,
    currentBreakpoint,
    enableAnimations,
    enableResponsiveDesign,
    validateLayout,
    animateLayoutChange,
    onLayoutChange,
    onError
  ]);

  // Save Layout
  const handleSaveLayout = useCallback(async () => {
    if (!workspaceId || !layoutState.hasUnsavedChanges) {
      return;
    }

    try {
      setLayoutState(prev => ({ ...prev, isLoading: true }));

      const saveRequest: LayoutConfigurationRequest = {
        workspaceId,
        configuration: layoutState.configuration,
        preferences: {
          autoSave: true,
          syncAcrossDevices: true,
          responsiveAdaptation: enableResponsiveDesign
        }
      };

      await saveWorkspaceLayout(saveRequest);

      setLayoutState(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString(),
        isLoading: false,
        syncStatus: 'synchronized'
      }));

    } catch (error) {
      const layoutError: LayoutError = {
        code: 'LAYOUT_SAVE_ERROR',
        message: 'Failed to save layout configuration',
        timestamp: new Date().toISOString(),
        layoutMode: layoutState.currentLayout,
        workspaceId
      };

      setLayoutState(prev => ({ ...prev, error: layoutError, isLoading: false }));
      onError?.(layoutError);
    }
  }, [
    workspaceId,
    layoutState.hasUnsavedChanges,
    layoutState.configuration,
    layoutState.currentLayout,
    enableResponsiveDesign,
    saveWorkspaceLayout,
    onError
  ]);

  // Load Layout Template
  const handleLoadLayout = useCallback(async (template: LayoutTemplate) => {
    try {
      setLayoutState(prev => ({ ...prev, isLoading: true }));

      const templateConfiguration = await layoutUtils.loadTemplate(template.id, {
        workspaceId,
        userId,
        customizations: template.customizations
      });

      setLayoutState(prev => ({
        ...prev,
        currentLayout: template.mode,
        configuration: templateConfiguration,
        hasUnsavedChanges: true,
        isLoading: false
      }));

      if (enableAnimations) {
        await animateLayoutChange(layoutState.currentLayout, template.mode);
      }

    } catch (error) {
      const layoutError: LayoutError = {
        code: 'TEMPLATE_LOAD_ERROR',
        message: 'Failed to load layout template',
        timestamp: new Date().toISOString(),
        layoutMode: template.mode,
        workspaceId
      };

      setLayoutState(prev => ({ ...prev, error: layoutError, isLoading: false }));
      onError?.(layoutError);
    }
  }, [
    workspaceId,
    userId,
    layoutState.currentLayout,
    enableAnimations,
    animateLayoutChange,
    onError
  ]);

  // Reset Layout
  const handleResetLayout = useCallback(async () => {
    try {
      setLayoutState(prev => ({ ...prev, isLoading: true }));

      const defaultConfig = layoutUtils.getDefaultConfiguration(currentBreakpoint);
      
      await resetLayout();

      setLayoutState(prev => ({
        ...prev,
        currentLayout: 'single-pane',
        configuration: defaultConfig,
        hasUnsavedChanges: true,
        isLoading: false,
        error: null
      }));

    } catch (error) {
      const layoutError: LayoutError = {
        code: 'LAYOUT_RESET_ERROR',
        message: 'Failed to reset layout',
        timestamp: new Date().toISOString(),
        layoutMode: layoutState.currentLayout,
        workspaceId
      };

      setLayoutState(prev => ({ ...prev, error: layoutError, isLoading: false }));
      onError?.(layoutError);
    }
  }, [currentBreakpoint, layoutState.currentLayout, workspaceId, resetLayout, onError]);

  // Toggle Fullscreen
  const handleToggleFullscreen = useCallback(() => {
    setLayoutState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  // Toggle Lock
  const handleToggleLock = useCallback(() => {
    setLayoutState(prev => ({ ...prev, isLocked: !prev.isLocked }));
  }, []);

  // Initialize Layout
  useEffect(() => {
    const initializeLayout = async () => {
      try {
        setLayoutState(prev => ({ ...prev, isLoading: true }));

        // Load workspace layouts if available
        if (workspaceId) {
          const workspaceLayouts = await getWorkspaceLayouts(workspaceId);
          setAvailableTemplates(workspaceLayouts);
        }

        // Load user preferences
        if (userId && preferences?.layout) {
          const userLayoutConfig = layoutUtils.mergeWithPreferences(
            DEFAULT_LAYOUT_CONFIG,
            preferences.layout
          );

          setLayoutState(prev => ({
            ...prev,
            configuration: userLayoutConfig,
            currentLayout: preferences.layout.defaultMode || initialLayout,
            isLoading: false
          }));
        } else {
          setLayoutState(prev => ({ ...prev, isLoading: false }));
        }

        // Start performance monitoring
        if (enablePerformanceMonitoring) {
          startMonitoring();
        }

      } catch (error) {
        const layoutError: LayoutError = {
          code: 'LAYOUT_INIT_ERROR',
          message: 'Failed to initialize layout',
          timestamp: new Date().toISOString(),
          layoutMode: initialLayout,
          workspaceId
        };

        setLayoutState(prev => ({ ...prev, error: layoutError, isLoading: false }));
        onError?.(layoutError);
      }
    };

    initializeLayout();

    return () => {
      if (enablePerformanceMonitoring) {
        stopMonitoring();
      }
    };
  }, [
    workspaceId,
    userId,
    initialLayout,
    preferences,
    enablePerformanceMonitoring,
    getWorkspaceLayouts,
    startMonitoring,
    stopMonitoring,
    onError
  ]);

  // Responsive Layout Updates
  useEffect(() => {
    if (!enableResponsiveDesign) return;

    const updateResponsiveLayout = async () => {
      try {
        const responsiveConfig = responsiveUtils.adaptConfiguration(
          layoutState.configuration,
          currentBreakpoint,
          dimensions
        );

        if (layoutUtils.hasSignificantChanges(layoutState.configuration, responsiveConfig)) {
          setLayoutState(prev => ({
            ...prev,
            configuration: responsiveConfig,
            hasUnsavedChanges: true
          }));
        }
      } catch (error) {
        console.warn('Failed to update responsive layout:', error);
      }
    };

    updateResponsiveLayout();
  }, [currentBreakpoint, dimensions, enableResponsiveDesign, layoutState.configuration]);

  // Performance Metrics Update
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const updateMetrics = () => {
      const currentMetrics = getMetrics();
      layoutMetricsRef.current = {
        ...layoutMetricsRef.current,
        renderTime: currentMetrics.renderTime,
        memoryUsage: currentMetrics.memoryUsage,
        frameRate: currentMetrics.frameRate,
        lastUpdate: new Date().toISOString()
      };
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [enablePerformanceMonitoring, getMetrics]);

  // Auto-save functionality
  useEffect(() => {
    if (!layoutState.hasUnsavedChanges || !preferences?.layout?.autoSave) return;

    const autoSaveTimer = setTimeout(() => {
      handleSaveLayout();
    }, 30000); // Auto-save after 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [layoutState.hasUnsavedChanges, preferences?.layout?.autoSave, handleSaveLayout]);

  // Error Recovery
  useEffect(() => {
    if (layoutState.error && layoutState.error.code === 'LAYOUT_CORRUPTION') {
      // Auto-recover from layout corruption
      setTimeout(() => {
        handleResetLayout();
      }, 3000);
    }
  }, [layoutState.error, handleResetLayout]);

  // Computed Values
  const isLoading = useMemo(() => {
    return layoutState.isLoading || 
           workspaceLoading || 
           orchestrationLoading || 
           userLoading || 
           layoutLoading;
  }, [
    layoutState.isLoading,
    workspaceLoading,
    orchestrationLoading,
    userLoading,
    layoutLoading
  ]);

  const hasError = useMemo(() => {
    return layoutState.error || workspaceError || orchestrationError || userError || layoutError;
  }, [layoutState.error, workspaceError, orchestrationError, userError, layoutError]);

  const layoutClasses = useMemo(() => {
    return [
      'layout-content',
      `layout-${layoutState.currentLayout}`,
      `breakpoint-${currentBreakpoint}`,
      layoutState.isFullscreen && 'fullscreen',
      layoutState.isLocked && 'locked',
      isLoading && 'loading',
      hasError && 'error',
      className
    ].filter(Boolean).join(' ');
  }, [
    layoutState.currentLayout,
    layoutState.isFullscreen,
    layoutState.isLocked,
    currentBreakpoint,
    isLoading,
    hasError,
    className
  ]);

  // Render Layout Content
  const renderLayoutContent = () => {
    if (isLoading) {
      return <LayoutLoadingSkeleton />;
    }

    if (hasError) {
      return (
        <DefaultErrorFallback
          error={hasError as Error}
          resetError={handleResetLayout}
        />
      );
    }

    return (
      <LayoutGroup>
        <motion.div
          layout
          className="layout-container flex-1 overflow-hidden"
          initial={enableAnimations ? { opacity: 0 } : false}
          animate={enableAnimations ? { opacity: 1 } : false}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </LayoutGroup>
    );
  };

  // Main Render
  return (
    <LayoutErrorBoundary onError={onError}>
      <TooltipProvider>
        <div
          ref={containerRef}
          className={layoutClasses}
          data-testid="layout-content"
        >
          {/* Layout Toolbar */}
          <LayoutToolbar
            currentLayout={layoutState.currentLayout}
            layouts={availableTemplates}
            onLayoutChange={handleLayoutChange}
            onSaveLayout={handleSaveLayout}
            onLoadLayout={handleLoadLayout}
            onResetLayout={handleResetLayout}
            isLoading={isLoading}
            hasUnsavedChanges={layoutState.hasUnsavedChanges}
          />

          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
            <div className="flex items-center gap-4">
              <ResponsiveIndicator
                currentBreakpoint={currentBreakpoint}
                breakpoints={breakpoints}
              />
              
              {currentWorkspace && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Workspace:</span>
                  <Badge variant="outline">{currentWorkspace.name}</Badge>
                </div>
              )}

              <div className="flex items-center gap-2">
                {layoutState.syncStatus === 'synchronized' && (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Synced
                  </Badge>
                )}
                {layoutState.syncStatus === 'synchronizing' && (
                  <Badge variant="secondary" className="text-xs">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Syncing
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleLock}
                disabled={isLoading}
              >
                {layoutState.isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFullscreen}
                disabled={isLoading}
              >
                {layoutState.isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              <Sheet open={layoutPreferencesOpen} onOpenChange={setLayoutPreferencesOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Layout Preferences</SheetTitle>
                    <SheetDescription>
                      Customize your layout settings and preferences
                    </SheetDescription>
                  </SheetHeader>
                  {/* Layout Preferences Content */}
                  <div className="space-y-6 mt-6">
                    <div className="space-y-3">
                      <Label>Auto-save Changes</Label>
                      <Switch
                        checked={preferences?.layout?.autoSave || false}
                        onCheckedChange={(checked) => {
                          updatePreferences({
                            layout: {
                              ...preferences?.layout,
                              autoSave: checked
                            }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Sync Across Devices</Label>
                      <Switch
                        checked={preferences?.layout?.syncAcrossDevices || false}
                        onCheckedChange={(checked) => {
                          updatePreferences({
                            layout: {
                              ...preferences?.layout,
                              syncAcrossDevices: checked
                            }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Responsive Adaptation</Label>
                      <Switch
                        checked={enableResponsiveDesign}
                        onCheckedChange={(checked) => {
                          updatePreferences({
                            layout: {
                              ...preferences?.layout,
                              responsiveAdaptation: checked
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {hasError && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="m-4"
              >
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Layout Error</AlertTitle>
                  <AlertDescription>
                    {(hasError as any).message || 'An error occurred with the layout system'}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Layout Content */}
          {renderLayoutContent()}

          {/* Performance Monitor */}
          <AnimatePresence>
            {enablePerformanceMonitoring && (
              <LayoutPerformanceMonitor
                isVisible={performanceMonitorVisible}
                metrics={layoutMetricsRef.current}
                onToggle={() => setPerformanceMonitorVisible(!performanceMonitorVisible)}
              />
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </LayoutErrorBoundary>
  );
};

export default LayoutContent;