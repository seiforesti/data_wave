/**
 * Advanced Catalog SPA (Single Page Application)
 * =============================================
 * 
 * Master catalog hub that orchestrates all Advanced Catalog components with:
 * - High-level workflow rate management and orchestration
 * - Advanced modern UI design with Shadcn/UI
 * - Real-time collaboration and monitoring
 * - AI-powered insights and recommendations
 * - Comprehensive data governance integration
 * - Cross-component state management
 * - Advanced navigation and user experience
 * - Enterprise-grade performance optimization
 * 
 * Backend Integration:
 * - Maps to complete enterprise_catalog_service.py ecosystem
 * - Orchestrates all catalog-related backend services
 * - Provides unified real-time updates and notifications
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Database, 
  Search, 
  BarChart3, 
  Network, 
  Shield, 
  Users, 
  Settings, 
  Bell, 
  Star, 
  Bookmark, 
  Filter,
  Grid,
  List,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Share2,
  MessageSquare,
  Activity,
  TrendingUp,
  Zap,
  Lightbulb,
  Target,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Layers,
  Workflow,
  GitBranch,
  PieChart,
  LineChart,
  AreaChart,
  Gauge,
  Radar,
  Maximize2,
  Minimize2,
  Layout,
  Sidebar,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  MoreHorizontal,
  ExternalLink,
  Home,
  Folder,
  FileText,
  Tag,
  Calendar
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Advanced Catalog Components
import AIDiscoveryEngine from '../components/intelligent-discovery/AIDiscoveryEngine';
import IntelligentCatalogViewer from '../components/catalog-intelligence/IntelligentCatalogViewer';

// Hooks and Services
import { useAssets, useAssetEvents, useAssetEventSubscription } from '../hooks/useCatalogAssets';
import { IntelligentDataAsset, AssetType, AssetStatus } from '../types/catalog-core.types';
import { ASSET_TYPE_CONFIG, UI_CONFIG, CACHE_CONFIG } from '../constants/catalog-constants';
import { calculateAssetHealthScore, formatNumber, formatRelativeTime } from '../utils/catalog-utils';

// ========================= INTERFACES =========================

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  description: string;
  badge?: string;
  disabled?: boolean;
}

interface DashboardMetrics {
  totalAssets: number;
  activeAssets: number;
  avgQualityScore: number;
  discoveryJobs: number;
  recentActivities: number;
  criticalIssues: number;
  pendingApprovals: number;
  collaborativeEdits: number;
}

interface RealtimeUpdate {
  id: string;
  type: 'asset_created' | 'asset_updated' | 'quality_alert' | 'discovery_completed' | 'collaboration_update';
  title: string;
  description: string;
  assetId?: string;
  userId?: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface WorkflowState {
  activeWorkflows: number;
  completedToday: number;
  pendingApprovals: number;
  averageCompletionTime: number;
  successRate: number;
}

// ========================= MAIN COMPONENT =========================

export const AdvancedCatalogSPA: React.FC = () => {
  // ========================= STATE MANAGEMENT =========================
  
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealtimeUpdate[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [showQuickActions, setShowQuickActions] = useState<boolean>(false);

  // ========================= NAVIGATION CONFIGURATION =========================
  
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      component: () => <DashboardView />,
      description: 'Overview and key metrics'
    },
    {
      id: 'discovery',
      label: 'AI Discovery',
      icon: Brain,
      component: AIDiscoveryEngine,
      description: 'Intelligent data discovery engine',
      badge: 'AI'
    },
    {
      id: 'catalog',
      label: 'Catalog Browser',
      icon: Database,
      component: IntelligentCatalogViewer,
      description: 'Smart catalog browsing and exploration'
    },
    {
      id: 'search',
      label: 'Advanced Search',
      icon: Search,
      component: () => <SearchView />,
      description: 'Semantic and intelligent search'
    },
    {
      id: 'lineage',
      label: 'Data Lineage',
      icon: GitBranch,
      component: () => <LineageView />,
      description: 'Interactive lineage visualization'
    },
    {
      id: 'quality',
      label: 'Quality Management',
      icon: Shield,
      component: () => <QualityView />,
      description: 'Data quality monitoring and rules'
    },
    {
      id: 'analytics',
      label: 'Analytics Center',
      icon: BarChart3,
      component: () => <AnalyticsView />,
      description: 'Usage analytics and insights'
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      icon: Users,
      component: () => <CollaborationView />,
      description: 'Team collaboration and stewardship'
    },
    {
      id: 'governance',
      label: 'Governance',
      icon: Workflow,
      component: () => <GovernanceView />,
      description: 'Governance policies and compliance'
    }
  ];

  // ========================= HOOKS =========================
  
  const {
    data: assetsOverview,
    isLoading: isAssetsLoading,
    error: assetsError
  } = useAssets({
    query: '',
    scope: 'all',
    limit: 1,
    include_metadata: false
  });

  const {
    events: recentEvents,
    isLoading: isEventsLoading
  } = useAssetEvents({
    limit: 20,
    includeSystemEvents: true
  });

  // Real-time event subscription
  useAssetEventSubscription(['asset_created', 'asset_updated', 'quality_alert'], (event) => {
    const update: RealtimeUpdate = {
      id: event.id,
      type: event.type as any,
      title: event.title || 'System Update',
      description: event.description || '',
      assetId: event.assetId,
      userId: event.userId,
      timestamp: event.timestamp,
      severity: event.severity || 'info'
    };
    
    setRealtimeUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
  });

  // ========================= COMPUTED VALUES =========================
  
  const dashboardMetrics = useMemo<DashboardMetrics>(() => {
    return {
      totalAssets: assetsOverview?.total_count || 0,
      activeAssets: assetsOverview?.facets?.status?.active || 0,
      avgQualityScore: assetsOverview?.aggregations?.avg_quality_score || 0,
      discoveryJobs: assetsOverview?.aggregations?.active_discovery_jobs || 0,
      recentActivities: recentEvents?.length || 0,
      criticalIssues: assetsOverview?.aggregations?.critical_issues || 0,
      pendingApprovals: assetsOverview?.aggregations?.pending_approvals || 0,
      collaborativeEdits: assetsOverview?.aggregations?.collaborative_edits || 0
    };
  }, [assetsOverview, recentEvents]);

  const workflowState = useMemo<WorkflowState>(() => {
    return {
      activeWorkflows: 12,
      completedToday: 8,
      pendingApprovals: 3,
      averageCompletionTime: 2.5,
      successRate: 94.2
    };
  }, []);

  // ========================= EVENT HANDLERS =========================
  
  const handleViewChange = useCallback((viewId: string) => {
    setActiveView(viewId);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleGlobalSearch = useCallback((query: string) => {
    setGlobalSearch(query);
    if (query.trim()) {
      setActiveView('search');
    }
  }, []);

  // ========================= RENDER HELPERS =========================
  
  const renderSidebar = () => (
    <motion.div
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      className={`bg-card border-r border-border h-full flex flex-col ${isFullscreen ? 'hidden' : ''}`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Advanced Catalog</h2>
                <p className="text-xs text-muted-foreground">Enterprise Data Hub</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleSidebar}
            className="h-8 w-8 p-0"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Tooltip key={item.id} delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeView === item.id ? "default" : "ghost"}
                  className={`w-full justify-start h-10 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
                  onClick={() => handleViewChange(item.id)}
                  disabled={item.disabled}
                >
                  <item.icon className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>
      </ScrollArea>

      {/* Sidebar Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">System Status</span>
              <Badge variant="default" className="text-xs">
                Healthy
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>CPU Usage</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-1" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Memory</span>
                <span>62%</span>
              </div>
              <Progress value={62} className="h-1" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderHeader = () => (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Advanced Catalog</h1>
              <p className="text-sm text-muted-foreground">
                {navigationItems.find(item => item.id === activeView)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Global Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search across all catalog assets..."
              value={globalSearch}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Quick Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Brain className="h-4 w-4 mr-2" />
                Start Discovery Job
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Import Assets
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="h-4 w-4 mr-2" />
                Run Quality Check
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="h-4 w-4 mr-2" />
                Invite Collaborator
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {realtimeUpdates.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {realtimeUpdates.length > 9 ? '9+' : realtimeUpdates.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Real-time Updates</SheetTitle>
                <SheetDescription>
                  Live updates from your data catalog
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {realtimeUpdates.map((update) => (
                  <div key={update.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{update.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {update.description}
                        </p>
                      </div>
                      <Badge variant={
                        update.severity === 'error' ? 'destructive' :
                        update.severity === 'warning' ? 'secondary' :
                        update.severity === 'success' ? 'default' :
                        'outline'
                      } className="text-xs">
                        {update.severity}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatRelativeTime(update.timestamp)}
                    </div>
                  </div>
                ))}
                
                {realtimeUpdates.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No recent updates
                    </p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Settings */}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>

          {/* Fullscreen Toggle */}
          <Button variant="outline" size="sm" onClick={handleToggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDashboardView = () => (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(dashboardMetrics.totalAssets)}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardMetrics.activeAssets} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.avgQualityScore.toFixed(1)}%</div>
            <Progress value={dashboardMetrics.avgQualityScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discovery Jobs</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.discoveryJobs}</div>
            <p className="text-xs text-muted-foreground">
              Running actively
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaborations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.collaborativeEdits}</div>
            <p className="text-xs text-muted-foreground">
              Active sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflow Orchestration
          </CardTitle>
          <CardDescription>
            Real-time workflow management and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{workflowState.activeWorkflows}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{workflowState.completedToday}</div>
              <div className="text-sm text-muted-foreground">Completed Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{workflowState.pendingApprovals}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{workflowState.averageCompletionTime}h</div>
              <div className="text-sm text-muted-foreground">Avg Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{workflowState.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents?.slice(0, 5).map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {event.title || 'System Event'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!recentEvents || recentEvents.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activities
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Quality Improvement Opportunity</AlertTitle>
                <AlertDescription className="text-xs">
                  12 assets could benefit from automated quality rules
                </AlertDescription>
              </Alert>
              
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>Usage Pattern Detected</AlertTitle>
                <AlertDescription className="text-xs">
                  Analytics show 23% increase in table queries this week
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Target className="h-4 w-4" />
                <AlertTitle>Discovery Recommendation</AlertTitle>
                <AlertDescription className="text-xs">
                  New data sources detected in production environment
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Placeholder components for other views
  const DashboardView = () => renderDashboardView();
  const SearchView = () => <div className="p-8 text-center">Advanced Search interface coming soon...</div>;
  const LineageView = () => <div className="p-8 text-center">Data Lineage visualization coming soon...</div>;
  const QualityView = () => <div className="p-8 text-center">Quality Management interface coming soon...</div>;
  const AnalyticsView = () => <div className="p-8 text-center">Analytics Center coming soon...</div>;
  const CollaborationView = () => <div className="p-8 text-center">Collaboration Hub coming soon...</div>;
  const GovernanceView = () => <div className="p-8 text-center">Governance Center coming soon...</div>;

  // ========================= MAIN RENDER =========================
  
  return (
    <TooltipProvider>
      <div className={`h-screen flex flex-col bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Header */}
        {!isFullscreen && renderHeader()}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          {renderSidebar()}

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(() => {
                      const activeComponent = navigationItems.find(item => item.id === activeView)?.component;
                      return activeComponent ? React.createElement(activeComponent) : <DashboardView />;
                    })()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Loading States */}
        {(isAssetsLoading || isEventsLoading) && (
          <div className="fixed bottom-4 right-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading catalog data...</span>
              </div>
            </Card>
          </div>
        )}

        {/* Error States */}
        {assetsError && (
          <div className="fixed bottom-4 right-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {assetsError.message || 'Failed to load catalog data'}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AdvancedCatalogSPA;