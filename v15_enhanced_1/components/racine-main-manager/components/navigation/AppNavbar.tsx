"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Settings, User, Bell, Grid3X3, BarChart3, Workflow, 
  Database, Shield, Brain, Clock, Users, FileText, Zap, Activity,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Plus, Filter,
  TrendingUp, AlertTriangle, CheckCircle, Globe, Cpu, Network,
  Eye, Edit3, Share2, Download, Upload, RefreshCw, Play, Pause,
  MoreVertical, Command, Menu, X, ChevronDown, Star, Bookmark,
  Target, Map, Layers, GitBranch, Workflow as WorkflowIcon,
  Sparkles, Lightbulb, MessageSquare, Video, Calendar, Mail,
  Home, Compass, Building2, Cog, HelpCircle, LogOut, Moon, Sun,
  Palette, Mic, Monitor, Smartphone, Tablet, Keyboard, MousePointer
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Import types
import { RacineView, UserPreferences, SystemHealth, ConnectionStatus, AIAssistant } from '../../types/racine.types'

// Import services
import { notificationService } from '../../services/notification.service'
import { searchService } from '../../services/search.service'
import { themeService } from '../../services/theme.service'

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  actions?: Array<{
    label: string
    action: () => void
    variant?: 'default' | 'destructive' | 'outline'
  }>
  source?: string
  groupId?: string
}

interface SearchSuggestion {
  id: string
  title: string
  description: string
  type: 'workspace' | 'workflow' | 'pipeline' | 'data-source' | 'rule' | 'user' | 'group'
  icon: React.ComponentType<any>
  url: string
  metadata?: Record<string, any>
}

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  shortcut?: string
  action: () => void
  category: 'navigation' | 'creation' | 'analysis' | 'settings'
  permissions?: string[]
}

interface AppNavbarProps {
  currentView: RacineView
  onViewChange: (view: RacineView) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearch: (query: string) => void
  notifications: Notification[]
  userPreferences: UserPreferences
  systemHealth: SystemHealth
  connectionStatus: ConnectionStatus
  onToggleFullscreen: () => void
  onToggleSidebar: () => void
  onShowCommandPalette: () => void
  aiAssistant: AIAssistant
  className?: string
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onSearch,
  notifications = [],
  userPreferences,
  systemHealth,
  connectionStatus,
  onToggleFullscreen,
  onToggleSidebar,
  onShowCommandPalette,
  aiAssistant,
  className
}) => {
  // Local state
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSystemStatus, setShowSystemStatus] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [theme, setTheme] = useState(userPreferences?.theme || 'auto')
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  
  // Toast for notifications
  const { toast } = useToast()

  // Unread notifications count
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  )

  // Critical notifications count
  const criticalCount = useMemo(() => 
    notifications.filter(n => !n.read && n.priority === 'critical').length, 
    [notifications]
  )

  // System health status
  const systemStatus = useMemo(() => {
    const { cpu, memory, storage, network } = systemHealth
    const avgHealth = (cpu.usage + memory.usage + storage.usage + network.latency) / 4
    
    if (avgHealth < 70) return 'healthy'
    if (avgHealth < 85) return 'warning'
    return 'critical'
  }, [systemHealth])

  // Quick actions based on user permissions and context
  const quickActions = useMemo<QuickAction[]>(() => [
    {
      id: 'new-workspace',
      label: 'New Workspace',
      icon: Plus,
      shortcut: 'Ctrl+Shift+W',
      action: () => onViewChange('workspace'),
      category: 'creation'
    },
    {
      id: 'new-workflow',
      label: 'New Workflow',
      icon: WorkflowIcon,
      shortcut: 'Ctrl+Shift+F',
      action: () => onViewChange('workflow'),
      category: 'creation'
    },
    {
      id: 'new-pipeline',
      label: 'New Pipeline',
      icon: GitBranch,
      shortcut: 'Ctrl+Shift+P',
      action: () => onViewChange('pipeline'),
      category: 'creation'
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: Brain,
      shortcut: 'Ctrl+Shift+A',
      action: () => onViewChange('ai-assistant'),
      category: 'analysis'
    },
    {
      id: 'global-search',
      label: 'Global Search',
      icon: Search,
      shortcut: 'Ctrl+K',
      action: onShowCommandPalette,
      category: 'navigation'
    },
    {
      id: 'activity-tracker',
      label: 'Activity Tracker',
      icon: Activity,
      shortcut: 'Ctrl+Shift+T',
      action: () => onViewChange('activity-tracker'),
      category: 'analysis'
    }
  ], [onViewChange, onShowCommandPalette])

  // Context-aware breadcrumbs
  useEffect(() => {
    const generateBreadcrumbs = () => {
      const crumbs = ['PurSight']
      
      switch (currentView) {
        case 'dashboard':
          crumbs.push('Dashboard')
          break
        case 'workspace':
          crumbs.push('Workspaces')
          break
        case 'workflow':
          crumbs.push('Workflows')
          break
        case 'pipeline':
          crumbs.push('Pipelines')
          break
        case 'ai-assistant':
          crumbs.push('AI Assistant')
          break
        case 'activity-tracker':
          crumbs.push('Activity Tracker')
          break
        case 'collaboration':
          crumbs.push('Collaboration')
          break
        case 'settings':
          crumbs.push('Settings')
          break
        case 'scan-rule-sets':
          crumbs.push('Scan Rule Sets')
          break
        case 'advanced-catalog':
          crumbs.push('Data Catalog')
          break
        case 'scan-logic':
          crumbs.push('Scan Logic')
          break
        case 'rbac-system':
          crumbs.push('RBAC System')
          break
        case 'data-sources':
          crumbs.push('Data Sources')
          break
        case 'classifications':
          crumbs.push('Classifications')
          break
        case 'compliance-rules':
          crumbs.push('Compliance Rules')
          break
        default:
          crumbs.push('Unknown')
      }
      
      setBreadcrumbs(crumbs)
    }

    generateBreadcrumbs()
  }, [currentView])

  // Search with debouncing and suggestions
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim().length > 2) {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await searchService.getSuggestions(searchQuery)
          setSearchSuggestions(suggestions)
        } catch (error) {
          console.error('Search suggestions error:', error)
        } finally {
          setIsSearching(false)
        }
      }, 300)
    } else {
      setSearchSuggestions([])
      setIsSearching(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Handle search submission
  const handleSearchSubmit = useCallback((query: string = searchQuery) => {
    if (query.trim()) {
      onSearch(query.trim())
      setIsSearchFocused(false)
      setSearchSuggestions([])
      
      // Track search activity
      notificationService.trackActivity({
        type: 'search',
        action: 'global_search',
        data: { query: query.trim() },
        timestamp: new Date().toISOString()
      })
    }
  }, [searchQuery, onSearch])

  // Handle notification actions
  const handleNotificationAction = useCallback((notification: Notification, actionIndex: number) => {
    const action = notification.actions?.[actionIndex]
    if (action) {
      action.action()
      
      // Mark notification as read
      notificationService.markAsRead(notification.id)
    }
  }, [])

  // Handle theme changes
  const handleThemeChange = useCallback((newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme)
    themeService.setTheme(newTheme)
    
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme}`,
    })
  }, [toast])

  // AI Assistant suggestions
  const aiSuggestions = useMemo(() => {
    if (!aiAssistant?.suggestions) return []
    
    return aiAssistant.suggestions.slice(0, 3).map(suggestion => ({
      id: suggestion.id,
      text: suggestion.text,
      action: suggestion.action,
      confidence: suggestion.confidence
    }))
  }, [aiAssistant])

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left Section - Logo, Breadcrumbs, and Navigation */}
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          {/* Logo and Breadcrumbs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Database className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">PurSight</span>
            </div>
            
            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="h-3 w-3" />}
                  <span className={cn(
                    "hover:text-foreground transition-colors cursor-pointer",
                    index === breadcrumbs.length - 1 && "text-foreground font-medium"
                  )}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <Popover open={isSearchFocused && (searchSuggestions.length > 0 || isSearching)}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search workspaces, workflows, data..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit()
                    } else if (e.key === 'Escape') {
                      setIsSearchFocused(false)
                      searchInputRef.current?.blur()
                    }
                  }}
                  className="pl-10 pr-12 h-10 bg-muted/50 border-muted focus:bg-background"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {isSearching && (
                    <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
                  )}
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              </div>
            </PopoverTrigger>
            
            <PopoverContent 
              className="w-[400px] p-0 mt-2" 
              align="center"
              side="bottom"
            >
              <ScrollArea className="max-h-96">
                <div className="p-2 space-y-1">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-muted-foreground border-t-transparent rounded-full" />
                      <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                    </div>
                  ) : (
                    <>
                      {searchSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                          onClick={() => handleSearchSubmit(suggestion.title)}
                        >
                          <suggestion.icon className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{suggestion.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{suggestion.description}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.type}
                          </Badge>
                        </div>
                      ))}
                      
                      {searchSuggestions.length === 0 && searchQuery.trim().length > 2 && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No results found for "{searchQuery}"
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right Section - Actions, Notifications, and User Menu */}
        <div className="flex items-center gap-2">
          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                  <Sparkles className="h-4 w-4" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-purple-500 rounded-full animate-pulse" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Suggestions
                  </h4>
                  {aiSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-2 rounded-md border hover:bg-muted cursor-pointer"
                      onClick={suggestion.action}
                    >
                      <div className="text-sm">{suggestion.text}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Confidence: {Math.round(suggestion.confidence * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Quick actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickActions.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={action.action}
                  className="flex items-center gap-2"
                >
                  <action.icon className="h-4 w-4" />
                  <span className="flex-1">{action.label}</span>
                  {action.shortcut && (
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {action.shortcut}
                    </kbd>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* System Status */}
          <Popover open={showSystemStatus} onOpenChange={setShowSystemStatus}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                <Cpu className={cn(
                  "h-4 w-4",
                  systemStatus === 'healthy' && "text-green-500",
                  systemStatus === 'warning' && "text-yellow-500",
                  systemStatus === 'critical' && "text-red-500"
                )} />
                {systemStatus !== 'healthy' && (
                  <div className={cn(
                    "absolute -top-1 -right-1 h-2 w-2 rounded-full",
                    systemStatus === 'warning' && "bg-yellow-500",
                    systemStatus === 'critical' && "bg-red-500 animate-pulse"
                  )} />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  System Health
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span>{systemHealth.cpu.usage}%</span>
                    </div>
                    <Progress value={systemHealth.cpu.usage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span>{systemHealth.memory.usage}%</span>
                    </div>
                    <Progress value={systemHealth.memory.usage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Usage</span>
                      <span>{systemHealth.storage.usage}%</span>
                    </div>
                    <Progress value={systemHealth.storage.usage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Network Latency</span>
                      <span>{systemHealth.network.latency}ms</span>
                    </div>
                    <Progress value={Math.min(systemHealth.network.latency / 10, 100)} className="h-2" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    connectionStatus.connected ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-sm text-muted-foreground">
                    {connectionStatus.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Notifications */}
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    className={cn(
                      "absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center",
                      criticalCount > 0 ? "bg-red-500 animate-pulse" : "bg-blue-500"
                    )}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Notifications</h4>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => notificationService.markAllAsRead()}
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>
              
              <ScrollArea className="max-h-96">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 rounded-md border transition-colors",
                          !notification.read && "bg-muted/50",
                          notification.priority === 'critical' && "border-red-200"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "h-2 w-2 rounded-full mt-2 flex-shrink-0",
                            notification.type === 'error' && "bg-red-500",
                            notification.type === 'warning' && "bg-yellow-500",
                            notification.type === 'success' && "bg-green-500",
                            notification.type === 'info' && "bg-blue-500"
                          )} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{notification.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">{notification.message}</div>
                            
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {notification.actions.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant={action.variant || "outline"}
                                    size="sm"
                                    onClick={() => handleNotificationAction(notification, index)}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                            
                            <div className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {theme === 'light' ? (
                  <Sun className="h-4 w-4" />
                ) : theme === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('auto')}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={onToggleFullscreen}
              >
                <Maximize2 className="h-4 w-4" />
                <span className="sr-only">Toggle fullscreen</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle fullscreen (Ctrl+F)</p>
            </TooltipContent>
          </Tooltip>

          {/* User Menu */}
          <DropdownMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userPreferences?.avatar} alt={userPreferences?.name} />
                  <AvatarFallback>
                    {userPreferences?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userPreferences?.name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userPreferences?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewChange('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default AppNavbar