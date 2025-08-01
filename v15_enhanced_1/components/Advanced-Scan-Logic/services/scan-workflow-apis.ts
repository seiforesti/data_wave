// Advanced-Scan-Logic/services/scan-workflow-apis.ts
// Comprehensive scan workflow API service aligned with backend routes

import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStep,
  WorkflowTemplate,
  WorkflowVersion,
  WorkflowMetrics,
  DependencyGraph,
  ConditionalLogic,
  ApprovalWorkflow,
  WorkflowStatus,
  WorkflowPriority,
  StepType,
  ApprovalStatus,
  ExecutionContext,
  WorkflowConfiguration,
  WorkflowValidation,
  WorkflowSchedule
} from '../types/workflow.types';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Request/Response types
interface WorkflowTemplateRequest {
  name: string;
  type: string;
  description?: string;
  version?: string;
  configuration: Record<string, any>;
  stages: Record<string, any>[];
  default_parameters?: Record<string, any>;
  is_active?: boolean;
}

interface WorkflowExecutionRequest {
  template_id: string;
  name?: string;
  description?: string;
  priority?: string;
  parameters?: Record<string, any>;
  variables?: Record<string, any>;
  scheduled_at?: string;
}

interface WorkflowApprovalRequest {
  workflow_id: string;
  approval_type: string;
  decision: 'approve' | 'reject';
  comments?: string;
  approval_data?: Record<string, any>;
}

interface WorkflowControlRequest {
  action: 'pause' | 'resume' | 'cancel';
  reason?: string;
}

interface WorkflowAnalyticsRequest {
  time_range: string;
  template_ids?: string[];
  status_filter?: string[];
  metrics?: string[];
}

class ScanWorkflowAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/scan-workflows`;
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================== WORKFLOW TEMPLATES ====================

  /**
   * Create a new workflow template
   * Maps to: POST /scan-workflows/templates
   * Backend: scan_workflow_routes.py -> create_workflow_template
   */
  async createWorkflowTemplate(request: WorkflowTemplateRequest): Promise<WorkflowTemplate> {
    const response = await fetch(`${this.baseUrl}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get all workflow templates
   * Maps to: GET /scan-workflows/templates
   * Backend: scan_workflow_routes.py -> list_workflow_templates
   */
  async getWorkflowTemplates(params: {
    workflow_type?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
    size?: number;
  } = {}): Promise<{
    templates: WorkflowTemplate[];
    total: number;
    page: number;
    size: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.workflow_type) queryParams.append('workflow_type', params.workflow_type);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());

    const response = await fetch(`${this.baseUrl}/templates?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get workflow template by ID
   * Maps to: GET /scan-workflows/templates/{template_id}
   * Backend: scan_workflow_routes.py -> get_workflow_template
   */
  async getWorkflowTemplate(templateId: string): Promise<WorkflowTemplate> {
    const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Update workflow template
   * Maps to: PUT /scan-workflows/templates/{template_id}
   * Backend: scan_workflow_routes.py -> update_workflow_template
   */
  async updateWorkflowTemplate(templateId: string, updates: Partial<WorkflowTemplateRequest>): Promise<WorkflowTemplate> {
    const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(updates)
    });

    return this.handleResponse(response);
  }

  /**
   * Delete workflow template
   * Maps to: DELETE /scan-workflows/templates/{template_id}
   * Backend: scan_workflow_routes.py -> delete_workflow_template
   */
  async deleteWorkflowTemplate(templateId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Validate workflow template
   * Maps to: POST /scan-workflows/templates/{template_id}/validate
   * Backend: scan_workflow_routes.py -> validate_workflow_template
   */
  async validateWorkflowTemplate(templateId: string): Promise<WorkflowValidation> {
    const response = await fetch(`${this.baseUrl}/templates/${templateId}/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== WORKFLOW EXECUTION ====================

  /**
   * Execute workflow from template
   * Maps to: POST /scan-workflows/execute
   * Backend: scan_workflow_routes.py -> execute_workflow
   */
  async executeWorkflow(request: WorkflowExecutionRequest): Promise<{
    workflow_id: string;
    execution: WorkflowExecution;
    status: string;
  }> {
    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get workflow execution details
   * Maps to: GET /scan-workflows/{workflow_id}
   * Backend: scan_workflow_routes.py -> get_workflow_execution
   */
  async getWorkflowExecution(workflowId: string): Promise<{
    workflow: WorkflowExecution;
    steps: WorkflowStep[];
    current_status: any;
  }> {
    const response = await fetch(`${this.baseUrl}/${workflowId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get workflow execution status
   * Maps to: GET /scan-workflows/{workflow_id}/status
   * Backend: scan_workflow_routes.py -> get_workflow_status
   */
  async getWorkflowStatus(workflowId: string): Promise<{
    workflow_id: string;
    status: WorkflowStatus;
    progress_percentage: number;
    current_stage_id?: string;
    stages: Record<string, any>[];
    started_at?: string;
    estimated_completion?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/${workflowId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get workflow execution logs
   * Maps to: GET /scan-workflows/{workflow_id}/logs
   * Backend: scan_workflow_routes.py -> get_workflow_logs
   */
  async getWorkflowLogs(workflowId: string, params: {
    level?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    logs: any[];
    total: number;
    has_more: boolean;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.level) queryParams.append('level', params.level);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/${workflowId}/logs?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== WORKFLOW CONTROL ====================

  /**
   * Control workflow execution (pause, resume, cancel)
   * Maps to: POST /scan-workflows/{workflow_id}/control
   * Backend: scan_workflow_routes.py -> control_workflow
   */
  async controlWorkflow(workflowId: string, request: WorkflowControlRequest): Promise<{
    success: boolean;
    message: string;
    new_status: WorkflowStatus;
  }> {
    const response = await fetch(`${this.baseUrl}/${workflowId}/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Pause workflow execution
   * Maps to: POST /scan-workflows/{workflow_id}/pause
   * Backend: scan_workflow_routes.py -> pause_workflow
   */
  async pauseWorkflow(workflowId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return this.controlWorkflow(workflowId, { action: 'pause', reason });
  }

  /**
   * Resume workflow execution
   * Maps to: POST /scan-workflows/{workflow_id}/resume
   * Backend: scan_workflow_routes.py -> resume_workflow
   */
  async resumeWorkflow(workflowId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return this.controlWorkflow(workflowId, { action: 'resume', reason });
  }

  /**
   * Cancel workflow execution
   * Maps to: POST /scan-workflows/{workflow_id}/cancel
   * Backend: scan_workflow_routes.py -> cancel_workflow
   */
  async cancelWorkflow(workflowId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return this.controlWorkflow(workflowId, { action: 'cancel', reason });
  }

  /**
   * Retry failed workflow
   * Maps to: POST /scan-workflows/{workflow_id}/retry
   * Backend: scan_workflow_routes.py -> retry_workflow
   */
  async retryWorkflow(workflowId: string, params: {
    from_step?: string;
    reset_state?: boolean;
  } = {}): Promise<{
    success: boolean;
    message: string;
    new_workflow_id?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/${workflowId}/retry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(params)
    });

    return this.handleResponse(response);
  }

  // ==================== WORKFLOW STEPS ====================

  /**
   * Get workflow step details
   * Maps to: GET /scan-workflows/{workflow_id}/steps/{step_id}
   * Backend: scan_workflow_routes.py -> get_workflow_step
   */
  async getWorkflowStep(workflowId: string, stepId: string): Promise<{
    step: WorkflowStep;
    execution_context: ExecutionContext;
    logs: any[];
  }> {
    const response = await fetch(`${this.baseUrl}/${workflowId}/steps/${stepId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Retry workflow step
   * Maps to: POST /scan-workflows/{workflow_id}/steps/{step_id}/retry
   * Backend: scan_workflow_routes.py -> retry_workflow_step
   */
  async retryWorkflowStep(workflowId: string, stepId: string): Promise<{
    success: boolean;
    message: string;
    step_status: string;
  }> {
    const response = await fetch(`${this.baseUrl}/${workflowId}/steps/${stepId}/retry`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Skip workflow step
   * Maps to: POST /scan-workflows/{workflow_id}/steps/{step_id}/skip
   * Backend: scan_workflow_routes.py -> skip_workflow_step
   */
  async skipWorkflowStep(workflowId: string, stepId: string, reason?: string): Promise<{
    success: boolean;
    message: string;
    step_status: string;
  }> {
    const response = await fetch(`${this.baseUrl}/${workflowId}/steps/${stepId}/skip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ reason })
    });

    return this.handleResponse(response);
  }

  // ==================== WORKFLOW APPROVALS ====================

  /**
   * Get pending approvals
   * Maps to: GET /scan-workflows/approvals/pending
   * Backend: scan_workflow_routes.py -> get_pending_approvals
   */
  async getPendingApprovals(params: {
    approval_type?: string;
    priority?: WorkflowPriority[];
    assigned_to?: string;
  } = {}): Promise<{
    approvals: ApprovalWorkflow[];
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.approval_type) queryParams.append('approval_type', params.approval_type);
    if (params.priority) {
      params.priority.forEach(p => queryParams.append('priority', p));
    }
    if (params.assigned_to) queryParams.append('assigned_to', params.assigned_to);

    const response = await fetch(`${this.baseUrl}/approvals/pending?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Process workflow approval
   * Maps to: POST /scan-workflows/approvals/process
   * Backend: scan_workflow_routes.py -> process_approval
   */
  async processApproval(request: WorkflowApprovalRequest): Promise<{
    success: boolean;
    message: string;
    workflow_status: WorkflowStatus;
  }> {
    const response = await fetch(`${this.baseUrl}/approvals/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get approval history
   * Maps to: GET /scan-workflows/{workflow_id}/approvals
   * Backend: scan_workflow_routes.py -> get_approval_history
   */
  async getApprovalHistory(workflowId: string): Promise<{
    approvals: ApprovalWorkflow[];
    workflow_id: string;
  }> {
    const response = await fetch(`${this.baseUrl}/${workflowId}/approvals`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== WORKFLOW ANALYTICS ====================

  /**
   * Get workflow analytics
   * Maps to: POST /scan-workflows/analytics
   * Backend: scan_workflow_routes.py -> get_workflow_analytics
   */
  async getWorkflowAnalytics(request: WorkflowAnalyticsRequest): Promise<{
    metrics: WorkflowMetrics;
    trends: any;
    performance: any;
    recommendations: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get workflow performance metrics
   * Maps to: GET /scan-workflows/metrics/performance
   * Backend: scan_workflow_routes.py -> get_performance_metrics
   */
  async getPerformanceMetrics(params: {
    time_range?: string;
    template_ids?: string[];
    granularity?: string;
  } = {}): Promise<{
    metrics: any[];
    summary: any;
    trends: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.time_range) queryParams.append('time_range', params.time_range);
    if (params.template_ids) {
      params.template_ids.forEach(id => queryParams.append('template_ids', id));
    }
    if (params.granularity) queryParams.append('granularity', params.granularity);

    const response = await fetch(`${this.baseUrl}/metrics/performance?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== WORKFLOW SCHEDULING ====================

  /**
   * Schedule workflow execution
   * Maps to: POST /scan-workflows/schedule
   * Backend: scan_workflow_routes.py -> schedule_workflow
   */
  async scheduleWorkflow(schedule: Omit<WorkflowSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowSchedule> {
    const response = await fetch(`${this.baseUrl}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(schedule)
    });

    return this.handleResponse(response);
  }

  /**
   * Get scheduled workflows
   * Maps to: GET /scan-workflows/schedules
   * Backend: scan_workflow_routes.py -> get_scheduled_workflows
   */
  async getScheduledWorkflows(params: {
    is_active?: boolean;
    template_id?: string;
  } = {}): Promise<{
    schedules: WorkflowSchedule[];
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params.template_id) queryParams.append('template_id', params.template_id);

    const response = await fetch(`${this.baseUrl}/schedules?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== REAL-TIME UPDATES ====================

  /**
   * Subscribe to workflow status updates
   * Maps to: WebSocket /scan-workflows/ws/{workflow_id}
   * Backend: scan_workflow_routes.py -> websocket_workflow_updates
   */
  subscribeToWorkflowUpdates(
    workflowId: string,
    onUpdate: (data: any) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws/${workflowId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      if (onError) onError(error);
    };

    return ws;
  }

  /**
   * Subscribe to approval notifications
   * Maps to: WebSocket /scan-workflows/ws/approvals
   * Backend: scan_workflow_routes.py -> websocket_approval_notifications
   */
  subscribeToApprovalNotifications(
    onNotification: (notification: any) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws/approvals`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        onNotification(notification);
      } catch (error) {
        console.error('Failed to parse approval notification:', error);
      }
    };

    ws.onerror = (error) => {
      if (onError) onError(error);
    };

    return ws;
  }
}

// Export singleton instance
export const scanWorkflowAPI = new ScanWorkflowAPI();
export default scanWorkflowAPI;