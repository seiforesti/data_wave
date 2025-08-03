/**
 * Frontend Governance Orchestrator Service
 * ========================================
 * 
 * Frontend counterpart to the backend UnifiedGovernanceOrchestrator that provides
 * seamless integration across all 6 data governance groups.
 * 
 * Features:
 * - Cross-group workflow coordination
 * - Real-time event synchronization
 * - Collaborative workflow management
 * - Unified state management
 * - Enterprise-grade error handling
 * - Performance monitoring
 */

import axios, { AxiosResponse } from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { filter, map, debounceTime } from 'rxjs/operators';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export enum EventType {
  DATA_SOURCE_CREATED = 'data_source_created',
  DATA_SOURCE_UPDATED = 'data_source_updated',
  DATA_SOURCE_SCANNED = 'data_source_scanned',
  ASSET_DISCOVERED = 'asset_discovered',
  CLASSIFICATION_APPLIED = 'classification_applied',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  SCAN_RULE_EXECUTED = 'scan_rule_executed',
  WORKFLOW_TRIGGERED = 'workflow_triggered',
  COLLABORATION_INITIATED = 'collaboration_initiated',
  QUALITY_ALERT = 'quality_alert',
  SECURITY_INCIDENT = 'security_incident'
}

export enum ServiceGroup {
  DATA_SOURCES = 'data_sources',
  CATALOG = 'catalog',
  CLASSIFICATIONS = 'classifications',
  COMPLIANCE = 'compliance',
  SCAN_RULESETS = 'scan_rulesets',
  SCAN_LOGIC = 'scan_logic'
}

export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export interface GovernanceEvent {
  id: string;
  type: EventType;
  source_group: ServiceGroup;
  target_groups: ServiceGroup[];
  payload: Record<string, any>;
  timestamp: string;
  user_id?: number;
  correlation_id?: string;
  priority: number;
  retry_count: number;
  max_retries: number;
  depends_on: string[];
  metadata: Record<string, any>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger_events: EventType[];
  steps: Array<{
    action: string;
    group: string;
    parameters?: Record<string, any>;
  }>;
  groups_involved: ServiceGroup[];
  requires_approval: boolean;
  timeout_minutes: number;
  rbac_permissions: string[];
  condition_checks: string[];
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: WorkflowStatus;
  current_step: number;
  started_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
  context: Record<string, any>;
  results: Record<string, any>;
  user_id?: number;
}

export interface OrchestrationMetrics {
  events_processed: number;
  workflows_executed: number;
  cross_group_operations: number;
  average_response_time: number;
  error_rate: number;
  active_workflows: number;
  registered_workflows: number;
  event_handlers: Record<string, number>;
}

export interface IntelligentScanRequest {
  data_source_id: number;
  scan_type?: string;
  enable_classification?: boolean;
  enable_compliance?: boolean;
  enable_quality_assessment?: boolean;
  custom_rules?: string[];
}

export interface IntelligentScanResult {
  scan_run: any;
  classification_results: any;
  catalog_sync: any;
  compliance_results: any[];
  orchestration_id: string;
  results_summary: {
    entities_discovered: number;
    classifications_applied: number;
    compliance_violations: number;
  };
}

export interface CollaborativeWorkflowRequest {
  workflow_type: string;
  participants: number[];
  context: Record<string, any>;
  initiator_id: number;
}

// ============================================================================
// GOVERNANCE ORCHESTRATOR SERVICE
// ============================================================================

class GovernanceOrchestratorService {
  private baseUrl: string;
  private eventBus = new BehaviorSubject<GovernanceEvent | null>(null);
  private workflowUpdates = new BehaviorSubject<WorkflowExecution | null>(null);
  private isConnected = false;
  private eventSource?: EventSource;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    this.initializeEventStreaming();
  }

  // ============================================================================
  // API CONFIGURATION
  // ============================================================================

  private get apiClient() {
    return axios.create({
      baseURL: `${this.baseUrl}/api/v1/governance`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('auth_token')}`,
        'X-Client-Version': '1.0.0',
        'X-Feature-Set': 'enterprise-governance'
      },
      timeout: 60000 // 1 minute timeout for complex operations
    });
  }

  // ============================================================================
  // EVENT MANAGEMENT
  // ============================================================================

  /**
   * Emit a governance event
   */
  async emitEvent(
    eventType: EventType,
    sourceGroup: ServiceGroup,
    payload: Record<string, any>,
    options: {
      targetGroups?: ServiceGroup[];
      priority?: number;
      correlationId?: string;
    } = {}
  ): Promise<string> {
    try {
      const response = await this.apiClient.post('/events', {
        event_type: eventType,
        source_group: sourceGroup,
        payload,
        target_groups: options.targetGroups,
        priority: options.priority || 5,
        correlation_id: options.correlationId
      });

      return response.data.event_id;
    } catch (error) {
      console.error('Failed to emit governance event:', error);
      throw new Error('Unable to emit governance event. Please try again.');
    }
  }

  /**
   * Get event stream observable
   */
  getEventStream(): Observable<GovernanceEvent> {
    return this.eventBus.asObservable().pipe(
      filter((event): event is GovernanceEvent => event !== null)
    );
  }

  /**
   * Get filtered event stream by type
   */
  getEventStreamByType(eventType: EventType): Observable<GovernanceEvent> {
    return this.getEventStream().pipe(
      filter(event => event.type === eventType)
    );
  }

  /**
   * Get filtered event stream by group
   */
  getEventStreamByGroup(group: ServiceGroup): Observable<GovernanceEvent> {
    return this.getEventStream().pipe(
      filter(event => event.source_group === group || event.target_groups.includes(group))
    );
  }

  // ============================================================================
  // WORKFLOW MANAGEMENT
  // ============================================================================

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    context: Record<string, any>
  ): Promise<WorkflowExecution> {
    try {
      const response = await this.apiClient.post(`/workflows/${workflowId}/execute`, {
        context
      });

      return response.data;
    } catch (error) {
      console.error(`Failed to execute workflow ${workflowId}:`, error);
      throw new Error('Unable to execute workflow. Please try again.');
    }
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(executionId: string): Promise<WorkflowExecution> {
    try {
      const response = await this.apiClient.get(`/workflows/executions/${executionId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get workflow status ${executionId}:`, error);
      throw new Error('Unable to get workflow status. Please try again.');
    }
  }

  /**
   * Get workflow stream observable
   */
  getWorkflowUpdates(): Observable<WorkflowExecution> {
    return this.workflowUpdates.asObservable().pipe(
      filter((workflow): workflow is WorkflowExecution => workflow !== null)
    );
  }

  /**
   * Cancel a workflow
   */
  async cancelWorkflow(executionId: string, reason?: string): Promise<void> {
    try {
      await this.apiClient.post(`/workflows/executions/${executionId}/cancel`, {
        reason: reason || 'User requested cancellation'
      });
    } catch (error) {
      console.error(`Failed to cancel workflow ${executionId}:`, error);
      throw new Error('Unable to cancel workflow. Please try again.');
    }
  }

  /**
   * Get available workflow definitions
   */
  async getWorkflowDefinitions(): Promise<WorkflowDefinition[]> {
    try {
      const response = await this.apiClient.get('/workflows/definitions');
      return response.data;
    } catch (error) {
      console.error('Failed to get workflow definitions:', error);
      throw new Error('Unable to load workflow definitions. Please try again.');
    }
  }

  // ============================================================================
  // CROSS-GROUP ORCHESTRATION
  // ============================================================================

  /**
   * Orchestrate intelligent scan across all groups
   */
  async orchestrateIntelligentScan(
    request: IntelligentScanRequest
  ): Promise<IntelligentScanResult> {
    try {
      const response = await this.apiClient.post('/orchestrate/intelligent-scan', request);
      return response.data;
    } catch (error) {
      console.error('Failed to orchestrate intelligent scan:', error);
      throw new Error('Unable to start intelligent scan. Please try again.');
    }
  }

  /**
   * Sync data source to catalog
   */
  async syncDataSourceToCatalog(
    dataSourceId: number
  ): Promise<{ success: boolean; catalog_asset_id: string; data_source_id: number }> {
    try {
      const response = await this.apiClient.post('/orchestrate/sync-datasource-catalog', {
        data_source_id: dataSourceId
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to sync data source ${dataSourceId} to catalog:`, error);
      throw new Error('Unable to sync data source to catalog. Please try again.');
    }
  }

  /**
   * Apply classifications to scan results
   */
  async applyClassificationsToScanResults(
    scanRunId: string
  ): Promise<{
    entities_classified: number;
    classifications_applied: any[];
    catalog_updates: number;
  }> {
    try {
      const response = await this.apiClient.post('/orchestrate/apply-classifications', {
        scan_run_id: scanRunId
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to apply classifications to scan ${scanRunId}:`, error);
      throw new Error('Unable to apply classifications. Please try again.');
    }
  }

  /**
   * Execute compliance validation
   */
  async executeComplianceValidation(
    assetId: string,
    classificationData: Record<string, any>
  ): Promise<{
    asset_id: string;
    compliance_status: 'compliant' | 'non_compliant';
    violations: any[];
    recommendations: string[];
    risk_score: number;
  }> {
    try {
      const response = await this.apiClient.post('/orchestrate/compliance-validation', {
        asset_id: assetId,
        classification_data: classificationData
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to execute compliance validation for ${assetId}:`, error);
      throw new Error('Unable to execute compliance validation. Please try again.');
    }
  }

  // ============================================================================
  // COLLABORATION
  // ============================================================================

  /**
   * Initiate collaborative workflow
   */
  async initiateCollaborativeWorkflow(
    request: CollaborativeWorkflowRequest
  ): Promise<string> {
    try {
      const response = await this.apiClient.post('/orchestrate/collaborative-workflow', request);
      return response.data.workflow_id;
    } catch (error) {
      console.error('Failed to initiate collaborative workflow:', error);
      throw new Error('Unable to start collaborative workflow. Please try again.');
    }
  }

  /**
   * Get collaboration participants
   */
  async getCollaborationParticipants(workflowId: string): Promise<any[]> {
    try {
      const response = await this.apiClient.get(`/collaborations/${workflowId}/participants`);
      return response.data.participants;
    } catch (error) {
      console.error(`Failed to get collaboration participants for ${workflowId}:`, error);
      throw new Error('Unable to load collaboration participants. Please try again.');
    }
  }

  /**
   * Update collaboration status
   */
  async updateCollaborationStatus(
    workflowId: string,
    status: string,
    comments?: string
  ): Promise<void> {
    try {
      await this.apiClient.patch(`/collaborations/${workflowId}`, {
        status,
        comments
      });
    } catch (error) {
      console.error(`Failed to update collaboration status for ${workflowId}:`, error);
      throw new Error('Unable to update collaboration status. Please try again.');
    }
  }

  // ============================================================================
  // MONITORING AND METRICS
  // ============================================================================

  /**
   * Get orchestration metrics
   */
  async getOrchestrationMetrics(): Promise<OrchestrationMetrics> {
    try {
      const response = await this.apiClient.get('/metrics');
      return response.data;
    } catch (error) {
      console.error('Failed to get orchestration metrics:', error);
      throw new Error('Unable to load orchestration metrics. Please try again.');
    }
  }

  /**
   * Get active workflows
   */
  async getActiveWorkflows(): Promise<WorkflowExecution[]> {
    try {
      const response = await this.apiClient.get('/workflows/active');
      return response.data;
    } catch (error) {
      console.error('Failed to get active workflows:', error);
      throw new Error('Unable to load active workflows. Please try again.');
    }
  }

  /**
   * Get workflow history
   */
  async getWorkflowHistory(
    filters: {
      workflowId?: string;
      status?: WorkflowStatus;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
    } = {}
  ): Promise<WorkflowExecution[]> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await this.apiClient.get(`/workflows/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get workflow history:', error);
      throw new Error('Unable to load workflow history. Please try again.');
    }
  }

  // ============================================================================
  // REAL-TIME EVENT STREAMING
  // ============================================================================

  private initializeEventStreaming(): void {
    this.connectEventStream();
  }

  private connectEventStream(): void {
    if (this.isConnected) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const eventSourceUrl = `${this.baseUrl}/api/v1/governance/events/stream`;
      
      this.eventSource = new EventSource(
        `${eventSourceUrl}${token ? `?token=${encodeURIComponent(token)}` : ''}`,
        { withCredentials: true }
      );

      this.eventSource.onopen = () => {
        console.log('🔗 Connected to governance event stream');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const governanceEvent: GovernanceEvent = JSON.parse(event.data);
          this.eventBus.next(governanceEvent);
          
          // Emit to global event bus if available
          if (window.enterpriseEventBus) {
            window.enterpriseEventBus.emit('governance:event', governanceEvent);
          }
        } catch (error) {
          console.error('Failed to parse governance event:', error);
        }
      };

      this.eventSource.addEventListener('workflow_update', (event) => {
        try {
          const workflowExecution: WorkflowExecution = JSON.parse(event.data);
          this.workflowUpdates.next(workflowExecution);
        } catch (error) {
          console.error('Failed to parse workflow update:', error);
        }
      });

      this.eventSource.onerror = () => {
        console.warn('⚠️ Governance event stream connection lost');
        this.isConnected = false;
        this.eventSource?.close();
        this.scheduleReconnect();
      };

    } catch (error) {
      console.error('Failed to initialize governance event stream:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached for governance event stream');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s
    this.reconnectAttempts++;

    console.log(`🔄 Attempting to reconnect governance event stream in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connectEventStream();
    }, delay);
  }

  /**
   * Disconnect from event stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.isConnected = false;
    }
  }

  /**
   * Get connection status
   */
  isEventStreamConnected(): boolean {
    return this.isConnected;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const governanceOrchestrator = new GovernanceOrchestratorService();

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Hook for orchestration metrics
 */
export const useOrchestrationMetrics = () => {
  return useQuery({
    queryKey: ['governance-metrics'],
    queryFn: () => governanceOrchestrator.getOrchestrationMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // 10 seconds
  });
};

/**
 * Hook for active workflows
 */
export const useActiveWorkflows = () => {
  return useQuery({
    queryKey: ['active-workflows'],
    queryFn: () => governanceOrchestrator.getActiveWorkflows(),
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // 5 seconds
  });
};

/**
 * Hook for workflow definitions
 */
export const useWorkflowDefinitions = () => {
  return useQuery({
    queryKey: ['workflow-definitions'],
    queryFn: () => governanceOrchestrator.getWorkflowDefinitions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for workflow history
 */
export const useWorkflowHistory = (filters: any = {}) => {
  return useQuery({
    queryKey: ['workflow-history', filters],
    queryFn: () => governanceOrchestrator.getWorkflowHistory(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Mutation hook for intelligent scan
 */
export const useIntelligentScan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: IntelligentScanRequest) =>
      governanceOrchestrator.orchestrateIntelligentScan(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['governance-metrics'] });
    },
  });
};

/**
 * Mutation hook for collaborative workflow
 */
export const useCollaborativeWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CollaborativeWorkflowRequest) =>
      governanceOrchestrator.initiateCollaborativeWorkflow(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-workflows'] });
    },
  });
};

/**
 * Mutation hook for workflow execution
 */
export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workflowId, context }: { workflowId: string; context: Record<string, any> }) =>
      governanceOrchestrator.executeWorkflow(workflowId, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['governance-metrics'] });
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for event stream subscription
 */
export const useGovernanceEvents = (eventType?: EventType, group?: ServiceGroup) => {
  const [events, setEvents] = React.useState<GovernanceEvent[]>([]);
  
  React.useEffect(() => {
    let stream$: Observable<GovernanceEvent>;
    
    if (eventType) {
      stream$ = governanceOrchestrator.getEventStreamByType(eventType);
    } else if (group) {
      stream$ = governanceOrchestrator.getEventStreamByGroup(group);
    } else {
      stream$ = governanceOrchestrator.getEventStream();
    }
    
    const subscription = stream$.pipe(
      debounceTime(100) // Prevent rapid updates
    ).subscribe((event) => {
      setEvents(prev => [event, ...prev].slice(0, 100)); // Keep last 100 events
    });
    
    return () => subscription.unsubscribe();
  }, [eventType, group]);
  
  return events;
};

/**
 * Hook for workflow status subscription
 */
export const useWorkflowStatus = (executionId?: string) => {
  const [workflow, setWorkflow] = React.useState<WorkflowExecution | null>(null);
  
  React.useEffect(() => {
    if (!executionId) return;
    
    const subscription = governanceOrchestrator.getWorkflowUpdates().pipe(
      filter(update => update.id === executionId)
    ).subscribe(setWorkflow);
    
    return () => subscription.unsubscribe();
  }, [executionId]);
  
  return workflow;
};

// ============================================================================
// EXPORT SERVICE AND HOOKS
// ============================================================================

export default governanceOrchestrator;

// Type exports
export type {
  GovernanceEvent,
  WorkflowDefinition,
  WorkflowExecution,
  OrchestrationMetrics,
  IntelligentScanRequest,
  IntelligentScanResult,
  CollaborativeWorkflowRequest
};