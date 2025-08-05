"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Settings, User, Bell, Grid3X3, BarChart3, Workflow, 
  Database, Shield, Brain, Clock, Users, FileText, Zap, Activity,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Plus, Filter,
  TrendingUp, AlertTriangle, CheckCircle, Globe, Cpu, Network,
  Eye, Edit3, Share2, Download, Upload, RefreshCw, Play, Pause,
  MoreVertical, Command, Menu, X, Star, Bookmark, Target, Map, 
  Layers, GitBranch, Sparkles, Lightbulb, MessageSquare, Video,
  Calendar, Mail, Home, Compass, Building2, Cog, HelpCircle,
  Folder, FolderOpen, Files, Server, Table, Workflow2, Scan,
  Tags, Lock, UserCheck, Gauge, LineChart, PieChart, BarChart2,
  TreePine, Boxes, Factory, Zap as ZapIcon, Wrench, Microscope
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Import types
import { 
  RacineView, 
  Workspace, 
  SystemHealth, 
  IntegrationStatus, 
  QuickAction 
} from '../../types/racine.types'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  view: RacineView
  badge?: {
    text: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  description?: string
  shortcut?: string
  children?: NavigationItem[]
  permissions?: string[]
  status?: 'active' | 'inactive' | 'warning' | 'error'
  metadata?: Record<string, any>
}

interface WorkspaceItem {
  id: string
  name: string
  description?: string
  status: 'active' | 'archived' | 'draft'
  lastAccessed: string
  members: number
  icon?: string
  color?: string
}

interface AppSideBarProps {
  currentView: RacineView
  onViewChange: (view: RacineView) => void
  collapsed: boolean
  onToggle: () => void
  workspaces: Workspace[]
  activeWorkspace?: Workspace
  quickActions: QuickAction[]
  systemHealth: SystemHealth
  integrationStatus: IntegrationStatus
  userPermissions: string[]
  className?: string
}

export const AppSideBar: React.FC<AppSideBarProps> = ({
  currentView,
  onViewChange,
  collapsed,
  onToggle,
  workspaces = [],
  activeWorkspace,
  quickActions = [],
  systemHealth,
  integrationStatus,
  userPermissions = [],
  className
}) => {
  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['core', 'governance']))
  const [favoriteViews, setFavoriteViews] = useState<Set<string>>(new Set(['dashboard', 'workspace']))
  const [recentViews, setRecentViews] = useState<RacineView[]>(['dashboard', 'workflow', 'pipeline'])

  // Navigation structure with dynamic grouping
  const navigationItems = useMemo<NavigationItem[]>(() => {
    const coreItems: NavigationItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: BarChart3,
        view: 'dashboard',
        description: 'Overview and analytics across all systems',
        shortcut: 'Ctrl+1'
      },
      {
        id: 'workspace',
        label: 'Workspaces',
        icon: Folder,
        view: 'workspace',
        badge: workspaces.length > 0 ? { text: workspaces.length.toString(), variant: 'secondary' } : undefined,
        description: 'Manage and switch between workspaces',
        shortcut: 'Ctrl+2'
      },
      {
        id: 'workflow',
        label: 'Workflows',
        icon: Workflow,
        view: 'workflow',
        description: 'Design and execute data workflows',
        shortcut: 'Ctrl+3'
      },
      {
        id: 'pipeline',
        label: 'Pipelines',
        icon: GitBranch,
        view: 'pipeline',
        description: 'Orchestrate data pipelines across systems',
        shortcut: 'Ctrl+4'
      }
    ]

    const intelligenceItems: NavigationItem[] = [
      {
        id: 'ai-assistant',
        label: 'AI Assistant',
        icon: Brain,
        view: 'ai-assistant',
        badge: { text: 'AI', variant: 'default' },
        description: 'Intelligent guidance and automation',
        shortcut: 'Ctrl+Shift+A'
      },
      {
        id: 'activity-tracker',
        label: 'Activity Tracker',
        icon: Activity,
        view: 'activity-tracker',
        description: 'Monitor and analyze system activities',
        shortcut: 'Ctrl+Shift+T'
      },
      {
        id: 'collaboration',
        label: 'Collaboration',
        icon: Users,
        view: 'collaboration',
        description: 'Team collaboration and sharing',
        shortcut: 'Ctrl+Shift+C'
      }
    ]

    const governanceItems: NavigationItem[] = [
      {
        id: 'data-sources',
        label: 'Data Sources',
        icon: Database,
        view: 'data-sources',
        description: 'Manage and connect data sources',
        status: integrationStatus.dataSources?.status || 'active'
      },
      {
        id: 'scan-rule-sets',
        label: 'Scan Rule Sets',
        icon: Scan,
        view: 'scan-rule-sets',
        description: 'Configure and manage scan rules',
        status: integrationStatus.scanRuleSets?.status || 'active'
      },
      {
        id: 'advanced-catalog',
        label: 'Data Catalog',
        icon: Table,
        view: 'advanced-catalog',
        description: 'Explore and manage data catalog',
        status: integrationStatus.catalog?.status || 'active'
      },
      {
        id: 'scan-logic',
        label: 'Scan Logic',
        icon: Microscope,
        view: 'scan-logic',
        description: 'Advanced scanning and orchestration',
        status: integrationStatus.scanLogic?.status || 'active'
      },
      {
        id: 'classifications',
        label: 'Classifications',
        icon: Tags,
        view: 'classifications',
        description: 'Data classification and tagging',
        status: integrationStatus.classifications?.status || 'active'
      },
      {
        id: 'compliance-rules',
        label: 'Compliance Rules',
        icon: Shield,
        view: 'compliance-rules',
        description: 'Manage compliance and governance rules',
        status: integrationStatus.compliance?.status || 'active'
      },
      {
        id: 'rbac-system',
        label: 'RBAC System',
        icon: Lock,
        view: 'rbac-system',
        description: 'Role-based access control',
        status: integrationStatus.rbac?.status || 'active'
      }
    ]

    const settingsItems: NavigationItem[] = [
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        view: 'settings',
        description: 'User and system settings'
      }
    ]

    return [
      ...coreItems,
      ...intelligenceItems,
      ...governanceItems,
      ...settingsItems
    ]
  }, [workspaces.length, integrationStatus])

  // Group navigation items
  const navigationGroups = useMemo(() => {
    const groups = [
      {
        id: 'favorites',
        label: 'Favorites',
        icon: Star,
        items: navigationItems.filter(item => favoriteViews.has(item.id)),
        collapsible: true
      },
      {
        id: 'recent',
        label: 'Recent',
        icon: Clock,
        items: recentViews.slice(0, 5).map(viewId => 
          navigationItems.find(item => item.view === viewId)
        ).filter(Boolean) as NavigationItem[],
        collapsible: true
      },
      {
        id: 'core',
        label: 'Core Features',
        icon: Grid3X3,
        items: navigationItems.filter(item => 
          ['dashboard', 'workspace', 'workflow', 'pipeline'].includes(item.id)
        ),
        collapsible: true
      },
      {
        id: 'intelligence',
        label: 'Intelligence & Analytics',
        icon: Brain,
        items: navigationItems.filter(item => 
          ['ai-assistant', 'activity-tracker', 'collaboration'].includes(item.id)
        ),
        collapsible: true
      },
      {
        id: 'governance',
        label: 'Data Governance',
        icon: Shield,
        items: navigationItems.filter(item => 
          ['data-sources', 'scan-rule-sets', 'advanced-catalog', 'scan-logic', 'classifications', 'compliance-rules', 'rbac-system'].includes(item.id)
        ),
        collapsible: true
      },
      {
        id: 'settings',
        label: 'Configuration',
        icon: Settings,
        items: navigationItems.filter(item => item.id === 'settings'),
        collapsible: false
      }
    ].filter(group => group.items.length > 0)

    return groups
  }, [navigationItems, favoriteViews, recentViews])

  // Filtered items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return navigationItems

    const query = searchQuery.toLowerCase()
    return navigationItems.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    )
  }, [navigationItems, searchQuery])

  // Handle view changes and update recent views
  const handleViewChange = useCallback((view: RacineView) => {
    onViewChange(view)
    
    // Update recent views
    setRecentViews(prev => {
      const newRecent = [view, ...prev.filter(v => v !== view)].slice(0, 5)
      return newRecent
    })
  }, [onViewChange])

  // Toggle group expansion
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId)
      } else {
        newExpanded.add(groupId)
      }
      return newExpanded
    })
  }, [])

  // Toggle favorite status
  const toggleFavorite = useCallback((itemId: string) => {
    setFavoriteViews(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId)
      } else {
        newFavorites.add(itemId)
      }
      return newFavorites
    })
  }, [])

  // Render navigation item
  const renderNavigationItem = useCallback((item: NavigationItem) => {
    const isActive = currentView === item.view
    const isFavorite = favoriteViews.has(item.id)

    return (
      <Tooltip key={item.id} delayDuration={collapsed ? 500 : 0}>
        <TooltipTrigger asChild>
          <div className="relative group">
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleViewChange(item.view)}
              className={cn(
                "w-full justify-start h-9 px-2 mb-1 relative overflow-hidden",
                collapsed && "justify-center px-2",
                isActive && "bg-secondary text-secondary-foreground font-medium",
                !isActive && "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                item.status === 'warning' && "border-l-2 border-yellow-500",
                item.status === 'error' && "border-l-2 border-red-500"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 flex-shrink-0",
                collapsed ? "" : "mr-3"
              )} />
              
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">
                    {item.label}
                  </span>
                  
                  {item.badge && (
                    <Badge 
                      variant={item.badge.variant} 
                      className="ml-2 h-5 text-xs px-1.5"
                    >
                      {item.badge.text}
                    </Badge>
                  )}
                </>
              )}

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Button>

            {/* Favorite toggle */}
            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(item.id)
                }}
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                  isFavorite && "opacity-100"
                )}
              >
                <Star className={cn(
                  "h-3 w-3",
                  isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                )} />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        
        {collapsed && (
          <TooltipContent side="right" className="flex flex-col gap-1">
            <span className="font-medium">{item.label}</span>
            {item.description && (
              <span className="text-xs text-muted-foreground">{item.description}</span>
            )}
            {item.shortcut && (
              <span className="text-xs text-muted-foreground">{item.shortcut}</span>
            )}
          </TooltipContent>
        )}
      </Tooltip>
    )
  }, [currentView, collapsed, favoriteViews, handleViewChange, toggleFavorite])

  // Render navigation group
  const renderNavigationGroup = useCallback((group: any) => {
    const isExpanded = expandedGroups.has(group.id)
    
    if (group.items.length === 0) return null

    return (
      <div key={group.id} className="mb-2">
        {group.collapsible ? (
          <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(group.id)}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start h-8 px-2 mb-1 font-medium text-xs uppercase tracking-wide",
                  collapsed && "justify-center px-2"
                )}
              >
                <group.icon className={cn(
                  "h-3 w-3 flex-shrink-0",
                  collapsed ? "" : "mr-2"
                )} />
                
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown className={cn(
                      "h-3 w-3 transition-transform",
                      isExpanded && "transform rotate-180"
                    )} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-0">
              <div className={cn("ml-2 pl-2 border-l border-border", collapsed && "ml-0 pl-0 border-l-0")}>
                {group.items.map(renderNavigationItem)}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div>
            {!collapsed && (
              <div className="px-2 py-1 mb-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <group.icon className="h-3 w-3" />
                  {group.label}
                </span>
              </div>
            )}
            <div className={cn("space-y-0", !collapsed && "ml-2 pl-2 border-l border-border")}>
              {group.items.map(renderNavigationItem)}
            </div>
          </div>
        )}
      </div>
    )
  }, [expandedGroups, collapsed, toggleGroup, renderNavigationItem])

  return (
    <motion.aside
      className={cn(
        "flex flex-col h-full bg-muted/30 border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center gap-2 p-4 border-b border-border",
        collapsed && "justify-center px-2"
      )}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2 flex-1">
              <Compass className="h-5 w-5 text-primary" />
              <span className="font-semibold">Navigation</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8 text-sm"
            />
          </div>
        </div>
      )}

      {/* Active Workspace */}
      {!collapsed && activeWorkspace && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {activeWorkspace.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{activeWorkspace.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {activeWorkspace.description || 'Active workspace'}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewChange('workspace')}>
                  <Folder className="mr-2 h-4 w-4" />
                  Switch Workspace
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Workspace Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Navigation Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {searchQuery.trim() ? (
            // Search results
            <div className="space-y-0">
              {filteredItems.length > 0 ? (
                filteredItems.map(renderNavigationItem)
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          ) : (
            // Grouped navigation
            <div className="space-y-2">
              {navigationGroups.map(renderNavigationGroup)}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {!collapsed && quickActions.length > 0 && (
        <div className="p-4 border-t border-border">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Quick Actions
          </div>
          <div className="space-y-1">
            {quickActions.slice(0, 3).map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                onClick={action.action}
                className="w-full justify-start h-8"
              >
                <action.icon className="h-3 w-3 mr-2" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* System Status */}
      <div className={cn(
        "p-4 border-t border-border",
        collapsed && "px-2"
      )}>
        {!collapsed ? (
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              System Status
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Health</span>
                <div className="flex items-center gap-1">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    systemHealth ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-xs">
                    {systemHealth ? "Good" : "Issues"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Groups</span>
                <span className="text-xs">
                  {Object.values(integrationStatus).filter(s => s?.status === 'active').length}/7
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className={cn(
              "h-3 w-3 rounded-full",
              systemHealth ? "bg-green-500" : "bg-red-500"
            )} />
          </div>
        )}
      </div>
    </motion.aside>
  )
}

export default AppSideBar