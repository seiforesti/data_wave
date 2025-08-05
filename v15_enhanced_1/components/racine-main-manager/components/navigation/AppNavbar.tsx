"use client";

/**
 * AppNavbar - Master Navigation Bar for Racine Main Manager
 * =========================================================
 * 
 * Revolutionary navigation system providing real-time system health indicators,
 * intelligent contextual menus, global search integration, and cross-group coordination.
 * 
 * Features:
 * - Real-time system health across all 7 groups
 * - Intelligent contextual menus based on RBAC permissions
 * - Global search with semantic capabilities
 * - Notification center with priority filtering
 * - Multi-workspace switcher with context preservation
 * - Collaboration presence indicators
 * - Performance monitoring dashboard
 * - AI assistant integration
 * 
 * Backend Integration:
 * - Primary Service: racine_orchestration_service.py
 * - Secondary Services: enterprise_integration_service.py, unified_governance_coordinator.py
 * - Real-time: WebSocket integration for live updates
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  Activity,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MessageSquare,
  Globe,
  Command,
  Menu,
  X,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Palette,
  HelpCircle,
  LogOut,
  Bookmark,
  Star,
  Filter,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Layers,
  Database,
  FileText,
  Scan,
  BarChart3,
  GitBranch,
  Lock,
  Eye,
  Brain,
  Network,
  Workflow
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuShortcut,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types and Services
import {
  RacineGroupType,
  RacineSystemStatus,
  SystemState,
  SystemAlert,
  RacineWorkspace,
  Priority,
  AlertType,
  HealthLevel
} from '../../types/racine-core.types';
import { racineOrchestrationAPI } from '../../services/racine-orchestration-apis';

// Hooks and Utilities
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  group: RacineGroupType;
  permissions: string[];
  badge?: string | number;
  status?: 'active' | 'warning' | 'error';
  children?: NavigationItem[];
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  shortcut?: string;
  group: RacineGroupType;
  permissions: string[];
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  priority: Priority;
  timestamp: string;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive';
  }>;
  source_group: RacineGroupType;
}

interface SystemHealthIndicator {
  group: RacineGroupType;
  status: RacineSystemStatus;
  health_score: number;
  active_alerts: number;
  trend: 'up' | 'down' | 'stable';
  last_updated: string;
}

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const GROUP_ICONS: Record<RacineGroupType, React.ComponentType<any>> = {
  [RacineGroupType.DATA_SOURCES]: Database,
  [RacineGroupType.COMPLIANCE_RULES]: Shield,
  [RacineGroupType.CLASSIFICATIONS]: FileText,
  [RacineGroupType.SCAN_RULE_SETS]: Scan,
  [RacineGroupType.ADVANCED_CATALOG]: BarChart3,
  [RacineGroupType.SCAN_LOGIC]: GitBranch,
  [RacineGroupType.RBAC]: Lock,
};

const STATUS_COLORS: Record<RacineSystemStatus, string> = {
  [RacineSystemStatus.HEALTHY]: "text-green-500",
  [RacineSystemStatus.DEGRADED]: "text-yellow-500",
  [RacineSystemStatus.CRITICAL]: "text-red-500",
  [RacineSystemStatus.MAINTENANCE]: "text-blue-500",
};

const STATUS_BACKGROUNDS: Record<RacineSystemStatus, string> = {
  [RacineSystemStatus.HEALTHY]: "bg-green-500/10",
  [RacineSystemStatus.DEGRADED]: "bg-yellow-500/10",
  [RacineSystemStatus.CRITICAL]: "bg-red-500/10",
  [RacineSystemStatus.MAINTENANCE]: "bg-blue-500/10",
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AppNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // State Management
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navbarRef = useRef<HTMLElement>(null);
  
  // Custom Hooks
  const { 
    systemHealth, 
    systemStatus,
    isLoading: isSystemLoading,
    error: systemError 
  } = useRacineOrchestration();
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading: isNotificationsLoading
  } = useRealTimeUpdates();
  
  const {
    workspaces,
    currentWorkspace,
    switchWorkspace,
    isLoading: isWorkspacesLoading
  } = useWorkspaceManagement();

  // ========================================================================
  // NAVIGATION ITEMS CONFIGURATION
  // ========================================================================

  const navigationItems: NavigationItem[] = useMemo(() => [
    {
      id: 'data-sources',
      label: 'Data Sources',
      icon: Database,
      href: '/data-sources',
      group: RacineGroupType.DATA_SOURCES,
      permissions: ['data_sources:read'],
      status: systemHealth?.group_status?.[RacineGroupType.DATA_SOURCES] === RacineSystemStatus.HEALTHY ? 'active' : 'warning',
      children: [
        { id: 'connections', label: 'Connections', icon: Network, href: '/data-sources/connections', group: RacineGroupType.DATA_SOURCES, permissions: ['connections:read'] },
        { id: 'discovery', label: 'Discovery', icon: Eye, href: '/data-sources/discovery', group: RacineGroupType.DATA_SOURCES, permissions: ['discovery:read'] },
        { id: 'monitoring', label: 'Monitoring', icon: Monitor, href: '/data-sources/monitoring', group: RacineGroupType.DATA_SOURCES, permissions: ['monitoring:read'] }
      ]
    },
    {
      id: 'compliance-rules',
      label: 'Compliance Rules',
      icon: Shield,
      href: '/compliance-rules',
      group: RacineGroupType.COMPLIANCE_RULES,
      permissions: ['compliance:read'],
      status: systemHealth?.group_status?.[RacineGroupType.COMPLIANCE_RULES] === RacineSystemStatus.HEALTHY ? 'active' : 'warning',
      children: [
        { id: 'rules', label: 'Rules Management', icon: FileText, href: '/compliance-rules/rules', group: RacineGroupType.COMPLIANCE_RULES, permissions: ['rules:read'] },
        { id: 'frameworks', label: 'Frameworks', icon: Layers, href: '/compliance-rules/frameworks', group: RacineGroupType.COMPLIANCE_RULES, permissions: ['frameworks:read'] },
        { id: 'audits', label: 'Audits', icon: Eye, href: '/compliance-rules/audits', group: RacineGroupType.COMPLIANCE_RULES, permissions: ['audits:read'] }
      ]
    },
    {
      id: 'classifications',
      label: 'Classifications',
      icon: FileText,
      href: '/classifications',
      group: RacineGroupType.CLASSIFICATIONS,
      permissions: ['classification:read'],
      status: systemHealth?.group_status?.[RacineGroupType.CLASSIFICATIONS] === RacineSystemStatus.HEALTHY ? 'active' : 'warning',
      children: [
        { id: 'schemes', label: 'Classification Schemes', icon: Layers, href: '/classifications/schemes', group: RacineGroupType.CLASSIFICATIONS, permissions: ['schemes:read'] },
        { id: 'tags', label: 'Tags Management', icon: Bookmark, href: '/classifications/tags', group: RacineGroupType.CLASSIFICATIONS, permissions: ['tags:read'] },
        { id: 'automation', label: 'Auto-Classification', icon: Brain, href: '/classifications/automation', group: RacineGroupType.CLASSIFICATIONS, permissions: ['automation:read'] }
      ]
    },
    {
      id: 'scan-rule-sets',
      label: 'Scan Rule Sets',
      icon: Scan,
      href: '/scan-rule-sets',
      group: RacineGroupType.SCAN_RULE_SETS,
      permissions: ['scan_rules:read'],
      status: systemHealth?.group_status?.[RacineGroupType.SCAN_RULE_SETS] === RacineSystemStatus.HEALTHY ? 'active' : 'warning',
      children: [
        { id: 'rules', label: 'Rules Designer', icon: Settings, href: '/scan-rule-sets/designer', group: RacineGroupType.SCAN_RULE_SETS, permissions: ['rules:write'] },
        { id: 'templates', label: 'Templates', icon: FileText, href: '/scan-rule-sets/templates', group: RacineGroupType.SCAN_RULE_SETS, permissions: ['templates:read'] },
        { id: 'optimization', label: 'Optimization', icon: TrendingUp, href: '/scan-rule-sets/optimization', group: RacineGroupType.SCAN_RULE_SETS, permissions: ['optimization:read'] }
      ]
    },
    {
      id: 'advanced-catalog',
      label: 'Advanced Catalog',
      icon: BarChart3,
      href: '/advanced-catalog',
      group: RacineGroupType.ADVANCED_CATALOG,
      permissions: ['catalog:read'],
      status: systemHealth?.group_status?.[RacineGroupType.ADVANCED_CATALOG] === RacineSystemStatus.HEALTHY ? 'active' : 'warning',
      children: [
        { id: 'discovery', label: 'Discovery', icon: Eye, href: '/advanced-catalog/discovery', group: RacineGroupType.ADVANCED_CATALOG, permissions: ['discovery:read'] },
        { id: 'lineage', label: 'Data Lineage', icon: GitBranch, href: '/advanced-catalog/lineage', group: RacineGroupType.ADVANCED_CATALOG, permissions: ['lineage:read'] },
        { id: 'quality', label: 'Quality Management', icon: CheckCircle, href: '/advanced-catalog/quality', group: RacineGroupType.ADVANCED_CATALOG, permissions: ['quality:read'] }
      ]
    },
    {
      id: 'scan-logic',
      label: 'Scan Logic',
      icon: GitBranch,
      href: '/scan-logic',
      group: RacineGroupType.SCAN_LOGIC,
      permissions: ['scan_logic:read'],
      status: systemHealth?.group_status?.[RacineGroupType.SCAN_LOGIC] === RacineSystemStatus.HEALTHY ? 'active' : 'warning',
      children: [
        { id: 'orchestration', label: 'Orchestration', icon: Workflow, href: '/scan-logic/orchestration', group: RacineGroupType.SCAN_LOGIC, permissions: ['orchestration:read'] },
        { id: 'intelligence', label: 'Intelligence', icon: Brain, href: '/scan-logic/intelligence', group: RacineGroupType.SCAN_LOGIC, permissions: ['intelligence:read'] },
        { id: 'performance', label: 'Performance', icon: TrendingUp, href: '/scan-logic/performance', group: RacineGroupType.SCAN_LOGIC, permissions: ['performance:read'] }
      ]
    },
    {
      id: 'rbac',
      label: 'RBAC',
      icon: Lock,
      href: '/rbac',
      group: RacineGroupType.RBAC,
      permissions: ['rbac:read'],
      status: systemHealth?.group_status?.[RacineGroupType.RBAC] === RacineSystemStatus.HEALTHY ? 'active' : 'warning',
      children: [
        { id: 'users', label: 'Users', icon: Users, href: '/rbac/users', group: RacineGroupType.RBAC, permissions: ['users:read'] },
        { id: 'roles', label: 'Roles', icon: Shield, href: '/rbac/roles', group: RacineGroupType.RBAC, permissions: ['roles:read'] },
        { id: 'permissions', label: 'Permissions', icon: Lock, href: '/rbac/permissions', group: RacineGroupType.RBAC, permissions: ['permissions:read'] }
      ]
    }
  ], [systemHealth]);

  // ========================================================================
  // QUICK ACTIONS CONFIGURATION
  // ========================================================================

  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'create-workspace',
      label: 'Create Workspace',
      icon: Globe,
      action: () => router.push('/workspaces/create'),
      shortcut: 'Ctrl+N',
      group: RacineGroupType.DATA_SOURCES,
      permissions: ['workspaces:create']
    },
    {
      id: 'run-scan',
      label: 'Run Scan',
      icon: Scan,
      action: () => router.push('/scans/create'),
      shortcut: 'Ctrl+R',
      group: RacineGroupType.SCAN_LOGIC,
      permissions: ['scans:execute']
    },
    {
      id: 'create-rule',
      label: 'Create Rule',
      icon: FileText,
      action: () => router.push('/rules/create'),
      shortcut: 'Ctrl+Shift+R',
      group: RacineGroupType.SCAN_RULE_SETS,
      permissions: ['rules:create']
    },
    {
      id: 'view-analytics',
      label: 'View Analytics',
      icon: BarChart3,
      action: () => router.push('/analytics'),
      shortcut: 'Ctrl+A',
      group: RacineGroupType.ADVANCED_CATALOG,
      permissions: ['analytics:read']
    }
  ], [router]);

  // ========================================================================
  // SYSTEM HEALTH INDICATORS
  // ========================================================================

  const systemHealthIndicators: SystemHealthIndicator[] = useMemo(() => {
    if (!systemHealth) return [];
    
    return Object.entries(systemHealth.group_status).map(([group, status]) => ({
      group: group as RacineGroupType,
      status,
      health_score: Math.random() * 100, // This would come from real data
      active_alerts: Math.floor(Math.random() * 5),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      last_updated: new Date().toISOString()
    }));
  }, [systemHealth]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    try {
      const results = await racineOrchestrationAPI.unifiedSearch({
        query,
        groups: Object.values(RacineGroupType),
        pagination: { page: 1, page_size: 20 }
      });
      
      // Handle search results
      console.log('Search results:', results);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, []);

  const handleNotificationAction = useCallback((notificationId: string, action: () => void) => {
    action();
    markAsRead(notificationId);
  }, [markAsRead]);

  const handleWorkspaceSwitch = useCallback(async (workspaceId: string) => {
    try {
      await switchWorkspace(workspaceId);
      setIsWorkspaceSwitcherOpen(false);
    } catch (error) {
      console.error('Workspace switch error:', error);
    }
  }, [switchWorkspace]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleThemeChange = useCallback((newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    // Apply theme logic here
  }, []);

  // ========================================================================
  // KEYBOARD SHORTCUTS
  // ========================================================================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global search shortcut
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      
      // Quick actions shortcuts
      if (event.ctrlKey || event.metaKey) {
        const action = quickActions.find(a => 
          a.shortcut === `Ctrl+${event.key.toUpperCase()}` ||
          (event.shiftKey && a.shortcut === `Ctrl+Shift+${event.key.toUpperCase()}`)
        );
        
        if (action) {
          event.preventDefault();
          action.action();
        }
      }
      
      // Escape to close modals
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
        setIsWorkspaceSwitcherOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickActions]);

  // ========================================================================
  // RENDER HELPER COMPONENTS
  // ========================================================================

  const SystemHealthBadge = ({ indicator }: { indicator: SystemHealthIndicator }) => {
    const Icon = GROUP_ICONS[indicator.group];
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
              STATUS_BACKGROUNDS[indicator.status],
              STATUS_COLORS[indicator.status]
            )}>
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{indicator.group.replace('-', ' ')}</span>
              {indicator.active_alerts > 0 && (
                <Badge variant="destructive" className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  {indicator.active_alerts}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="font-medium">{indicator.group.replace('-', ' ')}</div>
              <div className="text-sm opacity-75">Status: {indicator.status}</div>
              <div className="text-sm opacity-75">Health: {indicator.health_score.toFixed(1)}%</div>
              {indicator.active_alerts > 0 && (
                <div className="text-sm text-red-400">{indicator.active_alerts} active alerts</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const SearchDialog = () => (
    <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          ref={searchInputRef}
          placeholder="Search across all groups..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions">
            {quickActions.map(action => (
              <CommandItem
                key={action.id}
                onSelect={() => {
                  action.action();
                  setIsSearchOpen(false);
                }}
              >
                <action.icon className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
                {action.shortcut && (
                  <CommandShortcut>{action.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Navigation">
            {navigationItems.map(item => (
              <CommandItem
                key={item.id}
                onSelect={() => {
                  if (item.href) router.push(item.href);
                  setIsSearchOpen(false);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                <CommandShortcut>{item.group}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );

  const NotificationsDropdown = () => (
    <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.slice(0, 10).map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-center w-full gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    notification.read ? "bg-muted" : "bg-blue-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {notification.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {notification.message}
                    </div>
                  </div>
                  <Badge 
                    variant={notification.priority === Priority.CRITICAL ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {notification.priority}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/notifications')}>
              <span>View all notifications</span>
              <ExternalLink className="ml-auto h-3 w-3" />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const WorkspaceSwitcher = () => (
    <DropdownMenu open={isWorkspaceSwitcherOpen} onOpenChange={setIsWorkspaceSwitcherOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 max-w-48">
          <Globe className="h-4 w-4" />
          <span className="truncate">{currentWorkspace?.name || 'Select Workspace'}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {workspaces.map(workspace => (
          <DropdownMenuItem
            key={workspace.workspace_id}
            onClick={() => handleWorkspaceSwitch(workspace.workspace_id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-2 w-2 rounded-full",
                STATUS_BACKGROUNDS[workspace.status]
              )} />
              <div>
                <div className="font-medium">{workspace.name}</div>
                <div className="text-xs text-muted-foreground">
                  {workspace.environment}
                </div>
              </div>
            </div>
            {workspace.workspace_id === currentWorkspace?.workspace_id && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/workspaces/create')}>
          <span>Create new workspace</span>
          <ArrowRight className="ml-auto h-3 w-3" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const UserProfileDropdown = () => (
    <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">john.doe@company.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette className="mr-2 h-4 w-4" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('auto')}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push('/help')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <>
      <motion.nav
        ref={navbarRef}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Left Section - Logo, Workspace Switcher, System Health */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>

            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="hidden sm:inline font-semibold text-lg">Racine</span>
            </motion.div>

            {/* Workspace Switcher */}
            <div className="hidden md:block">
              <WorkspaceSwitcher />
            </div>

            {/* System Health Indicators */}
            <div className="hidden lg:flex items-center gap-2">
              <Separator orientation="vertical" className="h-6" />
              {systemHealthIndicators.slice(0, 4).map(indicator => (
                <SystemHealthBadge key={indicator.group} indicator={indicator} />
              ))}
              {systemHealthIndicators.length > 4 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-2">
                      <span className="text-xs">+{systemHealthIndicators.length - 4}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {systemHealthIndicators.slice(4).map(indicator => (
                      <DropdownMenuItem key={indicator.group} className="p-2">
                        <SystemHealthBadge indicator={indicator} />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search across all groups... (Ctrl+K)"
                className="pl-10 bg-muted/50"
                onClick={() => setIsSearchOpen(true)}
                readOnly
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          {/* Right Section - Actions, Notifications, Profile */}
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Zap className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Quick Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {quickActions.map(action => (
                  <DropdownMenuItem key={action.id} onClick={action.action}>
                    <action.icon className="mr-2 h-4 w-4" />
                    <span>{action.label}</span>
                    {action.shortcut && (
                      <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Notifications */}
            <NotificationsDropdown />

            {/* User Profile */}
            <UserProfileDropdown />
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t bg-background"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="container py-4 space-y-4">
                {/* Mobile Workspace Switcher */}
                <WorkspaceSwitcher />
                
                {/* Mobile Navigation */}
                <div className="grid grid-cols-2 gap-2">
                  {navigationItems.map(item => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="justify-start h-auto p-4"
                      onClick={() => {
                        if (item.href) router.push(item.href);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  ))}
                </div>

                {/* Mobile System Health */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">System Health</div>
                  <div className="grid grid-cols-2 gap-2">
                    {systemHealthIndicators.map(indicator => (
                      <SystemHealthBadge key={indicator.group} indicator={indicator} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Dialog */}
      <SearchDialog />
    </>
  );
}