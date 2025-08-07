'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

// Icons
import {
  Layout,
  Grid,
  Sidebar,
  Maximize,
  Minimize,
  Split,
  Layers,
  Settings,
  Monitor,
  Tablet,
  Smartphone,
  MoreHorizontal,
  Plus,
  X,
  Move,
  RotateCw,
  Expand,
  Shrink,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Save,
  Download,
  Upload,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Grip,
  GripVertical,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  LayoutDashboard,
  LayoutGrid,
  LayoutList,
  Columns,
  Rows,
  Square,
  Circle,
  Triangle,
  BarChart3,
} from 'lucide-react';

// Import racine hooks and services
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useActivityTracking } from '../../hooks/useActivityTracking';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';

// Import layout subcomponents
import { QuickLayoutSwitch } from './subcomponents/QuickLayoutSwitch';
import { QuickPaneManager } from './subcomponents/QuickPaneManager';
import { QuickTabControls } from './subcomponents/QuickTabControls';
import { QuickOverlayControls } from './subcomponents/QuickOverlayControls';

// Types
type LayoutMode = 'single' | 'split-horizontal' | 'split-vertical' | 'grid' | 'tabs' | 'dashboard' | 'custom';
type PaneType = 'spa' | 'widget' | 'chart' | 'table' | 'form' | 'canvas' | 'iframe' | 'custom';
type ResponsiveBreakpoint = 'desktop' | 'tablet' | 'mobile';

interface LayoutPane {
  id: string;
  type: PaneType;
  title: string;
  icon?: React.ComponentType<any>;
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
  size?: number; // Percentage for splits, grid span for grid
  minSize?: number;
  maxSize?: number;
  resizable?: boolean;
  closable?: boolean;
  maximizable?: boolean;
  collapsible?: boolean;
  order?: number;
  position?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  isVisible?: boolean;
  isMaximized?: boolean;
  isCollapsed?: boolean;
  isLocked?: boolean;
  tabGroup?: string;
  metadata?: Record<string, any>;
}

interface LayoutConfig {
  id: string;
  name: string;
  description?: string;
  mode: LayoutMode;
  panes: LayoutPane[];
  settings: {
    theme?: 'light' | 'dark' | 'auto';
    showHeaders?: boolean;
    showBorders?: boolean;
    allowResize?: boolean;
    allowReorder?: boolean;
    allowClose?: boolean;
    snapToGrid?: boolean;
    gridSize?: number;
    padding?: number;
    gap?: number;
  };
  responsive?: Record<ResponsiveBreakpoint, Partial<LayoutConfig>>;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface LayoutContentProps {
  className?: string;
  initialLayout?: LayoutConfig;
  onLayoutChange?: (layout: LayoutConfig) => void;
  enablePersonalization?: boolean;
  enableCollaboration?: boolean;
  enableAnalytics?: boolean;
  readOnly?: boolean;
  workspaceId?: string;
}

const LayoutContent: React.FC<LayoutContentProps> = ({
  className = '',
  initialLayout,
  onLayoutChange,
  enablePersonalization = true,
  enableCollaboration = true,
  enableAnalytics = true,
  readOnly = false,
  workspaceId,
}) => {
  // State management
  const [currentLayout, setCurrentLayout] = useState<LayoutConfig>(
    initialLayout || getDefaultLayout()
  );
  const [savedLayouts, setSavedLayouts] = useState<LayoutConfig[]>([]);
  const [selectedPanes, setSelectedPanes] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [responsiveMode, setResponsiveMode] = useState<ResponsiveBreakpoint>('desktop');
  const [showLayoutPicker, setShowLayoutPicker] = useState<boolean>(false);
  const [showPersonalization, setShowPersonalization] = useState<boolean>(false);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const layoutContainerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Hooks
  const router = useRouter();
  const pathname = usePathname();

  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser, preferences, updatePreferences } = useUserManagement();
  const { trackActivity } = useActivityTracking();
  const { getLayoutData, saveLayoutData } = useCrossGroupIntegration();

  // Initialize layout
  useEffect(() => {
    const initializeLayout = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Track activity
        await trackActivity('layout-content-opened', {
          layoutMode: currentLayout.mode,
          workspaceId: currentWorkspace?.id,
          userId: currentUser?.id
        });

        // Load saved layouts if personalization is enabled
        if (enablePersonalization && currentUser?.id) {
          const layouts = await getLayoutData(currentUser.id, workspaceId);
          setSavedLayouts(layouts || []);
        }

        // Load user preferences
        if (currentUser?.preferences?.layout) {
          const preferredLayout = currentUser.preferences.layout;
          if (preferredLayout && !initialLayout) {
            setCurrentLayout(preferredLayout);
          }
        }

        // Set up responsive observer
        if (layoutContainerRef.current) {
          resizeObserverRef.current = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            const newMode: ResponsiveBreakpoint = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
            
            if (newMode !== responsiveMode) {
              setResponsiveMode(newMode);
              handleResponsiveChange(newMode);
            }
          });

          resizeObserverRef.current.observe(layoutContainerRef.current);
        }

      } catch (err) {
        console.error('Failed to initialize layout:', err);
        setError('Failed to load layout configuration');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLayout();

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [
    currentLayout.mode,
    currentWorkspace?.id,
    currentUser?.id,
    enablePersonalization,
    initialLayout,
    workspaceId,
    responsiveMode,
    trackActivity,
    getLayoutData
  ]);

  // Handle responsive changes
  const handleResponsiveChange = useCallback((breakpoint: ResponsiveBreakpoint) => {
    if (currentLayout.responsive?.[breakpoint]) {
      const responsiveConfig = currentLayout.responsive[breakpoint];
      setCurrentLayout(prev => ({
        ...prev,
        ...responsiveConfig,
        panes: responsiveConfig.panes || prev.panes
      }));
    }
  }, [currentLayout.responsive]);

  // Layout manipulation functions
  const addPane = useCallback((pane: Omit<LayoutPane, 'id'>) => {
    const newPane: LayoutPane = {
      ...pane,
      id: `pane_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isVisible: true,
      order: currentLayout.panes.length
    };

    const updatedLayout = {
      ...currentLayout,
      panes: [...currentLayout.panes, newPane],
      updatedAt: new Date().toISOString()
    };

    setCurrentLayout(updatedLayout);
    onLayoutChange?.(updatedLayout);

    // Track activity
    trackActivity('layout-pane-added', {
      paneType: pane.type,
      layoutMode: currentLayout.mode,
      workspaceId: currentWorkspace?.id
    });
  }, [currentLayout, onLayoutChange, trackActivity, currentWorkspace?.id]);

  const removePane = useCallback((paneId: string) => {
    const updatedLayout = {
      ...currentLayout,
      panes: currentLayout.panes.filter(pane => pane.id !== paneId),
      updatedAt: new Date().toISOString()
    };

    setCurrentLayout(updatedLayout);
    onLayoutChange?.(updatedLayout);

    // Track activity
    trackActivity('layout-pane-removed', {
      paneId,
      layoutMode: currentLayout.mode,
      workspaceId: currentWorkspace?.id
    });
  }, [currentLayout, onLayoutChange, trackActivity, currentWorkspace?.id]);

  const updatePane = useCallback((paneId: string, updates: Partial<LayoutPane>) => {
    const updatedLayout = {
      ...currentLayout,
      panes: currentLayout.panes.map(pane =>
        pane.id === paneId ? { ...pane, ...updates } : pane
      ),
      updatedAt: new Date().toISOString()
    };

    setCurrentLayout(updatedLayout);
    onLayoutChange?.(updatedLayout);
  }, [currentLayout, onLayoutChange]);

  const reorderPanes = useCallback((newOrder: LayoutPane[]) => {
    const updatedLayout = {
      ...currentLayout,
      panes: newOrder.map((pane, index) => ({ ...pane, order: index })),
      updatedAt: new Date().toISOString()
    };

    setCurrentLayout(updatedLayout);
    onLayoutChange?.(updatedLayout);

    // Track activity
    trackActivity('layout-panes-reordered', {
      layoutMode: currentLayout.mode,
      workspaceId: currentWorkspace?.id
    });
  }, [currentLayout, onLayoutChange, trackActivity, currentWorkspace?.id]);

  const changeLayoutMode = useCallback((mode: LayoutMode) => {
    const updatedLayout = {
      ...currentLayout,
      mode,
      updatedAt: new Date().toISOString()
    };

    setCurrentLayout(updatedLayout);
    onLayoutChange?.(updatedLayout);

    // Track activity
    trackActivity('layout-mode-changed', {
      fromMode: currentLayout.mode,
      toMode: mode,
      workspaceId: currentWorkspace?.id
    });
  }, [currentLayout, onLayoutChange, trackActivity, currentWorkspace?.id]);

  // Save layout
  const saveLayout = useCallback(async (name?: string) => {
    if (!enablePersonalization || !currentUser?.id) return;

    try {
      const layoutToSave = {
        ...currentLayout,
        id: `layout_${Date.now()}`,
        name: name || `Layout ${savedLayouts.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveLayoutData(currentUser.id, layoutToSave, workspaceId);
      setSavedLayouts(prev => [...prev, layoutToSave]);

      // Track activity
      await trackActivity('layout-saved', {
        layoutId: layoutToSave.id,
        layoutName: layoutToSave.name,
        workspaceId: currentWorkspace?.id
      });

    } catch (err) {
      console.error('Failed to save layout:', err);
      setError('Failed to save layout');
    }
  }, [
    enablePersonalization,
    currentUser?.id,
    currentLayout,
    savedLayouts.length,
    saveLayoutData,
    workspaceId,
    trackActivity,
    currentWorkspace?.id
  ]);

  // Load layout
  const loadLayout = useCallback((layout: LayoutConfig) => {
    setCurrentLayout(layout);
    onLayoutChange?.(layout);

    // Track activity
    trackActivity('layout-loaded', {
      layoutId: layout.id,
      layoutName: layout.name,
      workspaceId: currentWorkspace?.id
    });
  }, [onLayoutChange, trackActivity, currentWorkspace?.id]);

  // Render pane content
  const renderPaneContent = useCallback((pane: LayoutPane) => {
    if (!pane.isVisible) return null;

    const PaneComponent = pane.component;
    
    return (
      <div 
        key={pane.id}
        className={`layout-pane ${pane.isMaximized ? 'maximized' : ''} ${pane.isCollapsed ? 'collapsed' : ''}`}
        data-pane-id={pane.id}
      >
        {/* Pane Header */}
        {currentLayout.settings.showHeaders !== false && (
          <div className="flex items-center justify-between p-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              {pane.icon && <pane.icon className="h-4 w-4" />}
              <span className="text-sm font-medium">{pane.title}</span>
            </div>
            
            <div className="flex items-center gap-1">
              {pane.collapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => updatePane(pane.id, { isCollapsed: !pane.isCollapsed })}
                >
                  {pane.isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </Button>
              )}
              
              {pane.maximizable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => updatePane(pane.id, { isMaximized: !pane.isMaximized })}
                >
                  {pane.isMaximized ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
                </Button>
              )}
              
              {pane.closable && !readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removePane(pane.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Pane Content */}
        {!pane.isCollapsed && (
          <div className="flex-1 overflow-auto">
            {PaneComponent ? (
              <PaneComponent {...(pane.props || {})} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <p>No content configured</p>
                  <p className="text-xs">Pane type: {pane.type}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }, [currentLayout.settings.showHeaders, updatePane, removePane, readOnly]);

  // Render layout based on mode
  const renderLayout = useCallback(() => {
    const visiblePanes = currentLayout.panes.filter(pane => pane.isVisible);
    
    if (visiblePanes.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Content</h3>
            <p className="text-sm mb-4">Add some panes to get started</p>
            {!readOnly && (
              <Button onClick={() => setShowLayoutPicker(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Pane
              </Button>
            )}
          </div>
        </div>
      );
    }

    switch (currentLayout.mode) {
      case 'single':
        return (
          <div className="h-full w-full">
            {renderPaneContent(visiblePanes[0])}
          </div>
        );

      case 'split-horizontal':
        return (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {visiblePanes.map((pane, index) => (
              <React.Fragment key={pane.id}>
                <ResizablePanel
                  defaultSize={pane.size || 50}
                  minSize={pane.minSize || 20}
                  maxSize={pane.maxSize || 80}
                >
                  {renderPaneContent(pane)}
                </ResizablePanel>
                {index < visiblePanes.length - 1 && <ResizableHandle />}
              </React.Fragment>
            ))}
          </ResizablePanelGroup>
        );

      case 'split-vertical':
        return (
          <ResizablePanelGroup direction="vertical" className="h-full">
            {visiblePanes.map((pane, index) => (
              <React.Fragment key={pane.id}>
                <ResizablePanel
                  defaultSize={pane.size || 50}
                  minSize={pane.minSize || 20}
                  maxSize={pane.maxSize || 80}
                >
                  {renderPaneContent(pane)}
                </ResizablePanel>
                {index < visiblePanes.length - 1 && <ResizableHandle />}
              </React.Fragment>
            ))}
          </ResizablePanelGroup>
        );

      case 'grid':
        const gridCols = Math.ceil(Math.sqrt(visiblePanes.length));
        return (
          <div 
            className="h-full grid gap-2 p-2"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gridAutoRows: 'minmax(200px, 1fr)'
            }}
          >
            {visiblePanes.map((pane) => (
              <div
                key={pane.id}
                className="border rounded-lg overflow-hidden"
                style={{
                  gridColumn: pane.position?.width ? `span ${pane.position.width}` : undefined,
                  gridRow: pane.position?.height ? `span ${pane.position.height}` : undefined
                }}
              >
                {renderPaneContent(pane)}
              </div>
            ))}
          </div>
        );

      case 'tabs':
        return (
          <Tabs value={visiblePanes[0]?.id} className="h-full flex flex-col">
            <TabsList className="w-full justify-start">
              {visiblePanes.map((pane) => (
                <TabsTrigger key={pane.id} value={pane.id} className="flex items-center gap-2">
                  {pane.icon && <pane.icon className="h-4 w-4" />}
                  {pane.title}
                  {pane.closable && !readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePane(pane.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {visiblePanes.map((pane) => (
              <TabsContent key={pane.id} value={pane.id} className="flex-1 mt-0">
                {renderPaneContent(pane)}
              </TabsContent>
            ))}
          </Tabs>
        );

      case 'dashboard':
        return (
          <div className="h-full p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
              {visiblePanes.map((pane) => (
                <Card
                  key={pane.id}
                  className={`overflow-hidden ${pane.size === 2 ? 'md:col-span-2' : ''} ${pane.size === 3 ? 'lg:col-span-3' : ''}`}
                >
                  {renderPaneContent(pane)}
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full">
            <Reorder.Group
              axis="y"
              values={visiblePanes}
              onReorder={reorderPanes}
              className="h-full space-y-2 p-2"
            >
              {visiblePanes.map((pane) => (
                <Reorder.Item
                  key={pane.id}
                  value={pane}
                  className="border rounded-lg overflow-hidden cursor-move"
                >
                  {renderPaneContent(pane)}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        );
    }
  }, [currentLayout, renderPaneContent, removePane, readOnly, reorderPanes]);

  // Default layout factory
  function getDefaultLayout(): LayoutConfig {
    return {
      id: 'default',
      name: 'Default Layout',
      mode: 'single',
      panes: [],
      settings: {
        theme: 'auto',
        showHeaders: true,
        showBorders: true,
        allowResize: true,
        allowReorder: true,
        allowClose: true,
        snapToGrid: false,
        gridSize: 10,
        padding: 8,
        gap: 8
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading layout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-medium mb-2">Layout Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`layout-content h-full flex flex-col ${className}`} ref={layoutContainerRef}>
      {/* Layout Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <QuickLayoutSwitch
            currentMode={currentLayout.mode}
            onModeChange={changeLayoutMode}
            compact={responsiveMode !== 'desktop'}
          />
          
          <Separator orientation="vertical" className="h-6" />
          
          <QuickPaneManager
            panes={currentLayout.panes}
            onAddPane={addPane}
            onRemovePane={removePane}
            onUpdatePane={updatePane}
            readOnly={readOnly}
          />
        </div>

        <div className="flex items-center gap-2">
          <QuickTabControls
            layout={currentLayout}
            onLayoutChange={setCurrentLayout}
            responsiveMode={responsiveMode}
          />
          
          <QuickOverlayControls
            showPersonalization={showPersonalization}
            onPersonalizationChange={setShowPersonalization}
            showAnalytics={showAnalytics}
            onAnalyticsChange={setShowAnalytics}
            enablePersonalization={enablePersonalization}
            enableAnalytics={enableAnalytics}
          />

          {enablePersonalization && !readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveLayout()}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Layout Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLayoutPicker(true)}>
                <Layout className="h-4 w-4 mr-2" />
                Layout Picker
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPersonalization(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Personalization
              </DropdownMenuItem>
              {enableAnalytics && (
                <DropdownMenuItem onClick={() => setShowAnalytics(true)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Layout
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Import Layout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 overflow-hidden">
        {renderLayout()}
      </div>

      {/* Layout Picker Dialog */}
      <Dialog open={showLayoutPicker} onOpenChange={setShowLayoutPicker}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Layout Picker</DialogTitle>
            <DialogDescription>
              Choose a layout mode and configure your workspace
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            {[
              { mode: 'single', icon: Square, label: 'Single Pane' },
              { mode: 'split-horizontal', icon: Columns, label: 'Horizontal Split' },
              { mode: 'split-vertical', icon: Rows, label: 'Vertical Split' },
              { mode: 'grid', icon: Grid, label: 'Grid Layout' },
              { mode: 'tabs', icon: Layers, label: 'Tabbed Layout' },
              { mode: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            ].map(({ mode, icon: Icon, label }) => (
              <Card
                key={mode}
                className={`cursor-pointer transition-colors hover:bg-accent ${currentLayout.mode === mode ? 'bg-accent' : ''}`}
                onClick={() => {
                  changeLayoutMode(mode as LayoutMode);
                  setShowLayoutPicker(false);
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Icon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">{label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LayoutContent;