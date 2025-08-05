import { racineApiService } from './racine-api.service'
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
  WorkspaceBackup,
  WorkspaceExport
} from '../types/racine.types'

export class WorkspaceService {
  private cache = new Map<string, any>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Get all workspaces for a user/organization
   */
  async getWorkspaces(params: {
    userId?: string
    organizationId?: string
    filter?: WorkspaceFilter
    sort?: WorkspaceSort
    limit?: number
    offset?: number
  }): Promise<Workspace[]> {
    const cacheKey = `workspaces-${JSON.stringify(params)}`
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    try {
      const response = await racineApiService.get('/api/workspace/list', { params })
      const workspaces = response.data

      // Cache the result
      this.cache.set(cacheKey, {
        data: workspaces,
        timestamp: Date.now()
      })

      return workspaces
    } catch (error) {
      console.error('Failed to fetch workspaces:', error)
      throw error
    }
  }

  /**
   * Get a specific workspace by ID
   */
  async getWorkspace(workspaceId: string): Promise<Workspace> {
    const cacheKey = `workspace-${workspaceId}`
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    try {
      const response = await racineApiService.get(`/api/workspace/${workspaceId}`)
      const workspace = response.data

      // Cache the result
      this.cache.set(cacheKey, {
        data: workspace,
        timestamp: Date.now()
      })

      return workspace
    } catch (error) {
      console.error('Failed to fetch workspace:', error)
      throw error
    }
  }

  /**
   * Create a new workspace
   */
  async createWorkspace(config: Partial<Workspace>): Promise<Workspace> {
    try {
      const response = await racineApiService.post('/api/workspace/create', config)
      const workspace = response.data

      // Invalidate workspaces cache
      this.invalidateWorkspacesCache()

      return workspace
    } catch (error) {
      console.error('Failed to create workspace:', error)
      throw error
    }
  }

  /**
   * Update an existing workspace
   */
  async updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<Workspace> {
    try {
      const response = await racineApiService.put(`/api/workspace/${workspaceId}`, updates)
      const workspace = response.data

      // Update cache
      this.cache.set(`workspace-${workspaceId}`, {
        data: workspace,
        timestamp: Date.now()
      })

      // Invalidate workspaces cache
      this.invalidateWorkspacesCache()

      return workspace
    } catch (error) {
      console.error('Failed to update workspace:', error)
      throw error
    }
  }

  /**
   * Delete a workspace
   */
  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      await racineApiService.delete(`/api/workspace/${workspaceId}`)

      // Remove from cache
      this.cache.delete(`workspace-${workspaceId}`)
      this.invalidateWorkspacesCache()
    } catch (error) {
      console.error('Failed to delete workspace:', error)
      throw error
    }
  }

  /**
   * Clone an existing workspace
   */
  async cloneWorkspace(params: {
    sourceWorkspaceId: string
    name: string
    description?: string
    includeData?: boolean
    includeSettings?: boolean
    includeMembers?: boolean
    targetOrganizationId?: string
  }): Promise<Workspace> {
    try {
      const response = await racineApiService.post('/api/workspace/clone', params)
      const clonedWorkspace = response.data

      // Invalidate workspaces cache
      this.invalidateWorkspacesCache()

      return clonedWorkspace
    } catch (error) {
      console.error('Failed to clone workspace:', error)
      throw error
    }
  }

  /**
   * Share workspace with users
   */
  async shareWorkspace(params: {
    workspaceId: string
    memberIds: string[]
    permissions: WorkspacePermission[]
    message?: string
    expiryDate?: string
  }): Promise<void> {
    try {
      await racineApiService.post(`/api/workspace/${params.workspaceId}/share`, params)

      // Invalidate workspace cache
      this.cache.delete(`workspace-${params.workspaceId}`)
    } catch (error) {
      console.error('Failed to share workspace:', error)
      throw error
    }
  }

  /**
   * Get workspace templates
   */
  async getWorkspaceTemplates(params?: {
    category?: string
    complexity?: string
    featured?: boolean
  }): Promise<WorkspaceTemplate[]> {
    const cacheKey = `workspace-templates-${JSON.stringify(params || {})}`
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    try {
      const response = await racineApiService.get('/api/workspace/templates', { params })
      const templates = response.data

      // Cache the result
      this.cache.set(cacheKey, {
        data: templates,
        timestamp: Date.now()
      })

      return templates
    } catch (error) {
      console.error('Failed to fetch workspace templates:', error)
      throw error
    }
  }

  /**
   * Create workspace from template
   */
  async createWorkspaceFromTemplate(params: {
    templateId: string
    name: string
    description?: string
    organizationId?: string
    customizations?: Record<string, any>
  }): Promise<Workspace> {
    try {
      const response = await racineApiService.post('/api/workspace/from-template', params)
      const workspace = response.data

      // Invalidate workspaces cache
      this.invalidateWorkspacesCache()

      return workspace
    } catch (error) {
      console.error('Failed to create workspace from template:', error)
      throw error
    }
  }

  /**
   * Get workspace analytics
   */
  async getWorkspaceAnalytics(workspaceId: string, params?: {
    timeRange?: string
    metrics?: string[]
    granularity?: string
  }): Promise<WorkspaceAnalytics> {
    try {
      const response = await racineApiService.get(`/api/workspace/${workspaceId}/analytics`, { params })
      return response.data
    } catch (error) {
      console.error('Failed to fetch workspace analytics:', error)
      throw error
    }
  }

  /**
   * Get workspace members
   */
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const cacheKey = `workspace-members-${workspaceId}`
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    try {
      const response = await racineApiService.get(`/api/workspace/${workspaceId}/members`)
      const members = response.data

      // Cache the result
      this.cache.set(cacheKey, {
        data: members,
        timestamp: Date.now()
      })

      return members
    } catch (error) {
      console.error('Failed to fetch workspace members:', error)
      throw error
    }
  }

  /**
   * Add member to workspace
   */
  async addWorkspaceMember(workspaceId: string, params: {
    userId: string
    role: string
    permissions: WorkspacePermission[]
  }): Promise<WorkspaceMember> {
    try {
      const response = await racineApiService.post(`/api/workspace/${workspaceId}/members`, params)
      const member = response.data

      // Invalidate members cache
      this.cache.delete(`workspace-members-${workspaceId}`)

      return member
    } catch (error) {
      console.error('Failed to add workspace member:', error)
      throw error
    }
  }

  /**
   * Update workspace member permissions
   */
  async updateWorkspaceMember(workspaceId: string, memberId: string, updates: {
    role?: string
    permissions?: WorkspacePermission[]
  }): Promise<WorkspaceMember> {
    try {
      const response = await racineApiService.put(`/api/workspace/${workspaceId}/members/${memberId}`, updates)
      const member = response.data

      // Invalidate members cache
      this.cache.delete(`workspace-members-${workspaceId}`)

      return member
    } catch (error) {
      console.error('Failed to update workspace member:', error)
      throw error
    }
  }

  /**
   * Remove member from workspace
   */
  async removeWorkspaceMember(workspaceId: string, memberId: string): Promise<void> {
    try {
      await racineApiService.delete(`/api/workspace/${workspaceId}/members/${memberId}`)

      // Invalidate members cache
      this.cache.delete(`workspace-members-${workspaceId}`)
    } catch (error) {
      console.error('Failed to remove workspace member:', error)
      throw error
    }
  }

  /**
   * Get workspace resource usage
   */
  async getWorkspaceResources(workspaceId: string): Promise<WorkspaceResource[]> {
    try {
      const response = await racineApiService.get(`/api/workspace/${workspaceId}/resources`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch workspace resources:', error)
      throw error
    }
  }

  /**
   * Get resource quotas for organization
   */
  async getResourceQuotas(organizationId?: string): Promise<ResourceQuota[]> {
    const cacheKey = `resource-quotas-${organizationId || 'default'}`
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    try {
      const response = await racineApiService.get('/api/workspace/resource-quotas', {
        params: { organizationId }
      })
      const quotas = response.data

      // Cache the result
      this.cache.set(cacheKey, {
        data: quotas,
        timestamp: Date.now()
      })

      return quotas
    } catch (error) {
      console.error('Failed to fetch resource quotas:', error)
      throw error
    }
  }

  /**
   * Update resource quotas
   */
  async updateResourceQuotas(organizationId: string, quotas: ResourceQuota[]): Promise<ResourceQuota[]> {
    try {
      const response = await racineApiService.put(`/api/workspace/resource-quotas/${organizationId}`, {
        quotas
      })
      const updatedQuotas = response.data

      // Update cache
      this.cache.set(`resource-quotas-${organizationId}`, {
        data: updatedQuotas,
        timestamp: Date.now()
      })

      return updatedQuotas
    } catch (error) {
      console.error('Failed to update resource quotas:', error)
      throw error
    }
  }

  /**
   * Get workspace activities
   */
  async getWorkspaceActivities(workspaceId: string, params?: {
    limit?: number
    offset?: number
    activityType?: string
    userId?: string
    dateRange?: { start: Date; end: Date }
  }): Promise<WorkspaceActivity[]> {
    try {
      const response = await racineApiService.get(`/api/workspace/${workspaceId}/activities`, {
        params
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch workspace activities:', error)
      throw error
    }
  }

  /**
   * Get workspace settings
   */
  async getWorkspaceSettings(workspaceId: string): Promise<WorkspaceSettings> {
    const cacheKey = `workspace-settings-${workspaceId}`
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    try {
      const response = await racineApiService.get(`/api/workspace/${workspaceId}/settings`)
      const settings = response.data

      // Cache the result
      this.cache.set(cacheKey, {
        data: settings,
        timestamp: Date.now()
      })

      return settings
    } catch (error) {
      console.error('Failed to fetch workspace settings:', error)
      throw error
    }
  }

  /**
   * Update workspace settings
   */
  async updateWorkspaceSettings(workspaceId: string, settings: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
    try {
      const response = await racineApiService.put(`/api/workspace/${workspaceId}/settings`, settings)
      const updatedSettings = response.data

      // Update cache
      this.cache.set(`workspace-settings-${workspaceId}`, {
        data: updatedSettings,
        timestamp: Date.now()
      })

      return updatedSettings
    } catch (error) {
      console.error('Failed to update workspace settings:', error)
      throw error
    }
  }

  /**
   * Export workspace
   */
  async exportWorkspace(workspaceId: string, params: {
    format: 'json' | 'yaml' | 'terraform'
    includeData?: boolean
    includeSettings?: boolean
    includeMembers?: boolean
    includeResources?: boolean
  }): Promise<WorkspaceExport> {
    try {
      const response = await racineApiService.post(`/api/workspace/${workspaceId}/export`, params)
      return response.data
    } catch (error) {
      console.error('Failed to export workspace:', error)
      throw error
    }
  }

  /**
   * Import workspace
   */
  async importWorkspace(params: {
    name: string
    importData: any
    format: 'json' | 'yaml' | 'terraform'
    organizationId?: string
    overwriteSettings?: boolean
  }): Promise<Workspace> {
    try {
      const response = await racineApiService.post('/api/workspace/import', params)
      const workspace = response.data

      // Invalidate workspaces cache
      this.invalidateWorkspacesCache()

      return workspace
    } catch (error) {
      console.error('Failed to import workspace:', error)
      throw error
    }
  }

  /**
   * Backup workspace
   */
  async backupWorkspace(workspaceId: string, params?: {
    includeData?: boolean
    includeHistory?: boolean
    compression?: boolean
  }): Promise<WorkspaceBackup> {
    try {
      const response = await racineApiService.post(`/api/workspace/${workspaceId}/backup`, params)
      return response.data
    } catch (error) {
      console.error('Failed to backup workspace:', error)
      throw error
    }
  }

  /**
   * Restore workspace from backup
   */
  async restoreWorkspace(backupId: string, params?: {
    targetWorkspaceId?: string
    restoreData?: boolean
    restoreSettings?: boolean
    restoreMembers?: boolean
  }): Promise<Workspace> {
    try {
      const response = await racineApiService.post(`/api/workspace/restore/${backupId}`, params)
      const workspace = response.data

      // Invalidate relevant caches
      if (params?.targetWorkspaceId) {
        this.cache.delete(`workspace-${params.targetWorkspaceId}`)
      }
      this.invalidateWorkspacesCache()

      return workspace
    } catch (error) {
      console.error('Failed to restore workspace:', error)
      throw error
    }
  }

  /**
   * Get workspace backups
   */
  async getWorkspaceBackups(workspaceId: string): Promise<WorkspaceBackup[]> {
    try {
      const response = await racineApiService.get(`/api/workspace/${workspaceId}/backups`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch workspace backups:', error)
      throw error
    }
  }

  /**
   * Add workspace to favorites
   */
  async addFavoriteWorkspace(userId?: string, workspaceId?: string): Promise<void> {
    try {
      await racineApiService.post('/api/workspace/favorites', {
        userId,
        workspaceId
      })

      // Invalidate favorites cache
      this.cache.delete(`favorite-workspaces-${userId}`)
    } catch (error) {
      console.error('Failed to add favorite workspace:', error)
      throw error
    }
  }

  /**
   * Remove workspace from favorites
   */
  async removeFavoriteWorkspace(userId?: string, workspaceId?: string): Promise<void> {
    try {
      await racineApiService.delete(`/api/workspace/favorites/${workspaceId}`, {
        params: { userId }
      })

      // Invalidate favorites cache
      this.cache.delete(`favorite-workspaces-${userId}`)
    } catch (error) {
      console.error('Failed to remove favorite workspace:', error)
      throw error
    }
  }

  /**
   * Get favorite workspaces
   */
  async getFavoriteWorkspaces(userId?: string): Promise<string[]> {
    const cacheKey = `favorite-workspaces-${userId}`
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    try {
      const response = await racineApiService.get('/api/workspace/favorites', {
        params: { userId }
      })
      const favorites = response.data

      // Cache the result
      this.cache.set(cacheKey, {
        data: favorites,
        timestamp: Date.now()
      })

      return favorites
    } catch (error) {
      console.error('Failed to fetch favorite workspaces:', error)
      return []
    }
  }

  /**
   * Get recent workspaces
   */
  async getRecentWorkspaces(userId?: string, limit = 10): Promise<string[]> {
    const cacheKey = `recent-workspaces-${userId}-${limit}`
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    try {
      const response = await racineApiService.get('/api/workspace/recent', {
        params: { userId, limit }
      })
      const recent = response.data

      // Cache the result
      this.cache.set(cacheKey, {
        data: recent,
        timestamp: Date.now()
      })

      return recent
    } catch (error) {
      console.error('Failed to fetch recent workspaces:', error)
      return []
    }
  }

  /**
   * Track workspace access
   */
  async trackWorkspaceAccess(userId?: string, workspaceId?: string): Promise<void> {
    try {
      await racineApiService.post('/api/workspace/track-access', {
        userId,
        workspaceId,
        timestamp: new Date().toISOString()
      })

      // Invalidate recent workspaces cache
      this.cache.delete(`recent-workspaces-${userId}-10`)
    } catch (error) {
      console.error('Failed to track workspace access:', error)
      // Don't throw error for tracking failures
    }
  }

  /**
   * Search workspaces
   */
  async searchWorkspaces(params: {
    query: string
    userId?: string
    organizationId?: string
    filters?: WorkspaceFilter
    limit?: number
  }): Promise<Workspace[]> {
    try {
      const response = await racineApiService.get('/api/workspace/search', { params })
      return response.data
    } catch (error) {
      console.error('Failed to search workspaces:', error)
      throw error
    }
  }

  /**
   * Get workspace collaboration info
   */
  async getWorkspaceCollaboration(workspaceId: string): Promise<WorkspaceCollaboration> {
    try {
      const response = await racineApiService.get(`/api/workspace/${workspaceId}/collaboration`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch workspace collaboration:', error)
      throw error
    }
  }

  /**
   * Join workspace collaboration session
   */
  async joinCollaborationSession(workspaceId: string, sessionId: string): Promise<void> {
    try {
      await racineApiService.post(`/api/workspace/${workspaceId}/collaboration/join`, {
        sessionId
      })
    } catch (error) {
      console.error('Failed to join collaboration session:', error)
      throw error
    }
  }

  /**
   * Leave workspace collaboration session
   */
  async leaveCollaborationSession(workspaceId: string, sessionId: string): Promise<void> {
    try {
      await racineApiService.post(`/api/workspace/${workspaceId}/collaboration/leave`, {
        sessionId
      })
    } catch (error) {
      console.error('Failed to leave collaboration session:', error)
      throw error
    }
  }

  /**
   * Get workspace health status
   */
  async getWorkspaceHealth(workspaceId: string): Promise<{
    status: 'healthy' | 'warning' | 'error'
    checks: Array<{
      name: string
      status: 'pass' | 'fail' | 'warning'
      message: string
      timestamp: string
    }>
    score: number
    recommendations: string[]
  }> {
    try {
      const response = await racineApiService.get(`/api/workspace/${workspaceId}/health`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch workspace health:', error)
      throw error
    }
  }

  /**
   * Optimize workspace resources
   */
  async optimizeWorkspace(workspaceId: string, params?: {
    optimizationType: 'performance' | 'cost' | 'security' | 'all'
    dryRun?: boolean
  }): Promise<{
    optimizations: Array<{
      type: string
      description: string
      impact: 'low' | 'medium' | 'high'
      estimatedSavings?: number
      estimatedImprovement?: string
    }>
    applied: boolean
    timestamp: string
  }> {
    try {
      const response = await racineApiService.post(`/api/workspace/${workspaceId}/optimize`, params)
      return response.data
    } catch (error) {
      console.error('Failed to optimize workspace:', error)
      throw error
    }
  }

  /**
   * Validate workspace configuration
   */
  async validateWorkspaceConfig(config: Partial<Workspace>): Promise<{
    valid: boolean
    errors: Array<{
      field: string
      message: string
      severity: 'error' | 'warning'
    }>
    warnings: string[]
    suggestions: string[]
  }> {
    try {
      const response = await racineApiService.post('/api/workspace/validate', config)
      return response.data
    } catch (error) {
      console.error('Failed to validate workspace config:', error)
      throw error
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Invalidate workspaces cache
   */
  private invalidateWorkspacesCache(): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith('workspaces-')) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number
    keys: string[]
    memoryUsage: number
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length
    }
  }
}

// Export singleton instance
export const workspaceService = new WorkspaceService()