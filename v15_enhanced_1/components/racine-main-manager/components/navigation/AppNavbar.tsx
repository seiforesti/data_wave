'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  ChevronDown,
  Menu,
  Zap,
  Activity,
  Shield,
  Database,
  GitBranch,
  Users,
  LayoutDashboard,
  Workflow,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Command
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// Types
import {
  NavigationContext,
  CrossGroupState,
  RBACPermissions,
  SystemHealth,
  ViewMode,
  GroupConfiguration
} from '../../types/racine-core.types'

// Constants
import { VIEW_MODES, SUPPORTED_GROUPS } from '../../constants/cross-group-configs'

/**
 * AppNavbar - Intelligent Global Navigation System
 * 
 * Features:
 * - Adaptive navigation based on user roles and permissions
 * - Real-time system health monitoring
 * - Global search with cross-group intelligent results
 * - Context-aware breadcrumbs and quick actions
 * - Multi-workspace navigation
 * - Notification center integration
 * - Customizable layout controls
 */

interface AppNavbarProps {
  userRole: string
  permissions: RBACPermissions
  currentContext: NavigationContext
  crossGroupState: CrossGroupState
  systemHealth: {
    status: SystemHealth
    metrics: any
    lastCheck: Date
  }
  onNavigationChange: (path: string, context?: any) => void
  onSearch: (query: string) => void
  onWorkspaceSwitch: (workspaceId: string) => void
  onViewModeChange: (viewMode: ViewMode) => void
  className?: string
}

const AppNavbar: React.FC<AppNavbarProps> = ({
  userRole,
  permissions,
  currentContext,
  crossGroupState,
  systemHealth,
  onNavigationChange,
  onSearch,
  onWorkspaceSwitch,
  onViewModeChange,
  className
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [systemStatusOpen, setSystemStatusOpen] = useState(false)

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const connectedGroupsCount = crossGroupState.connectedGroups.length
  const totalGroups = SUPPORTED_GROUPS.length
  const connectionHealth = connectedGroupsCount === totalGroups ? 'healthy' : 'warning'

  const systemHealthIcon = useMemo(() => {
    switch (systemHealth.status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />
      case 'maintenance': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }, [systemHealth.status])

  const availableViews = useMemo(() => {
    return Object.entries(VIEW_MODES).filter(([viewMode, config]) => {
      // Filter views based on user permissions
      switch (viewMode) {
        case 'dashboard':
          return permissions.features?.customDashboards || permissions.global?.systemMonitoring
        case 'workflows':
          return permissions.global?.crossGroupOrchestration
        case 'pipelines':
          return permissions.global?.crossGroupOrchestration
        case 'collaboration':
          return permissions.features?.realTimeCollaboration
        case 'profile':
          return true // Always available
        case 'settings':
          return permissions.global?.systemAdmin || permissions.global?.workspaceManagement
        default:
          return true
      }
    })
  }, [permissions])

  const quickActions = useMemo(() => {
    const actions = []
    
    if (permissions.global?.crossGroupOrchestration) {
      actions.push({
        id: 'create-workflow',
        label: 'Create Workflow',
        icon: GitBranch,
        shortcut: '⌘+W',
        action: () => onViewModeChange('workflows')
      })
      actions.push({
        id: 'create-pipeline',
        label: 'Create Pipeline',
        icon: Workflow,
        shortcut: '⌘+P',
        action: () => onViewModeChange('pipelines')
      })
    }

    if (permissions.features?.customDashboards) {
      actions.push({
        id: 'create-dashboard',
        label: 'Create Dashboard',
        icon: LayoutDashboard,
        shortcut: '⌘+D',
        action: () => onNavigationChange('/racine/dashboards/create')
      })
    }

    if (permissions.global?.systemAdmin) {
      actions.push({
        id: 'system-settings',
        label: 'System Settings',
        icon: Settings,
        shortcut: '⌘+,',
        action: () => onViewModeChange('settings')
      })
    }

    return actions
  }, [permissions, onViewModeChange, onNavigationChange])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.length > 2) {
      onSearch(query)
    }
  }, [onSearch])

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }, [searchQuery, onSearch])

  const handleViewChange = useCallback((viewMode: ViewMode) => {
    onViewModeChange(viewMode)
    onNavigationChange(`/racine/${viewMode}`)
  }, [onViewModeChange, onNavigationChange])

  const handleGroupNavigation = useCallback((groupId: string) => {
    const group = crossGroupState.connectedGroups.find(g => g.id === groupId)
    if (group) {
      onNavigationChange(`/racine/groups/${groupId}`, { activeGroup: groupId })
    }
  }, [crossGroupState.connectedGroups, onNavigationChange])

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault()
            document.getElementById('global-search')?.focus()
            break
          case '/':
            e.preventDefault()
            document.getElementById('global-search')?.focus()
            break
          default:
            // Handle quick action shortcuts
            quickActions.forEach(action => {
              if (action.shortcut && e.key === action.shortcut.split('+')[1]?.toLowerCase()) {
                e.preventDefault()
                action.action()
              }
            })
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [quickActions])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <header className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}>
        <div className="container flex h-16 items-center justify-between">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center space-x-4">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-none">Racine Manager</span>
                <span className="text-xs text-muted-foreground leading-none">Data Governance</span>
              </div>
            </div>

            {/* View Mode Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  {React.createElement(
                    VIEW_MODES[currentContext.currentPath.split('/')[2] as ViewMode]?.icon ? 
                    eval(VIEW_MODES[currentContext.currentPath.split('/')[2] as ViewMode]?.icon) : 
                    LayoutDashboard, 
                    { className: "h-4 w-4" }
                  )}
                  <span className="hidden sm:inline">
                    {VIEW_MODES[currentContext.currentPath.split('/')[2] as ViewMode]?.label || 'Dashboard'}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Switch View</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableViews.map(([viewMode, config]) => (
                  <DropdownMenuItem
                    key={viewMode}
                    onClick={() => handleViewChange(viewMode as ViewMode)}
                    className="gap-2"
                  >
                    {React.createElement(eval(config.icon), { className: "h-4 w-4" })}
                    <span>{config.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Groups Navigation */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Database className="h-4 w-4" />
                  <span className="hidden md:inline">Groups</span>
                  <Badge variant="secondary" className="text-xs">
                    {connectedGroupsCount}/{totalGroups}
                  </Badge>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Connected Groups</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {crossGroupState.connectedGroups.map((group) => (
                  <DropdownMenuItem
                    key={group.id}
                    onClick={() => handleGroupNavigation(group.id)}
                    className="gap-2"
                  >
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      group.healthStatus === 'healthy' ? 'bg-green-500' :
                      group.healthStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    )} />
                    <span>{group.displayName}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      v{group.version}
                    </Badge>
                  </DropdownMenuItem>
                ))}
                {crossGroupState.connectedGroups.length === 0 && (
                  <DropdownMenuItem disabled>
                    <span className="text-muted-foreground">No groups connected</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center Section - Global Search */}
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="global-search"
                type="search"
                placeholder="Search across all groups... (⌘K)"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="pl-10 pr-4 w-full"
              />
              {searchFocused && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              )}
            </form>
          </div>

          {/* Right Section - Actions and User */}
          <div className="flex items-center space-x-2">
            {/* System Health Indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSystemStatusOpen(!systemStatusOpen)}
                  className="gap-2"
                >
                  {systemHealthIcon}
                  <span className="hidden lg:inline text-sm">
                    {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium">System Health: {systemHealth.status}</p>
                  <p className="text-xs">Groups: {connectedGroupsCount}/{totalGroups} connected</p>
                  <p className="text-xs">Last check: {systemHealth.lastCheck.toLocaleTimeString()}</p>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Quick Actions */}
            <DropdownMenu open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Command className="h-4 w-4" />
                  <span className="sr-only">Quick Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {quickActions.map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={action.action}
                    className="gap-2"
                  >
                    <action.icon className="h-4 w-4" />
                    <span>{action.label}</span>
                    {action.shortcut && (
                      <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        {action.shortcut}
                      </kbd>
                    )}
                  </DropdownMenuItem>
                ))}
                {quickActions.length === 0 && (
                  <DropdownMenuItem disabled>
                    <span className="text-muted-foreground">No actions available</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications {notificationCount > 0 && `(${notificationCount})`}</p>
              </TooltipContent>
            </Tooltip>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="User" />
                    <AvatarFallback>
                      {userRole.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">User Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Role: {userRole}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleViewChange('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Globe className="mr-2 h-4 w-4" />
                    <span>Workspaces</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => onWorkspaceSwitch('default')}>
                      Default Workspace
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onWorkspaceSwitch('team')}>
                      Team Workspace
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigationChange('/racine/workspaces/create')}>
                      Create Workspace
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* System Status Overlay */}
        <AnimatePresence>
          {systemStatusOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 border-b bg-background/95 backdrop-blur p-4"
            >
              <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">System Status</h4>
                    <div className="flex items-center gap-2">
                      {systemHealthIcon}
                      <span className="text-sm">{systemHealth.status}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Groups</h4>
                    <div className="text-sm">
                      {connectedGroupsCount} of {totalGroups} connected
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Last Check</h4>
                    <div className="text-sm">
                      {systemHealth.lastCheck.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </TooltipProvider>
  )
}

export default AppNavbar