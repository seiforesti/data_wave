import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { workspaceService } from '../services/workspace.service'
import { racineApiService } from '../services/racine-api.service'
import {
  Workspace,
  WorkspaceTemplate,
  WorkspaceMember,
  WorkspaceSettings,
  WorkspaceAnalytics,
  WorkspaceResource,
  WorkspaceActivity,
  ResourceQuota,
  WorkspacePermission,
  WorkspaceFilter,
  WorkspaceSort,
  WorkspaceView,
  WorkspaceCollaboration,
  AIRecommendation
} from '../types/racine.types'

interface UseGlobalWorkspaceParams {
  userId?: string
  organizationId?: string
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealTimeUpdates?: boolean
}

interface UseGlobalWorkspaceReturn {
  // Core workspace data
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  selectedWorkspace: Workspace | null
  
  // Templates and recommendations
  templates: WorkspaceTemplate[]
  aiRecommendations: AIRecommendation[]
  
  // Analytics and metrics
  workspaceAnalytics: WorkspaceAnalytics | null
  resourceQuotas: ResourceQuota[]
  
  // User preferences
  favoriteWorkspaces: string[]
  recentWorkspaces: string[]
  
  // Loading and error states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: Error | null
  
  // Actions
  createWorkspace: (config: Partial<Workspace>) => Promise<Workspace>
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => Promise<Workspace>
  deleteWorkspace: (workspaceId: string) => Promise<void>
  cloneWorkspace: (sourceWorkspaceId: string, name: string, options?: any) => Promise<Workspace>
  shareWorkspace: (workspaceId: string, memberIds: string[], permissions: WorkspacePermission[]) => Promise<void>
  switchWorkspace: (workspaceId: string) => Promise<void>
  
  // Template actions
  createFromTemplate: (templateId: string, name: string, customizations?: any) => Promise<Workspace>
  
  // Member management
  addMember: (workspaceId: string, userId: string, role: string, permissions: WorkspacePermission[]) => Promise<WorkspaceMember>
  updateMember: (workspaceId: string, memberId: string, updates: any) => Promise<WorkspaceMember>
  removeMember: (workspaceId: string, memberId: string) => Promise<void>
  
  // Favorites and recent
  toggleFavorite: (workspaceId: string) => Promise<void>
  
  // Resource management
  getResources: (workspaceId: string) => Promise<WorkspaceResource[]>
  optimizeWorkspace: (workspaceId: string, type?: string) => Promise<any>
  
  // Analytics
  getAnalytics: (workspaceId: string, timeRange?: string) => Promise<WorkspaceAnalytics>
  
  // Import/Export
  exportWorkspace: (workspaceId: string, format: string, options?: any) => Promise<any>
  importWorkspace: (data: any, format: string, options?: any) => Promise<Workspace>
  
  // Backup/Restore
  backupWorkspace: (workspaceId: string, options?: any) => Promise<any>
  restoreWorkspace: (backupId: string, options?: any) => Promise<Workspace>
  
  // Search and filtering
  searchWorkspaces: (query: string, filters?: WorkspaceFilter) => Promise<Workspace[]>
  
  // Collaboration
  getCollaboration: (workspaceId: string) => Promise<WorkspaceCollaboration>
  joinCollaboration: (workspaceId: string, sessionId: string) => Promise<void>
  leaveCollaboration: (workspaceId: string, sessionId: string) => Promise<void>
  
  // Health and optimization
  getHealth: (workspaceId: string) => Promise<any>
  validateConfig: (config: Partial<Workspace>) => Promise<any>
  
  // Utility functions
  refreshWorkspaces: () => Promise<void>
  clearCache: () => void
  resetError: () => void
}

export const useGlobalWorkspace = (params: UseGlobalWorkspaceParams = {}): UseGlobalWorkspaceReturn => {
  const {
    userId,
    organizationId,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTimeUpdates = true
  } = params

  // Core state
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  
  // Templates and recommendations
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([])
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([])
  
  // Analytics
  const [workspaceAnalytics, setWorkspaceAnalytics] = useState<WorkspaceAnalytics | null>(null)
  const [resourceQuotas, setResourceQuotas] = useState<ResourceQuota[]>([])
  
  // User preferences
  const [favoriteWorkspaces, setFavoriteWorkspaces] = useState<string[]>([])
  const [recentWorkspaces, setRecentWorkspaces] = useState<string[]>([])
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Refs for cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout>()
  const mountedRef = useRef(true)
  
  // Toast for notifications
  const { toast } = useToast()

  // Load initial data
  const loadWorkspaceData = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(null)

      // Load workspaces
      const workspacesData = await workspaceService.getWorkspaces({
        userId,
        organizationId
      })
      
      if (mountedRef.current) {
        setWorkspaces(workspacesData)
      }

      // Load templates
      const templatesData = await workspaceService.getWorkspaceTemplates()
      if (mountedRef.current) {
        setTemplates(templatesData)
      }

      // Load resource quotas
      const quotasData = await workspaceService.getResourceQuotas(organizationId)
      if (mountedRef.current) {
        setResourceQuotas(quotasData)
      }

      // Load user preferences
      const favorites = await workspaceService.getFavoriteWorkspaces(userId)
      if (mountedRef.current) {
        setFavoriteWorkspaces(favorites)
      }

      const recent = await workspaceService.getRecentWorkspaces(userId)
      if (mountedRef.current) {
        setRecentWorkspaces(recent)
      }

      // Get AI recommendations
      try {
        const recommendations = await racineApiService.getAIRecommendations({
          type: 'workspace',
          userId,
          organizationId,
          context: { workspaces: workspacesData }
        })
        if (mountedRef.current) {
          setAIRecommendations(recommendations)
        }
      } catch (aiError) {
        console.warn('Failed to load AI recommendations:', aiError)
      }

    } catch (err) {
      console.error('Failed to load workspace data:', err)
      if (mountedRef.current) {
        setError(err as Error)
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [userId, organizationId])

  // Create workspace
  const createWorkspace = useCallback(async (config: Partial<Workspace>): Promise<Workspace> => {
    try {
      setIsCreating(true)
      setError(null)

      const newWorkspace = await workspaceService.createWorkspace({
        ...config,
        organizationId
      })

      if (mountedRef.current) {
        setWorkspaces(prev => [...prev, newWorkspace])
      }

      toast({
        title: "Workspace Created",
        description: `Successfully created workspace "${newWorkspace.name}"`,
      })

      return newWorkspace
    } catch (err) {
      console.error('Failed to create workspace:', err)
      const error = err as Error
      setError(error)
      
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create workspace. Please try again.",
        variant: "destructive"
      })
      
      throw error
    } finally {
      setIsCreating(false)
    }
  }, [organizationId, toast])

  // Update workspace
  const updateWorkspace = useCallback(async (workspaceId: string, updates: Partial<Workspace>): Promise<Workspace> => {
    try {
      setIsUpdating(true)
      setError(null)

      const updatedWorkspace = await workspaceService.updateWorkspace(workspaceId, updates)

      if (mountedRef.current) {
        setWorkspaces(prev => 
          prev.map(w => w.id === workspaceId ? updatedWorkspace : w)
        )

        if (activeWorkspace?.id === workspaceId) {
          setActiveWorkspace(updatedWorkspace)
        }
      }

      toast({
        title: "Workspace Updated",
        description: `Successfully updated workspace "${updatedWorkspace.name}"`,
      })

      return updatedWorkspace
    } catch (err) {
      console.error('Failed to update workspace:', err)
      const error = err as Error
      setError(error)
      
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update workspace. Please try again.",
        variant: "destructive"
      })
      
      throw error
    } finally {
      setIsUpdating(false)
    }
  }, [activeWorkspace, toast])

  // Delete workspace
  const deleteWorkspace = useCallback(async (workspaceId: string): Promise<void> => {
    try {
      setIsDeleting(true)
      setError(null)

      await workspaceService.deleteWorkspace(workspaceId)

      if (mountedRef.current) {
        setWorkspaces(prev => prev.filter(w => w.id !== workspaceId))
        
        if (activeWorkspace?.id === workspaceId) {
          setActiveWorkspace(null)
        }
        
        if (selectedWorkspace?.id === workspaceId) {
          setSelectedWorkspace(null)
        }
      }

      toast({
        title: "Workspace Deleted",
        description: "Workspace has been successfully deleted",
      })
    } catch (err) {
      console.error('Failed to delete workspace:', err)
      const error = err as Error
      setError(error)
      
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete workspace. Please try again.",
        variant: "destructive"
      })
      
      throw error
    } finally {
      setIsDeleting(false)
    }
  }, [activeWorkspace, selectedWorkspace, toast])

  // Clone workspace
  const cloneWorkspace = useCallback(async (sourceWorkspaceId: string, name: string, options: any = {}): Promise<Workspace> => {
    try {
      setIsCreating(true)
      setError(null)

      const clonedWorkspace = await workspaceService.cloneWorkspace({
        sourceWorkspaceId,
        name,
        ...options
      })

      if (mountedRef.current) {
        setWorkspaces(prev => [...prev, clonedWorkspace])
      }

      toast({
        title: "Workspace Cloned",
        description: `Successfully cloned workspace as "${clonedWorkspace.name}"`,
      })

      return clonedWorkspace
    } catch (err) {
      console.error('Failed to clone workspace:', err)
      const error = err as Error
      setError(error)
      
      toast({
        title: "Cloning Failed",
        description: error.message || "Failed to clone workspace. Please try again.",
        variant: "destructive"
      })
      
      throw error
    } finally {
      setIsCreating(false)
    }
  }, [toast])

  // Share workspace
  const shareWorkspace = useCallback(async (workspaceId: string, memberIds: string[], permissions: WorkspacePermission[]): Promise<void> => {
    try {
      setError(null)

      await workspaceService.shareWorkspace({
        workspaceId,
        memberIds,
        permissions
      })

      toast({
        title: "Workspace Shared",
        description: `Successfully shared workspace with ${memberIds.length} users`,
      })
    } catch (err) {
      console.error('Failed to share workspace:', err)
      const error = err as Error
      setError(error)
      
      toast({
        title: "Sharing Failed",
        description: error.message || "Failed to share workspace. Please try again.",
        variant: "destructive"
      })
      
      throw error
    }
  }, [toast])

  // Switch workspace
  const switchWorkspace = useCallback(async (workspaceId: string): Promise<void> => {
    try {
      setError(null)

      const workspace = workspaces.find(w => w.id === workspaceId)
      if (!workspace) {
        throw new Error('Workspace not found')
      }

      setActiveWorkspace(workspace)

      // Track workspace access
      if (userId) {
        await workspaceService.trackWorkspaceAccess(userId, workspaceId)
      }

      toast({
        title: "Workspace Switched",
        description: `Now working in "${workspace.name}" workspace`,
      })
    } catch (err) {
      console.error('Failed to switch workspace:', err)
      const error = err as Error
      setError(error)
      
      toast({
        title: "Switch Failed",
        description: error.message || "Failed to switch workspace. Please try again.",
        variant: "destructive"
      })
      
      throw error
    }
  }, [workspaces, userId, toast])

  // Create from template
  const createFromTemplate = useCallback(async (templateId: string, name: string, customizations: any = {}): Promise<Workspace> => {
    try {
      setIsCreating(true)
      setError(null)

      const newWorkspace = await workspaceService.createWorkspaceFromTemplate({
        templateId,
        name,
        organizationId,
        customizations
      })

      if (mountedRef.current) {
        setWorkspaces(prev => [...prev, newWorkspace])
      }

      toast({
        title: "Workspace Created",
        description: `Successfully created workspace "${newWorkspace.name}" from template`,
      })

      return newWorkspace
    } catch (err) {
      console.error('Failed to create workspace from template:', err)
      const error = err as Error
      setError(error)
      
      toast({
        title: "Template Creation Failed",
        description: error.message || "Failed to create workspace from template. Please try again.",
        variant: "destructive"
      })
      
      throw error
    } finally {
      setIsCreating(false)
    }
  }, [organizationId, toast])

  // Toggle favorite
  const toggleFavorite = useCallback(async (workspaceId: string): Promise<void> => {
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
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      setError(err as Error)
    }
  }, [favoriteWorkspaces, userId, toast])

  // Member management
  const addMember = useCallback(async (workspaceId: string, userId: string, role: string, permissions: WorkspacePermission[]): Promise<WorkspaceMember> => {
    return await workspaceService.addWorkspaceMember(workspaceId, { userId, role, permissions })
  }, [])

  const updateMember = useCallback(async (workspaceId: string, memberId: string, updates: any): Promise<WorkspaceMember> => {
    return await workspaceService.updateWorkspaceMember(workspaceId, memberId, updates)
  }, [])

  const removeMember = useCallback(async (workspaceId: string, memberId: string): Promise<void> => {
    await workspaceService.removeWorkspaceMember(workspaceId, memberId)
  }, [])

  // Resource management
  const getResources = useCallback(async (workspaceId: string): Promise<WorkspaceResource[]> => {
    return await workspaceService.getWorkspaceResources(workspaceId)
  }, [])

  const optimizeWorkspace = useCallback(async (workspaceId: string, type = 'all'): Promise<any> => {
    return await workspaceService.optimizeWorkspace(workspaceId, { optimizationType: type as any })
  }, [])

  // Analytics
  const getAnalytics = useCallback(async (workspaceId: string, timeRange = '7d'): Promise<WorkspaceAnalytics> => {
    return await workspaceService.getWorkspaceAnalytics(workspaceId, { timeRange })
  }, [])

  // Import/Export
  const exportWorkspace = useCallback(async (workspaceId: string, format: string, options: any = {}): Promise<any> => {
    return await workspaceService.exportWorkspace(workspaceId, { format: format as any, ...options })
  }, [])

  const importWorkspace = useCallback(async (data: any, format: string, options: any = {}): Promise<Workspace> => {
    const workspace = await workspaceService.importWorkspace({
      name: options.name || 'Imported Workspace',
      importData: data,
      format: format as any,
      organizationId,
      ...options
    })

    if (mountedRef.current) {
      setWorkspaces(prev => [...prev, workspace])
    }

    return workspace
  }, [organizationId])

  // Backup/Restore
  const backupWorkspace = useCallback(async (workspaceId: string, options: any = {}): Promise<any> => {
    return await workspaceService.backupWorkspace(workspaceId, options)
  }, [])

  const restoreWorkspace = useCallback(async (backupId: string, options: any = {}): Promise<Workspace> => {
    const workspace = await workspaceService.restoreWorkspace(backupId, options)

    if (mountedRef.current) {
      setWorkspaces(prev => [...prev, workspace])
    }

    return workspace
  }, [])

  // Search
  const searchWorkspaces = useCallback(async (query: string, filters?: WorkspaceFilter): Promise<Workspace[]> => {
    return await workspaceService.searchWorkspaces({
      query,
      userId,
      organizationId,
      filters
    })
  }, [userId, organizationId])

  // Collaboration
  const getCollaboration = useCallback(async (workspaceId: string): Promise<WorkspaceCollaboration> => {
    return await workspaceService.getWorkspaceCollaboration(workspaceId)
  }, [])

  const joinCollaboration = useCallback(async (workspaceId: string, sessionId: string): Promise<void> => {
    await workspaceService.joinCollaborationSession(workspaceId, sessionId)
  }, [])

  const leaveCollaboration = useCallback(async (workspaceId: string, sessionId: string): Promise<void> => {
    await workspaceService.leaveCollaborationSession(workspaceId, sessionId)
  }, [])

  // Health and validation
  const getHealth = useCallback(async (workspaceId: string): Promise<any> => {
    return await workspaceService.getWorkspaceHealth(workspaceId)
  }, [])

  const validateConfig = useCallback(async (config: Partial<Workspace>): Promise<any> => {
    return await workspaceService.validateWorkspaceConfig(config)
  }, [])

  // Utility functions
  const refreshWorkspaces = useCallback(async (): Promise<void> => {
    await loadWorkspaceData()
  }, [loadWorkspaceData])

  const clearCache = useCallback((): void => {
    workspaceService.clearCache()
  }, [])

  const resetError = useCallback((): void => {
    setError(null)
  }, [])

  // Setup real-time updates
  useEffect(() => {
    if (!enableRealTimeUpdates || !userId) return

    const handleWorkspaceUpdate = (data: any) => {
      console.log('Workspace update received:', data)
      
      switch (data.type) {
        case 'workspace_created':
          if (mountedRef.current) {
            setWorkspaces(prev => [...prev, data.workspace])
          }
          break
        
        case 'workspace_updated':
          if (mountedRef.current) {
            setWorkspaces(prev => 
              prev.map(w => w.id === data.workspace.id ? data.workspace : w)
            )
            
            if (activeWorkspace?.id === data.workspace.id) {
              setActiveWorkspace(data.workspace)
            }
          }
          break
        
        case 'workspace_deleted':
          if (mountedRef.current) {
            setWorkspaces(prev => prev.filter(w => w.id !== data.workspaceId))
            
            if (activeWorkspace?.id === data.workspaceId) {
              setActiveWorkspace(null)
            }
          }
          break
        
        case 'workspace_shared':
          // Refresh workspaces to get updated member info
          loadWorkspaceData()
          break
      }
    }

    racineApiService.onRealtimeEvent('workspace', handleWorkspaceUpdate)

    return () => {
      racineApiService.offRealtimeEvent('workspace', handleWorkspaceUpdate)
    }
  }, [enableRealTimeUpdates, userId, activeWorkspace, loadWorkspaceData])

  // Setup auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return

    refreshIntervalRef.current = setInterval(() => {
      loadWorkspaceData()
    }, refreshInterval)

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, userId, loadWorkspaceData])

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadWorkspaceData()
    }
  }, [userId, loadWorkspaceData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])

  return {
    // Core data
    workspaces,
    activeWorkspace,
    selectedWorkspace,
    
    // Templates and recommendations
    templates,
    aiRecommendations,
    
    // Analytics
    workspaceAnalytics,
    resourceQuotas,
    
    // User preferences
    favoriteWorkspaces,
    recentWorkspaces,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    
    // Actions
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    cloneWorkspace,
    shareWorkspace,
    switchWorkspace,
    
    // Template actions
    createFromTemplate,
    
    // Member management
    addMember,
    updateMember,
    removeMember,
    
    // Favorites
    toggleFavorite,
    
    // Resource management
    getResources,
    optimizeWorkspace,
    
    // Analytics
    getAnalytics,
    
    // Import/Export
    exportWorkspace,
    importWorkspace,
    
    // Backup/Restore
    backupWorkspace,
    restoreWorkspace,
    
    // Search
    searchWorkspaces,
    
    // Collaboration
    getCollaboration,
    joinCollaboration,
    leaveCollaboration,
    
    // Health
    getHealth,
    validateConfig,
    
    // Utility
    refreshWorkspaces,
    clearCache,
    resetError
  }
}

export default useGlobalWorkspace