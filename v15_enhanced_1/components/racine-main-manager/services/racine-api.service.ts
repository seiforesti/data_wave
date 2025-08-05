// =============================================================================
// RACINE API SERVICE - ENTERPRISE INTEGRATION LAYER
// =============================================================================
// Unified API service orchestrating all 7 groups (6 core + RBAC) with 
// advanced caching, error handling, and real-time capabilities

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { io, Socket } from 'socket.io-client'
import { 
  ApiResponse, 
  ApiError, 
  RacineView, 
  Workspace, 
  JobWorkflow, 
  Pipeline, 
  Activity, 
  CollaborationSpace,
  SystemHealth,
  CrossGroupMetrics,
  IntegrationStatus,
  User,
  UserPreferences,
  DashboardConfig,
  AIAssistant
} from '../types/racine.types'

// =============================================================================
// API CONFIGURATION
// =============================================================================

interface RacineApiConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
  enableCaching: boolean
  cacheTimeout: number
  enableRealTime: boolean
  websocketUrl?: string
  authentication: {
    type: 'jwt' | 'oauth' | 'apikey'
    token?: string
    refreshToken?: string
    apiKey?: string
  }
}

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiry: number
  key: string
}

interface RequestOptions extends AxiosRequestConfig {
  useCache?: boolean
  cacheTimeout?: number
  retryAttempts?: number
  skipErrorHandling?: boolean
}

// =============================================================================
// GROUP ENDPOINT MAPPINGS
// =============================================================================

const GROUP_ENDPOINTS = {
  // Core racine endpoints
  health: '/api/health',
  metrics: '/api/metrics',
  search: '/api/search',
  notifications: '/api/notifications',
  
  // Data Sources Group
  dataSources: '/api/data-sources',
  dataSourceConnections: '/api/data-source-connections', 
  dataSourceDiscovery: '/api/data-discovery',
  dataSourceMonitoring: '/api/data-source-monitoring',
  
  // Scan Rule Sets Group
  scanRuleSets: '/api/scan-rule-sets',
  ruleTemplates: '/api/rule-templates',
  ruleVersionControl: '/api/rule-version-control',
  ruleCollaboration: '/api/enhanced-collaboration',
  ruleReviews: '/api/rule-reviews',
  knowledgeBase: '/api/knowledge-base',
  advancedReporting: '/api/advanced-reporting',
  
  // Advanced Catalog Group
  catalogItems: '/api/enterprise-catalog',
  catalogDiscovery: '/api/intelligent-discovery',
  catalogLineage: '/api/advanced-lineage',
  catalogSearch: '/api/semantic-search',
  catalogQuality: '/api/catalog-quality',
  catalogAnalytics: '/api/catalog-analytics',
  
  // Scan Logic Group
  scanOrchestration: '/api/enterprise-scan-orchestration',
  scanIntelligence: '/api/scan-intelligence',
  scanWorkflows: '/api/scan-workflows',
  scanPerformance: '/api/scan-performance',
  scanCoordination: '/api/scan-coordination',
  scanOptimization: '/api/scan-optimization',
  
  // Classifications Group
  classifications: '/api/classification',
  classificationRules: '/api/classification-rules',
  classificationFrameworks: '/api/classification-frameworks',
  
  // Compliance Rules Group
  complianceRules: '/api/compliance-rule',
  complianceFrameworks: '/api/compliance-framework',
  complianceRisks: '/api/compliance-risk',
  complianceReports: '/api/compliance-reports',
  complianceWorkflows: '/api/compliance-workflows',
  complianceIntegrations: '/api/compliance-integrations',
  complianceAudits: '/api/compliance-audit',
  
  // RBAC System Group
  users: '/api/auth',
  roles: '/api/rbac',
  permissions: '/api/rbac/permissions',
  sessions: '/api/auth/sessions',
  
  // Enterprise Integration
  enterpriseIntegration: '/api/enterprise/integration',
  enterpriseAnalytics: '/api/enterprise-analytics',
  enterpriseWorkflows: '/api/workflows',
  enterprisePipelines: '/api/pipelines',
  
  // AI & ML Services
  aiServices: '/api/ai',
  mlServices: '/api/ml',
  
  // Monitoring & Performance
  monitoring: '/api/monitoring',
  performance: '/api/performance',
  security: '/api/security'
} as const

// =============================================================================
// RACINE API SERVICE CLASS
// =============================================================================

export class RacineApiService {
  private apiClient: AxiosInstance
  private websocket: Socket | null = null
  private cache = new Map<string, CacheEntry>()
  private config: RacineApiConfig
  private requestQueue: Map<string, Promise<any>> = new Map()
  private retryCount = new Map<string, number>()

  constructor(config: Partial<RacineApiConfig> = {}) {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      enableRealTime: true,
      websocketUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
      authentication: {
        type: 'jwt'
      },
      ...config
    }

    this.apiClient = this.createApiClient()
    
    if (this.config.enableRealTime) {
      this.initializeWebSocket()
    }

    // Setup cache cleanup
    this.setupCacheCleanup()
  }

  // =============================================================================
  // INITIALIZATION & SETUP
  // =============================================================================

  private createApiClient(): AxiosInstance {
    const client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Request interceptor for authentication
    client.interceptors.request.use((config) => {
      const { authentication } = this.config
      
      if (authentication.token) {
        switch (authentication.type) {
          case 'jwt':
            config.headers.Authorization = `Bearer ${authentication.token}`
            break
          case 'apikey':
            config.headers['X-API-Key'] = authentication.apiKey
            break
          case 'oauth':
            config.headers.Authorization = `Bearer ${authentication.token}`
            break
        }
      }

      return config
    })

    // Response interceptor for error handling
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            await this.refreshAuthToken()
            return client(originalRequest)
          } catch (refreshError) {
            this.handleAuthenticationError(refreshError)
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(this.normalizeError(error))
      }
    )

    return client
  }

  private initializeWebSocket(): void {
    if (!this.config.websocketUrl) return

    try {
      this.websocket = io(this.config.websocketUrl, {
        auth: {
          token: this.config.authentication.token
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      this.websocket.on('connect', () => {
        console.log('WebSocket connected to racine backend')
      })

      this.websocket.on('disconnect', () => {
        console.log('WebSocket disconnected from racine backend')
      })

      this.websocket.on('error', (error) => {
        console.error('WebSocket error:', error)
      })

      // Setup real-time event handlers
      this.setupRealTimeHandlers()
      
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }

  private setupRealTimeHandlers(): void {
    if (!this.websocket) return

    // System-wide events
    this.websocket.on('system_health_update', (data) => {
      this.invalidateCache('/api/health')
      this.emit('system_health_update', data)
    })

    this.websocket.on('metrics_update', (data) => {
      this.invalidateCache('/api/metrics')
      this.emit('metrics_update', data)
    })

    // Group-specific events
    this.websocket.on('workflow_status_change', (data) => {
      this.invalidateCache(`/api/workflows/${data.workflowId}`)
      this.emit('workflow_status_change', data)
    })

    this.websocket.on('pipeline_execution_update', (data) => {
      this.invalidateCache(`/api/pipelines/${data.pipelineId}`)
      this.emit('pipeline_execution_update', data)
    })

    this.websocket.on('scan_completed', (data) => {
      this.invalidateCache('/api/enterprise-scan-orchestration')
      this.emit('scan_completed', data)
    })

    this.websocket.on('activity_logged', (data) => {
      this.emit('activity_logged', data)
    })

    this.websocket.on('collaboration_update', (data) => {
      this.invalidateCache(`/api/collaboration/${data.spaceId}`)
      this.emit('collaboration_update', data)
    })
  }

  private setupCacheCleanup(): void {
    // Clean expired cache entries every 5 minutes
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiry < now) {
          this.cache.delete(key)
        }
      }
    }, 300000)
  }

  // =============================================================================
  // CORE API METHODS
  // =============================================================================

  private async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const cacheKey = `${method}:${endpoint}:${JSON.stringify(data || {})}`
    
    // Check cache for GET requests
    if (method === 'GET' && options.useCache !== false && this.config.enableCaching) {
      const cached = this.getFromCache<T>(cacheKey)
      if (cached) {
        return { success: true, data: cached }
      }
    }

    // Check for existing request to prevent duplicates
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)
    }

    const requestPromise = this.executeRequest<T>(method, endpoint, data, options, cacheKey)
    this.requestQueue.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.requestQueue.delete(cacheKey)
    }
  }

  private async executeRequest<T>(
    method: string,
    endpoint: string,
    data: any,
    options: RequestOptions,
    cacheKey: string
  ): Promise<ApiResponse<T>> {
    const retryAttempts = options.retryAttempts ?? this.config.retryAttempts
    let lastError: any

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const config: AxiosRequestConfig = {
          method,
          url: endpoint,
          ...options
        }

        if (data) {
          if (method === 'GET') {
            config.params = data
          } else {
            config.data = data
          }
        }

        const response: AxiosResponse = await this.apiClient(config)
        const result: ApiResponse<T> = this.normalizeResponse(response)

        // Cache successful GET responses
        if (method === 'GET' && result.success && this.config.enableCaching) {
          this.setCache(cacheKey, result.data, options.cacheTimeout)
        }

        return result

      } catch (error) {
        lastError = error
        
        if (attempt < retryAttempts && this.shouldRetry(error)) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt))
          continue
        }
        
        break
      }
    }

    if (!options.skipErrorHandling) {
      this.handleError(lastError, endpoint)
    }

    throw lastError
  }

  // =============================================================================
  // SYSTEM & HEALTH ENDPOINTS
  // =============================================================================

  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    return this.request('GET', GROUP_ENDPOINTS.health)
  }

  async getCrossGroupMetrics(): Promise<ApiResponse<CrossGroupMetrics>> {
    return this.request('GET', GROUP_ENDPOINTS.metrics)
  }

  async getIntegrationStatus(): Promise<ApiResponse<IntegrationStatus>> {
    return this.request('GET', `${GROUP_ENDPOINTS.enterpriseIntegration}/status`)
  }

  async globalSearch(params: {
    query: string
    scope: string[]
    userId?: string
    organizationId?: string
    filters?: Record<string, any>
  }): Promise<ApiResponse<any[]>> {
    return this.request('POST', GROUP_ENDPOINTS.search, params)
  }

  // =============================================================================
  // WORKSPACE MANAGEMENT
  // =============================================================================

  async getWorkspaces(userId: string): Promise<ApiResponse<Workspace[]>> {
    return this.request('GET', '/api/workspaces', { userId })
  }

  async createWorkspace(workspace: Partial<Workspace>): Promise<ApiResponse<Workspace>> {
    return this.request('POST', '/api/workspaces', workspace)
  }

  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<ApiResponse<Workspace>> {
    return this.request('PUT', `/api/workspaces/${id}`, updates)
  }

  async deleteWorkspace(id: string): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/api/workspaces/${id}`)
  }

  async getWorkspaceAnalytics(id: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/workspaces/${id}/analytics`)
  }

  // =============================================================================
  // WORKFLOW MANAGEMENT
  // =============================================================================

  async getWorkflows(workspaceId?: string): Promise<ApiResponse<JobWorkflow[]>> {
    return this.request('GET', GROUP_ENDPOINTS.enterpriseWorkflows, { workspaceId })
  }

  async createWorkflow(workflow: Partial<JobWorkflow>): Promise<ApiResponse<JobWorkflow>> {
    return this.request('POST', GROUP_ENDPOINTS.enterpriseWorkflows, workflow)
  }

  async updateWorkflow(id: string, updates: Partial<JobWorkflow>): Promise<ApiResponse<JobWorkflow>> {
    return this.request('PUT', `${GROUP_ENDPOINTS.enterpriseWorkflows}/${id}`, updates)
  }

  async executeWorkflow(id: string, parameters?: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request('POST', `${GROUP_ENDPOINTS.enterpriseWorkflows}/${id}/execute`, { parameters })
  }

  async getWorkflowExecution(workflowId: string, executionId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `${GROUP_ENDPOINTS.enterpriseWorkflows}/${workflowId}/executions/${executionId}`)
  }

  async getWorkflowTemplates(): Promise<ApiResponse<any[]>> {
    return this.request('GET', `${GROUP_ENDPOINTS.enterpriseWorkflows}/templates`)
  }

  // =============================================================================
  // PIPELINE MANAGEMENT
  // =============================================================================

  async getPipelines(workspaceId?: string): Promise<ApiResponse<Pipeline[]>> {
    return this.request('GET', GROUP_ENDPOINTS.enterprisePipelines, { workspaceId })
  }

  async createPipeline(pipeline: Partial<Pipeline>): Promise<ApiResponse<Pipeline>> {
    return this.request('POST', GROUP_ENDPOINTS.enterprisePipelines, pipeline)
  }

  async updatePipeline(id: string, updates: Partial<Pipeline>): Promise<ApiResponse<Pipeline>> {
    return this.request('PUT', `${GROUP_ENDPOINTS.enterprisePipelines}/${id}`, updates)
  }

  async executePipeline(id: string, parameters?: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request('POST', `${GROUP_ENDPOINTS.enterprisePipelines}/${id}/execute`, { parameters })
  }

  async getPipelineExecution(pipelineId: string, executionId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `${GROUP_ENDPOINTS.enterprisePipelines}/${pipelineId}/executions/${executionId}`)
  }

  async getPipelineTemplates(): Promise<ApiResponse<any[]>> {
    return this.request('GET', `${GROUP_ENDPOINTS.enterprisePipelines}/templates`)
  }

  // =============================================================================
  // AI ASSISTANT & INTELLIGENCE
  // =============================================================================

  async getAIAssistant(userId: string): Promise<ApiResponse<AIAssistant>> {
    return this.request('GET', `${GROUP_ENDPOINTS.aiServices}/assistant`, { userId })
  }

  async sendAIMessage(assistantId: string, message: string, context?: any): Promise<ApiResponse<any>> {
    return this.request('POST', `${GROUP_ENDPOINTS.aiServices}/assistant/${assistantId}/message`, {
      message,
      context
    })
  }

  async getAIRecommendations(context: any): Promise<ApiResponse<any[]>> {
    return this.request('POST', `${GROUP_ENDPOINTS.aiServices}/recommendations`, { context })
  }

  async getContextualHelp(context: any): Promise<ApiResponse<any>> {
    return this.request('POST', `${GROUP_ENDPOINTS.aiServices}/contextual-help`, { context })
  }

  // =============================================================================
  // ACTIVITY TRACKING
  // =============================================================================

  async getActivities(params: {
    userId?: string
    workspaceId?: string
    dateRange?: { start: string; end: string }
    types?: string[]
    limit?: number
    offset?: number
  }): Promise<ApiResponse<Activity[]>> {
    return this.request('GET', '/api/activities', params)
  }

  async trackActivity(activity: Partial<Activity>): Promise<ApiResponse<Activity>> {
    return this.request('POST', '/api/activities', activity)
  }

  async getActivityAnalytics(params: any): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/activities/analytics', params)
  }

  // =============================================================================
  // COLLABORATION
  // =============================================================================

  async getCollaborationSpaces(userId: string): Promise<ApiResponse<CollaborationSpace[]>> {
    return this.request('GET', '/api/collaboration/spaces', { userId })
  }

  async createCollaborationSpace(space: Partial<CollaborationSpace>): Promise<ApiResponse<CollaborationSpace>> {
    return this.request('POST', '/api/collaboration/spaces', space)
  }

  async joinCollaborationSpace(spaceId: string, userId: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/api/collaboration/spaces/${spaceId}/join`, { userId })
  }

  async sendCollaborationMessage(spaceId: string, channelId: string, message: any): Promise<ApiResponse<any>> {
    return this.request('POST', `/api/collaboration/spaces/${spaceId}/channels/${channelId}/messages`, message)
  }

  // =============================================================================
  // USER & PREFERENCES
  // =============================================================================

  async getUserPreferences(userId: string): Promise<ApiResponse<UserPreferences>> {
    return this.request('GET', `/api/users/${userId}/preferences`)
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    return this.request('PUT', `/api/users/${userId}/preferences`, preferences)
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.request('GET', `/api/users/${userId}`)
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('PUT', `/api/users/${userId}`, updates)
  }

  // =============================================================================
  // DASHBOARD & VISUALIZATION
  // =============================================================================

  async getDashboardConfig(userId: string, dashboardId?: string): Promise<ApiResponse<DashboardConfig>> {
    const endpoint = dashboardId 
      ? `/api/dashboards/${dashboardId}` 
      : `/api/users/${userId}/dashboard`
    return this.request('GET', endpoint)
  }

  async updateDashboardConfig(config: DashboardConfig): Promise<ApiResponse<DashboardConfig>> {
    return this.request('PUT', `/api/dashboards/${config.id}`, config)
  }

  async getDashboardData(dashboardId: string, filters?: any): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/dashboards/${dashboardId}/data`, filters)
  }

  // =============================================================================
  // GROUP-SPECIFIC ENDPOINTS
  // =============================================================================

  // Data Sources Group
  async getDataSources(): Promise<ApiResponse<any[]>> {
    return this.request('GET', GROUP_ENDPOINTS.dataSources)
  }

  async createDataSource(dataSource: any): Promise<ApiResponse<any>> {
    return this.request('POST', GROUP_ENDPOINTS.dataSources, dataSource)
  }

  async testDataSourceConnection(connectionConfig: any): Promise<ApiResponse<any>> {
    return this.request('POST', `${GROUP_ENDPOINTS.dataSourceConnections}/test`, connectionConfig)
  }

  // Scan Rule Sets Group
  async getScanRuleSets(): Promise<ApiResponse<any[]>> {
    return this.request('GET', GROUP_ENDPOINTS.scanRuleSets)
  }

  async createScanRuleSet(ruleSet: any): Promise<ApiResponse<any>> {
    return this.request('POST', GROUP_ENDPOINTS.scanRuleSets, ruleSet)
  }

  async getRuleTemplates(): Promise<ApiResponse<any[]>> {
    return this.request('GET', GROUP_ENDPOINTS.ruleTemplates)
  }

  // Advanced Catalog Group
  async getCatalogItems(params?: any): Promise<ApiResponse<any[]>> {
    return this.request('GET', GROUP_ENDPOINTS.catalogItems, params)
  }

  async discoverCatalogItems(config: any): Promise<ApiResponse<any>> {
    return this.request('POST', GROUP_ENDPOINTS.catalogDiscovery, config)
  }

  async getCatalogLineage(itemId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `${GROUP_ENDPOINTS.catalogLineage}/${itemId}`)
  }

  // Scan Logic Group
  async orchestrateScan(config: any): Promise<ApiResponse<any>> {
    return this.request('POST', GROUP_ENDPOINTS.scanOrchestration, config)
  }

  async getScanIntelligence(scanId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `${GROUP_ENDPOINTS.scanIntelligence}/${scanId}`)
  }

  async optimizeScan(scanId: string, config: any): Promise<ApiResponse<any>> {
    return this.request('POST', `${GROUP_ENDPOINTS.scanOptimization}/${scanId}`, config)
  }

  // Classifications Group
  async getClassifications(): Promise<ApiResponse<any[]>> {
    return this.request('GET', GROUP_ENDPOINTS.classifications)
  }

  async createClassification(classification: any): Promise<ApiResponse<any>> {
    return this.request('POST', GROUP_ENDPOINTS.classifications, classification)
  }

  // Compliance Rules Group
  async getComplianceRules(): Promise<ApiResponse<any[]>> {
    return this.request('GET', GROUP_ENDPOINTS.complianceRules)
  }

  async validateCompliance(config: any): Promise<ApiResponse<any>> {
    return this.request('POST', `${GROUP_ENDPOINTS.complianceRules}/validate`, config)
  }

  // RBAC System Group
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('GET', `${GROUP_ENDPOINTS.users}/me`)
  }

  async getUserRoles(userId: string): Promise<ApiResponse<any[]>> {
    return this.request('GET', `${GROUP_ENDPOINTS.roles}/user/${userId}`)
  }

  async getUserPermissions(userId: string): Promise<ApiResponse<string[]>> {
    return this.request('GET', `${GROUP_ENDPOINTS.permissions}/user/${userId}`)
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (entry && entry.expiry > Date.now()) {
      return entry.data as T
    }
    this.cache.delete(key)
    return null
  }

  private setCache<T>(key: string, data: T, timeout?: number): void {
    const expiry = Date.now() + (timeout || this.config.cacheTimeout)
    this.cache.set(key, { data, timestamp: Date.now(), expiry, key })
  }

  private invalidateCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  private normalizeResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      success: true,
      data: response.data,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: response.headers['x-request-id'] || '',
        version: response.headers['x-api-version'] || '1.0'
      }
    }
  }

  private normalizeError(error: any): ApiError {
    if (error.response) {
      return {
        code: error.response.status.toString(),
        message: error.response.data?.message || error.message,
        details: error.response.data
      }
    }
    
    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'An unexpected error occurred'
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors or 5xx server errors
    return !error.response || error.response.status >= 500
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private handleError(error: any, endpoint: string): void {
    console.error(`API Error for ${endpoint}:`, error)
    
    // Emit error event for global error handling
    this.emit('api_error', { error, endpoint })
  }

  private handleAuthenticationError(error: any): void {
    console.error('Authentication error:', error)
    this.emit('auth_error', error)
  }

  private async refreshAuthToken(): Promise<void> {
    if (!this.config.authentication.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.post(`${this.config.baseUrl}/api/auth/refresh`, {
        refreshToken: this.config.authentication.refreshToken
      })

      this.config.authentication.token = response.data.accessToken
      this.config.authentication.refreshToken = response.data.refreshToken
      
    } catch (error) {
      throw new Error('Failed to refresh authentication token')
    }
  }

  // =============================================================================
  // EVENT SYSTEM
  // =============================================================================

  private eventHandlers = new Map<string, Array<(data: any) => void>>()

  public on(event: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  public off(event: string, handler: (data: any) => void): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  // =============================================================================
  // LIFECYCLE METHODS
  // =============================================================================

  public setAuthToken(token: string, refreshToken?: string): void {
    this.config.authentication.token = token
    if (refreshToken) {
      this.config.authentication.refreshToken = refreshToken
    }
  }

  public clearCache(): void {
    this.cache.clear()
  }

  public disconnect(): void {
    if (this.websocket) {
      this.websocket.disconnect()
      this.websocket = null
    }
    this.cache.clear()
    this.requestQueue.clear()
    this.eventHandlers.clear()
  }

  public reconnect(): void {
    if (this.config.enableRealTime) {
      this.initializeWebSocket()
    }
  }

  public getConnectionStatus(): { connected: boolean; quality: string } {
    return {
      connected: this.websocket?.connected || false,
      quality: this.websocket?.connected ? 'good' : 'disconnected'
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const racineApiService = new RacineApiService()
export default racineApiService