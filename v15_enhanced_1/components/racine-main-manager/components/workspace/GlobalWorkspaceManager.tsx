"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import {
  Plus, Search, Filter, MoreVertical, Grid3X3, List, Star, Share2,
  Copy, Settings, Users, Clock, Activity, Zap, Database, Shield,
  Folder, FolderOpen, FileText, GitBranch, Tag, Calendar, TrendingUp,
  AlertCircle, CheckCircle, Eye, Edit3, Trash2, Download, Upload,
  RefreshCw, Play, Pause, Square, BarChart3, PieChart, Network,
  Map, Layers, Target, Sparkles, Brain, MessageSquare, Bell,
  Lock, Unlock, Key, UserCheck, UserX, Crown, Award, Flame,
  ChevronRight, ChevronDown, ExternalLink, ArrowRight, Maximize2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Import types
import {
  Workspace,
  WorkspaceTemplate,
  WorkspaceMember,
  WorkspaceSettings,
  WorkspaceAnalytics,
  WorkspaceResource,
  WorkspaceActivity,
  ResourceQuota,
  IntegrationStatus,
  AIRecommendation,
  WorkspaceFilter,
  WorkspaceSort,
  WorkspaceView,
  WorkspacePermission
} from '../../types/racine.types'

// Import hooks and services
import { workspaceService } from '../../services/workspace.service'
import { aiService } from '../../services/ai.service'
import { activityService } from '../../services/activity.service'
import { collaborationService } from '../../services/collaboration.service'

interface GlobalWorkspaceManagerProps {
  workspaces: Workspace[]
  activeWorkspace?: Workspace
  onCreate: (config: Partial<Workspace>) => Promise<Workspace>
  onSwitch: (workspaceId: string) => Promise<void>
  analytics: WorkspaceAnalytics
  integrationStatus: IntegrationStatus
  userId?: string
  organizationId?: string
  permissions?: WorkspacePermission[]
  onWorkspaceUpdate?: (workspace: Workspace) => void
  onError?: (error: Error) => void
}

export const GlobalWorkspaceManager: React.FC<GlobalWorkspaceManagerProps> = ({
  workspaces = [],
  activeWorkspace,
  onCreate,
  onSwitch,
  analytics,
  integrationStatus,
  userId,
  organizationId,
  permissions = [],
  onWorkspaceUpdate,
  onError
}) => {
  // Core state
  const [viewMode, setViewMode] = useState<WorkspaceView>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([])
  const [filterConfig, setFilterConfig] = useState<WorkspaceFilter>({
    status: 'all',
    tags: [],
    members: [],
    dateRange: null,
    resourceUsage: null
  })
  const [sortConfig, setSortConfig] = useState<WorkspaceSort>({
    field: 'lastAccessed',
    direction: 'desc'
  })

  // UI state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkspaceTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Advanced features state
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([])
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([])
  const [workspaceActivities, setWorkspaceActivities] = useState<WorkspaceActivity[]>([])
  const [resourceQuotas, setResourceQuotas] = useState<ResourceQuota[]>([])
  const [favoriteWorkspaces, setFavoriteWorkspaces] = useState<string[]>([])
  const [recentWorkspaces, setRecentWorkspaces] = useState<string[]>([])

  // Toast for notifications
  const { toast } = useToast()

  // Load workspace templates and AI recommendations
  useEffect(() => {
    const loadWorkspaceData = async () => {
      try {
        setIsLoading(true)
        
        // Load templates
        const templatesData = await workspaceService.getWorkspaceTemplates()
        setTemplates(templatesData)

        // Get AI recommendations for workspace optimization
        const recommendations = await aiService.getWorkspaceRecommendations({
          userId,
          organizationId,
          currentWorkspaces: workspaces,
          analytics
        })
        setAIRecommendations(recommendations)

        // Load recent activities
        const activities = await activityService.getWorkspaceActivities({
          userId,
          organizationId,
          limit: 50
        })
        setWorkspaceActivities(activities)

        // Load resource quotas
        const quotas = await workspaceService.getResourceQuotas(organizationId)
        setResourceQuotas(quotas)

        // Load user preferences
        const favorites = await workspaceService.getFavoriteWorkspaces(userId)
        setFavoriteWorkspaces(favorites)

        const recent = await workspaceService.getRecentWorkspaces(userId)
        setRecentWorkspaces(recent)

      } catch (error) {
        console.error('Failed to load workspace data:', error)
        onError?.(error as Error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId && organizationId) {
      loadWorkspaceData()
    }
  }, [userId, organizationId, workspaces, analytics, onError])

  // Filter and sort workspaces
  const filteredAndSortedWorkspaces = useMemo(() => {
    let filtered = workspaces.filter(workspace => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = workspace.name.toLowerCase().includes(query)
        const matchesDescription = workspace.description?.toLowerCase().includes(query)
        const matchesTags = workspace.tags?.some(tag => tag.toLowerCase().includes(query))
        
        if (!matchesName && !matchesDescription && !matchesTags) {
          return false
        }
      }

      // Status filter
      if (filterConfig.status !== 'all' && workspace.status !== filterConfig.status) {
        return false
      }

      // Tags filter
      if (filterConfig.tags.length > 0) {
        const hasMatchingTag = filterConfig.tags.some(tag => 
          workspace.tags?.includes(tag)
        )
        if (!hasMatchingTag) return false
      }

      // Members filter
      if (filterConfig.members.length > 0) {
        const hasMatchingMember = filterConfig.members.some(memberId =>
          workspace.members?.some(member => member.userId === memberId)
        )
        if (!hasMatchingMember) return false
      }

      // Date range filter
      if (filterConfig.dateRange) {
        const workspaceDate = new Date(workspace.lastAccessed || workspace.createdAt)
        if (workspaceDate < filterConfig.dateRange.start || workspaceDate > filterConfig.dateRange.end) {
          return false
        }
      }

      // Resource usage filter
      if (filterConfig.resourceUsage) {
        const usage = workspace.resourceUsage?.cpu || 0
        if (usage < filterConfig.resourceUsage.min || usage > filterConfig.resourceUsage.max) {
          return false
        }
      }

      return true
    })

    // Sort workspaces
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.field) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'lastAccessed':
          aValue = new Date(a.lastAccessed || a.createdAt)
          bValue = new Date(b.lastAccessed || b.createdAt)
          break
        case 'resourceUsage':
          aValue = a.resourceUsage?.cpu || 0
          bValue = b.resourceUsage?.cpu || 0
          break
        case 'memberCount':
          aValue = a.members?.length || 0
          bValue = b.members?.length || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [workspaces, searchQuery, filterConfig, sortConfig])

  // Handle workspace creation
  const handleCreateWorkspace = useCallback(async (config: Partial<Workspace>) => {
    try {
      setIsLoading(true)
      const newWorkspace = await onCreate(config)
      
      toast({
        title: "Workspace Created",
        description: `Successfully created workspace "${newWorkspace.name}"`,
      })

      setShowCreateDialog(false)
      
      // Track activity
      await activityService.trackActivity({
        type: 'workspace',
        action: 'create',
        data: { workspaceId: newWorkspace.id, name: newWorkspace.name },
        userId,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Failed to create workspace:', error)
      toast({
        title: "Creation Failed",
        description: "Failed to create workspace. Please try again.",
        variant: "destructive"
      })
      onError?.(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [onCreate, userId, toast, onError])

  // Handle workspace cloning
  const handleCloneWorkspace = useCallback(async (sourceWorkspace: Workspace) => {
    try {
      setIsLoading(true)
      
      const clonedWorkspace = await workspaceService.cloneWorkspace({
        sourceWorkspaceId: sourceWorkspace.id,
        name: `${sourceWorkspace.name} (Copy)`,
        includeData: true,
        includeSettings: true,
        includeMembers: false // Don't copy members by default
      })

      toast({
        title: "Workspace Cloned",
        description: `Successfully cloned workspace as "${clonedWorkspace.name}"`,
      })

      // Track activity
      await activityService.trackActivity({
        type: 'workspace',
        action: 'clone',
        data: { 
          sourceWorkspaceId: sourceWorkspace.id,
          clonedWorkspaceId: clonedWorkspace.id,
          name: clonedWorkspace.name 
        },
        userId,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Failed to clone workspace:', error)
      toast({
        title: "Cloning Failed",
        description: "Failed to clone workspace. Please try again.",
        variant: "destructive"
      })
      onError?.(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, toast, onError])

  // Handle workspace sharing
  const handleShareWorkspace = useCallback(async (workspace: Workspace, memberIds: string[], permissions: WorkspacePermission[]) => {
    try {
      setIsLoading(true)
      
      await workspaceService.shareWorkspace({
        workspaceId: workspace.id,
        memberIds,
        permissions
      })

      toast({
        title: "Workspace Shared",
        description: `Successfully shared workspace with ${memberIds.length} users`,
      })

      // Track activity
      await activityService.trackActivity({
        type: 'workspace',
        action: 'share',
        data: { 
          workspaceId: workspace.id,
          memberIds,
          permissions 
        },
        userId,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Failed to share workspace:', error)
      toast({
        title: "Sharing Failed",
        description: "Failed to share workspace. Please try again.",
        variant: "destructive"
      })
      onError?.(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, toast, onError])

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(async (workspaceId: string) => {
    try {
      const isFavorite = favoriteWorkspaces.includes(workspaceId)
      
      if (isFavorite) {
        await workspaceService.removeFavoriteWorkspace(userId, workspaceId)
        setFavoriteWorkspaces(prev => prev.filter(id => id !== workspaceId))
      } else {
        await workspaceService.addFavoriteWorkspace(userId, workspaceId)
        setFavoriteWorkspaces(prev => [...prev, workspaceId])
      }

      toast({
        title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
        description: `Workspace ${isFavorite ? 'removed from' : 'added to'} your favorites`,
      })

    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      onError?.(error as Error)
    }
  }, [favoriteWorkspaces, userId, toast, onError])

  // Render workspace card
  const renderWorkspaceCard = (workspace: Workspace) => {
    const isFavorite = favoriteWorkspaces.includes(workspace.id)
    const isActive = activeWorkspace?.id === workspace.id
    const isSelected = selectedWorkspaces.includes(workspace.id)
    
    return (
      <motion.div
        key={workspace.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -2 }}
        className={cn(
          "group relative",
          viewMode === 'grid' ? "col-span-1" : "w-full"
        )}
      >
        <Card className={cn(
          "h-full transition-all duration-200 cursor-pointer",
          isActive && "ring-2 ring-primary",
          isSelected && "ring-2 ring-blue-500",
          "hover:shadow-lg"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  workspace.type === 'data-science' && "bg-purple-100 text-purple-600",
                  workspace.type === 'analytics' && "bg-blue-100 text-blue-600",
                  workspace.type === 'governance' && "bg-green-100 text-green-600",
                  workspace.type === 'collaboration' && "bg-orange-100 text-orange-600"
                )}>
                  {workspace.type === 'data-science' && <Database className="h-5 w-5" />}
                  {workspace.type === 'analytics' && <BarChart3 className="h-5 w-5" />}
                  {workspace.type === 'governance' && <Shield className="h-5 w-5" />}
                  {workspace.type === 'collaboration' && <Users className="h-5 w-5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm truncate">{workspace.name}</h3>
                    {isActive && <Badge variant="secondary" className="text-xs">Active</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {workspace.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleFavorite(workspace.id)
                  }}
                >
                  <Star className={cn(
                    "h-4 w-4",
                    isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  )} />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onSwitch(workspace.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Switch to Workspace
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCloneWorkspace(workspace)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Clone Workspace
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Workspace
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Workspace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Tags */}
              {workspace.tags && workspace.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {workspace.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {workspace.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{workspace.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Members */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {workspace.members?.length || 0} members
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {workspace.lastAccessed ? 
                      new Date(workspace.lastAccessed).toLocaleDateString() : 
                      'Never'
                    }
                  </span>
                </div>
              </div>

              {/* Resource Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Resource Usage</span>
                  <span className="text-xs font-medium">
                    {workspace.resourceUsage?.cpu || 0}%
                  </span>
                </div>
                <Progress value={workspace.resourceUsage?.cpu || 0} className="h-1" />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge 
                  variant={workspace.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {workspace.status}
                </Badge>
                
                {workspace.aiRecommendations && workspace.aiRecommendations.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center space-x-1">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span className="text-xs text-purple-500">
                          {workspace.aiRecommendations.length}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      AI has {workspace.aiRecommendations.length} recommendations for this workspace
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Render workspace templates
  const renderTemplates = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card 
          key={template.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedTemplate(template)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <template.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.category}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {template.description}
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {template.complexity}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Used {template.usageCount} times
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Create workspace dialog content
  const CreateWorkspaceDialog = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      type: 'analytics' as any,
      tags: '',
      isPrivate: false,
      templateId: selectedTemplate?.id || ''
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      handleCreateWorkspace({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        templateId: formData.templateId || undefined
      })
    }

    return (
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Set up a new workspace for your team's data governance activities
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter workspace name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Workspace Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="governance">Governance</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose of this workspace"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="data-science, analytics, team-alpha"
              />
            </div>

            {selectedTemplate && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <selectedTemplate.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">Using Template: {selectedTemplate.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={formData.isPrivate}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
              />
              <Label htmlFor="private">Private workspace</Label>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Workspace'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  if (isLoading && workspaces.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Workspaces</h2>
          <p className="text-muted-foreground">Fetching your workspace data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Workspace Manager</h1>
          <p className="text-muted-foreground">
            Manage and orchestrate all your data governance workspaces
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowTemplateDialog(true)}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Templates
          </Button>
          
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Workspace
          </Button>
        </div>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">AI Recommendations</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {aiRecommendations.slice(0, 3).map((recommendation, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{recommendation.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {recommendation.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {recommendation.description}
                  </p>
                  <Button size="sm" variant="outline" className="text-xs">
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Select value={sortConfig.field} onValueChange={(value: any) => setSortConfig(prev => ({ ...prev, field: value }))}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastAccessed">Last Accessed</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="resourceUsage">Resource Usage</SelectItem>
              <SelectItem value="memberCount">Member Count</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortConfig(prev => ({ 
              ...prev, 
              direction: prev.direction === 'asc' ? 'desc' : 'asc' 
            }))}
          >
            {sortConfig.direction === 'asc' ? '↑' : '↓'}
          </Button>

          <div className="flex items-center space-x-1 border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Favorites */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Favorites</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {workspaces
                .filter(w => favoriteWorkspaces.includes(w.id))
                .slice(0, 3)
                .map((workspace) => (
                  <div 
                    key={workspace.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => onSwitch(workspace.id)}
                  >
                    <span className="text-sm font-medium truncate">{workspace.name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              }
              {favoriteWorkspaces.length === 0 && (
                <p className="text-sm text-muted-foreground">No favorites yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Recent</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {workspaces
                .filter(w => recentWorkspaces.includes(w.id))
                .slice(0, 3)
                .map((workspace) => (
                  <div 
                    key={workspace.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => onSwitch(workspace.id)}
                  >
                    <span className="text-sm font-medium truncate">{workspace.name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              }
              {recentWorkspaces.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent workspaces</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Workspace */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Active Workspace</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {activeWorkspace ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{activeWorkspace.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {activeWorkspace.members?.length || 0} members
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">CPU Usage</span>
                    <span className="text-xs font-medium">
                      {activeWorkspace.resourceUsage?.cpu || 0}%
                    </span>
                  </div>
                  <Progress value={activeWorkspace.resourceUsage?.cpu || 0} className="h-1" />
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  View Details
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active workspace</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workspaces Grid/List */}
      <div className={cn(
        "gap-6",
        viewMode === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
      )}>
        <AnimatePresence>
          {filteredAndSortedWorkspaces.map(renderWorkspaceCard)}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAndSortedWorkspaces.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Workspaces Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "No workspaces match your search criteria. Try adjusting your filters."
                : "You don't have any workspaces yet. Create your first workspace to get started."
              }
            </p>
            <div className="flex justify-center space-x-3">
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateWorkspaceDialog />

      {/* Templates Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Workspace Templates</DialogTitle>
            <DialogDescription>
              Choose from pre-configured templates to quickly set up your workspace
            </DialogDescription>
          </DialogHeader>
          {renderTemplates()}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GlobalWorkspaceManager