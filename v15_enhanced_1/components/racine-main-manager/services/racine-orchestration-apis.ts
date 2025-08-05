/**
 * Racine Orchestration APIs - Master Integration Service
 * ======================================================
 * 
 * Primary API service for Racine Main Manager SPA orchestration.
 * Integrates with all backend services for seamless cross-group coordination.
 * 
 * Backend Integration:
 * - Primary Service: backend/scripts_automation/app/services/racine_orchestration_service.py
 * - Secondary Services: enterprise_integration_service.py, unified_governance_coordinator.py
 * - API Routes: backend/scripts_automation/app/api/routes/racine_routes.py
 */

import { 
  RacineWorkspace, 
  RacineWorkflow, 
  RacinePipeline,
  RacineActivity,
  RacineSystemMetrics,
  SystemState,
  SystemAlert,
  APIResponse,
  SearchQuery,
  RacineGroupType,
  RacineSystemStatus
} from '../types/racine-core.types';

// ============================================================================
// BASE API CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const RACINE_API_PREFIX = '/racine';

interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

class RacineAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'RacineAPIError';
  }
}

// ============================================================================
// API CLIENT UTILITY
// ============================================================================

class RacineAPIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = `${API_BASE_URL}${RACINE_API_PREFIX}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit & RequestConfig = {}
  ): Promise<APIResponse<T>> {
    const { headers = {}, timeout = 30000, retries = 3, ...fetchOptions } = options;
    
    const url = `${this.baseURL}${endpoint}`;
    const requestHeaders = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: requestHeaders,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new RacineAPIError(
            errorData.message || `HTTP ${response.status}`,
            errorData.code || 'HTTP_ERROR',
            response.status,
            errorData.details
          );
        }

        const data = await response.json();
        return data as APIResponse<T>;

      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        // Exponential backoff for retries
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new RacineAPIError('Max retries exceeded', 'MAX_RETRIES', 0);
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', ...config });
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', ...config });
  }
}

// ============================================================================
// RACINE ORCHESTRATION SERVICE
// ============================================================================

export class RacineOrchestrationAPI {
  private client: RacineAPIClient;

  constructor() {
    this.client = new RacineAPIClient();
  }

  // ========================================================================
  // SYSTEM HEALTH AND STATUS
  // ========================================================================

  /**
   * Get comprehensive system health across all groups
   * Maps to: RacineOrchestrationService.orchestrate_system_health_monitoring()
   */
  async getSystemHealth(): Promise<APIResponse<SystemState>> {
    return this.client.get<SystemState>('/health');
  }

  /**
   * Get current system status and metrics
   * Maps to: RacineOrchestrationService.get_system_status()
   */
  async getSystemStatus(): Promise<APIResponse<{
    status: RacineSystemStatus;
    metrics: RacineSystemMetrics[];
    alerts: SystemAlert[];
    group_status: Record<RacineGroupType, RacineSystemStatus>;
  }>> {
    return this.client.get('/status');
  }

  /**
   * Get real-time system metrics
   * Maps to: RacineOrchestrationService.stream_system_metrics()
   */
  async getSystemMetrics(filters?: {
    groups?: RacineGroupType[];
    metric_types?: string[];
    time_range?: { start: string; end: string };
  }): Promise<APIResponse<RacineSystemMetrics[]>> {
    const params = new URLSearchParams();
    if (filters?.groups) params.append('groups', filters.groups.join(','));
    if (filters?.metric_types) params.append('metric_types', filters.metric_types.join(','));
    if (filters?.time_range) {
      params.append('start_time', filters.time_range.start);
      params.append('end_time', filters.time_range.end);
    }

    return this.client.get<RacineSystemMetrics[]>(`/metrics?${params}`);
  }

  // ========================================================================
  // WORKSPACE MANAGEMENT
  // ========================================================================

  /**
   * Create new unified workspace
   * Maps to: RacineWorkspaceService.create_unified_workspace()
   */
  async createWorkspace(workspaceData: {
    name: string;
    description?: string;
    environment: string;
    configuration?: Record<string, any>;
    resource_quotas?: Record<string, any>;
    collaboration_settings?: Record<string, any>;
    security_settings?: Record<string, any>;
  }): Promise<APIResponse<RacineWorkspace>> {
    return this.client.post<RacineWorkspace>('/workspaces', workspaceData);
  }

  /**
   * Get workspace details and resources
   * Maps to: RacineWorkspaceService.get_workspace_details()
   */
  async getWorkspace(workspaceId: string): Promise<APIResponse<RacineWorkspace & {
    resources: any[];
    analytics: Record<string, any>;
    collaboration_status: Record<string, any>;
  }>> {
    return this.client.get<RacineWorkspace & {
      resources: any[];
      analytics: Record<string, any>;
      collaboration_status: Record<string, any>;
    }>(`/workspaces/${workspaceId}`);
  }

  /**
   * Get all workspaces for current user
   * Maps to: RacineWorkspaceService.get_user_workspaces()
   */
  async getUserWorkspaces(filters?: {
    environment?: string;
    status?: RacineSystemStatus;
    search?: string;
  }): Promise<APIResponse<RacineWorkspace[]>> {
    const params = new URLSearchParams();
    if (filters?.environment) params.append('environment', filters.environment);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    return this.client.get<RacineWorkspace[]>(`/workspaces?${params}`);
  }

  /**
   * Update workspace configuration
   * Maps to: RacineWorkspaceService.update_workspace()
   */
  async updateWorkspace(
    workspaceId: string, 
    updateData: Partial<RacineWorkspace>
  ): Promise<APIResponse<RacineWorkspace>> {
    return this.client.put<RacineWorkspace>(`/workspaces/${workspaceId}`, updateData);
  }

  /**
   * Delete workspace and associated resources
   * Maps to: RacineWorkspaceService.delete_workspace()
   */
  async deleteWorkspace(workspaceId: string): Promise<APIResponse<{ success: boolean }>> {
    return this.client.delete<{ success: boolean }>(`/workspaces/${workspaceId}`);
  }

  /**
   * Get all resources associated with workspace
   * Maps to: RacineWorkspaceService.get_workspace_resources()
   */
  async getWorkspaceResources(
    workspaceId: string,
    filters?: {
      group_type?: RacineGroupType;
      resource_type?: string;
      status?: string;
    }
  ): Promise<APIResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters?.group_type) params.append('group_type', filters.group_type);
    if (filters?.resource_type) params.append('resource_type', filters.resource_type);
    if (filters?.status) params.append('status', filters.status);

    return this.client.get<any[]>(`/workspaces/${workspaceId}/resources?${params}`);
  }

  // ========================================================================
  // CROSS-GROUP OPERATIONS
  // ========================================================================

  /**
   * Coordinate operations across multiple groups
   * Maps to: RacineOrchestrationService.coordinate_cross_group_operations()
   */
  async coordinateCrossGroupOperation(operationData: {
    operation_type: string;
    target_groups: RacineGroupType[];
    operation_config: Record<string, any>;
    workspace_id?: string;
    priority?: string;
    dependencies?: string[];
  }): Promise<APIResponse<{
    operation_id: string;
    status: string;
    execution_details: Record<string, any>;
  }>> {
    return this.client.post('/cross-group/coordinate', operationData);
  }

  /**
   * Get analytics across all groups
   * Maps to: RacineOrchestrationService.orchestrate_cross_group_analytics()
   */
  async getCrossGroupAnalytics(analyticsRequest: {
    metric_types: string[];
    groups?: RacineGroupType[];
    time_range?: { start: string; end: string };
    aggregation_level?: string;
    workspace_id?: string;
  }): Promise<APIResponse<{
    metrics: Record<string, any>;
    trends: Record<string, any>;
    insights: any[];
    recommendations: any[];
  }>> {
    return this.client.post('/cross-group/analytics', analyticsRequest);
  }

  /**
   * Synchronize data across groups
   * Maps to: RacineOrchestrationService.synchronize_cross_group_data()
   */
  async syncCrossGroupData(syncConfig: {
    source_group: RacineGroupType;
    target_groups: RacineGroupType[];
    sync_type: string;
    data_filters?: Record<string, any>;
    conflict_resolution?: string;
  }): Promise<APIResponse<{
    sync_id: string;
    status: string;
    sync_results: Record<string, any>;
  }>> {
    return this.client.post('/cross-group/sync', syncConfig);
  }

  // ========================================================================
  // SYSTEM INITIALIZATION AND MANAGEMENT
  // ========================================================================

  /**
   * Initialize racine system
   * Maps to: RacineOrchestrationService.initialize_racine_system()
   */
  async initializeSystem(initConfig?: {
    force_reset?: boolean;
    migration_config?: Record<string, any>;
    seed_data?: boolean;
  }): Promise<APIResponse<{
    initialization_id: string;
    status: string;
    system_state: SystemState;
    initialization_logs: any[];
  }>> {
    return this.client.post('/initialize', initConfig);
  }

  /**
   * Get system configuration
   * Maps to: RacineOrchestrationService.get_system_configuration()
   */
  async getSystemConfiguration(): Promise<APIResponse<{
    configuration: Record<string, any>;
    group_configurations: Record<RacineGroupType, Record<string, any>>;
    feature_flags: Record<string, boolean>;
    resource_limits: Record<string, any>;
  }>> {
    return this.client.get('/configuration');
  }

  /**
   * Update system configuration
   * Maps to: RacineOrchestrationService.update_system_configuration()
   */
  async updateSystemConfiguration(configUpdate: {
    configuration?: Record<string, any>;
    group_configurations?: Record<RacineGroupType, Record<string, any>>;
    feature_flags?: Record<string, boolean>;
    apply_immediately?: boolean;
  }): Promise<APIResponse<{
    update_id: string;
    status: string;
    applied_changes: Record<string, any>;
  }>> {
    return this.client.put('/configuration', configUpdate);
  }

  // ========================================================================
  // PERFORMANCE AND MONITORING
  // ========================================================================

  /**
   * Get performance analytics
   * Maps to: RacineOrchestrationService.get_performance_analytics()
   */
  async getPerformanceAnalytics(request: {
    groups?: RacineGroupType[];
    metric_categories?: string[];
    time_range?: { start: string; end: string };
    aggregation_interval?: string;
  }): Promise<APIResponse<{
    performance_metrics: Record<string, any>;
    bottlenecks: any[];
    optimization_opportunities: any[];
    performance_trends: Record<string, any>;
  }>> {
    const params = new URLSearchParams();
    if (request.groups) params.append('groups', request.groups.join(','));
    if (request.metric_categories) params.append('categories', request.metric_categories.join(','));
    if (request.time_range) {
      params.append('start_time', request.time_range.start);
      params.append('end_time', request.time_range.end);
    }
    if (request.aggregation_interval) params.append('interval', request.aggregation_interval);

    return this.client.get(`/performance/analytics?${params}`);
  }

  /**
   * Get system alerts
   * Maps to: RacineOrchestrationService.get_system_alerts()
   */
  async getSystemAlerts(filters?: {
    severity?: string[];
    groups?: RacineGroupType[];
    alert_types?: string[];
    status?: string;
    limit?: number;
  }): Promise<APIResponse<SystemAlert[]>> {
    const params = new URLSearchParams();
    if (filters?.severity) params.append('severity', filters.severity.join(','));
    if (filters?.groups) params.append('groups', filters.groups.join(','));
    if (filters?.alert_types) params.append('types', filters.alert_types.join(','));
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.client.get<SystemAlert[]>(`/alerts?${params}`);
  }

  /**
   * Acknowledge system alert
   * Maps to: RacineOrchestrationService.acknowledge_alert()
   */
  async acknowledgeAlert(
    alertId: string, 
    acknowledgment: {
      acknowledged_by: string;
      acknowledgment_note?: string;
      action_taken?: string;
    }
  ): Promise<APIResponse<SystemAlert>> {
    return this.client.put<SystemAlert>(`/alerts/${alertId}/acknowledge`, acknowledgment);
  }

  // ========================================================================
  // SEARCH AND DISCOVERY
  // ========================================================================

  /**
   * Unified search across all groups
   * Maps to: RacineOrchestrationService.unified_search()
   */
  async unifiedSearch(searchQuery: SearchQuery & {
    groups?: RacineGroupType[];
    resource_types?: string[];
    workspace_id?: string;
  }): Promise<APIResponse<{
    results: any[];
    aggregations: Record<string, any>;
    suggestions: string[];
    search_metadata: Record<string, any>;
  }>> {
    return this.client.post('/search', searchQuery);
  }

  /**
   * Get search suggestions
   * Maps to: RacineOrchestrationService.get_search_suggestions()
   */
  async getSearchSuggestions(query: string, context?: {
    current_workspace?: string;
    user_context?: Record<string, any>;
  }): Promise<APIResponse<{
    suggestions: string[];
    popular_searches: string[];
    contextual_suggestions: string[];
  }>> {
    const params = new URLSearchParams();
    params.append('query', query);
    if (context?.current_workspace) params.append('workspace', context.current_workspace);

    return this.client.get(`/search/suggestions?${params}`);
  }
}

// ============================================================================
// WEBSOCKET INTEGRATION
// ============================================================================

export class RacineWebSocketManager {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;

  constructor(private userId: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/racine/ws/${this.userId}`;
      
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('Racine WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('Racine WebSocket disconnected');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('Racine WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: any) {
    const { type, payload } = data;
    const subscribers = this.subscribers.get(type);
    
    if (subscribers) {
      subscribers.forEach(callback => callback(payload));
    }

    // Handle global events
    if (type === 'system_alert') {
      this.notifySubscribers('alerts', payload);
    } else if (type === 'system_health_update') {
      this.notifySubscribers('health', payload);
    } else if (type === 'cross_group_event') {
      this.notifySubscribers('cross_group', payload);
    }
  }

  private notifySubscribers(eventType: string, data: any) {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.forEach(callback => callback(data));
    }
  }

  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const racineOrchestrationAPI = new RacineOrchestrationAPI();
export default racineOrchestrationAPI;