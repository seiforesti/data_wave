import { complianceEventBus } from './event-bus';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'TASK' | 'APPROVAL' | 'NOTIFICATION' | 'INTEGRATION' | 'DECISION';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  assignee?: string;
  dueDate?: Date;
  completedAt?: Date;
  parameters: Record<string, any>;
  nextSteps: string[];
  previousSteps: string[];
  conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
  value: any;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  type: 'COMPLIANCE_CHECK' | 'VIOLATION_REMEDIATION' | 'AUDIT_PROCESS' | 'RULE_APPROVAL';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  steps: WorkflowStep[];
  currentStep: string;
  startedAt: Date;
  completedAt?: Date;
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;
    tags: string[];
  };
  context: Record<string, any>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  steps: Omit<WorkflowStep, 'id' | 'status' | 'completedAt'>[];
  parameters: Record<string, any>;
  version: string;
}

class ComplianceWorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private templates: Map<string, WorkflowTemplate> = new Map();
  private subscribers: Map<string, (workflow: Workflow) => void> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
    this.subscribeToEvents();
  }

  // Initialize default workflow templates
  private initializeDefaultTemplates(): void {
    // Compliance Check Workflow
    const complianceCheckTemplate: WorkflowTemplate = {
      id: 'compliance-check-template',
      name: 'Standard Compliance Check',
      description: 'Automated compliance checking workflow',
      type: 'COMPLIANCE_CHECK',
      steps: [
        {
          name: 'Data Source Scan',
          type: 'TASK',
          parameters: { scanType: 'compliance', depth: 'full' },
          nextSteps: ['rule-validation'],
          previousSteps: [],
          conditions: []
        },
        {
          name: 'Rule Validation',
          type: 'TASK',
          parameters: { validationMode: 'strict' },
          nextSteps: ['violation-assessment'],
          previousSteps: ['data-source-scan'],
          conditions: []
        },
        {
          name: 'Violation Assessment',
          type: 'DECISION',
          parameters: { assessmentCriteria: 'severity-based' },
          nextSteps: ['remediation-planning', 'approval-required'],
          previousSteps: ['rule-validation'],
          conditions: [
            { field: 'violationCount', operator: 'GREATER_THAN', value: 0 }
          ]
        },
        {
          name: 'Remediation Planning',
          type: 'TASK',
          parameters: { planningMode: 'automated' },
          nextSteps: ['remediation-execution'],
          previousSteps: ['violation-assessment'],
          conditions: []
        },
        {
          name: 'Remediation Execution',
          type: 'TASK',
          parameters: { executionMode: 'automated' },
          nextSteps: ['verification'],
          previousSteps: ['remediation-planning'],
          conditions: []
        },
        {
          name: 'Verification',
          type: 'TASK',
          parameters: { verificationType: 're-scan' },
          nextSteps: ['completion'],
          previousSteps: ['remediation-execution'],
          conditions: []
        },
        {
          name: 'Approval Required',
          type: 'APPROVAL',
          parameters: { approvers: ['compliance-manager'], timeout: 24 },
          nextSteps: ['remediation-planning'],
          previousSteps: ['violation-assessment'],
          conditions: []
        },
        {
          name: 'Completion',
          type: 'NOTIFICATION',
          parameters: { recipients: ['stakeholders'], template: 'completion-report' },
          nextSteps: [],
          previousSteps: ['verification'],
          conditions: []
        }
      ],
      parameters: {
        timeout: 72,
        retryAttempts: 3,
        escalationEnabled: true
      },
      version: '1.0.0'
    };

    // Violation Remediation Workflow
    const violationRemediationTemplate: WorkflowTemplate = {
      id: 'violation-remediation-template',
      name: 'Violation Remediation Process',
      description: 'Automated violation remediation workflow',
      type: 'VIOLATION_REMEDIATION',
      steps: [
        {
          name: 'Violation Analysis',
          type: 'TASK',
          parameters: { analysisDepth: 'detailed' },
          nextSteps: ['severity-assessment'],
          previousSteps: [],
          conditions: []
        },
        {
          name: 'Severity Assessment',
          type: 'DECISION',
          parameters: { assessmentModel: 'risk-based' },
          nextSteps: ['immediate-action', 'planned-remediation'],
          previousSteps: ['violation-analysis'],
          conditions: []
        },
        {
          name: 'Immediate Action',
          type: 'TASK',
          parameters: { actionType: 'blocking' },
          nextSteps: ['stakeholder-notification'],
          previousSteps: ['severity-assessment'],
          conditions: [
            { field: 'severity', operator: 'EQUALS', value: 'CRITICAL' }
          ]
        },
        {
          name: 'Planned Remediation',
          type: 'TASK',
          parameters: { planningHorizon: '7-days' },
          nextSteps: ['remediation-execution'],
          previousSteps: ['severity-assessment'],
          conditions: []
        },
        {
          name: 'Remediation Execution',
          type: 'TASK',
          parameters: { executionMode: 'supervised' },
          nextSteps: ['verification'],
          previousSteps: ['planned-remediation'],
          conditions: []
        },
        {
          name: 'Verification',
          type: 'TASK',
          parameters: { verificationMethod: 'automated-testing' },
          nextSteps: ['documentation'],
          previousSteps: ['remediation-execution'],
          conditions: []
        },
        {
          name: 'Stakeholder Notification',
          type: 'NOTIFICATION',
          parameters: { urgency: 'high', channels: ['email', 'slack'] },
          nextSteps: ['remediation-execution'],
          previousSteps: ['immediate-action'],
          conditions: []
        },
        {
          name: 'Documentation',
          type: 'TASK',
          parameters: { documentationType: 'remediation-report' },
          nextSteps: ['completion'],
          previousSteps: ['verification'],
          conditions: []
        },
        {
          name: 'Completion',
          type: 'NOTIFICATION',
          parameters: { recipients: ['compliance-team'], template: 'remediation-complete' },
          nextSteps: [],
          previousSteps: ['documentation'],
          conditions: []
        }
      ],
      parameters: {
        timeout: 168,
        retryAttempts: 5,
        escalationEnabled: true
      },
      version: '1.0.0'
    };

    this.templates.set(complianceCheckTemplate.id, complianceCheckTemplate);
    this.templates.set(violationRemediationTemplate.id, violationRemediationTemplate);
  }

  // Create a new workflow from template
  createWorkflow(templateId: string, context: Record<string, any>): Workflow {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const workflow: Workflow = {
      id: workflowId,
      name: template.name,
      description: template.description,
      type: template.type as any,
      status: 'DRAFT',
      priority: 'MEDIUM',
      steps: template.steps.map((step, index) => ({
        ...step,
        id: `${workflowId}-step-${index}`,
        status: index === 0 ? 'PENDING' : 'PENDING',
        completedAt: undefined
      })),
      currentStep: template.steps[0]?.name || '',
      startedAt: new Date(),
      metadata: {
        createdBy: context.createdBy || 'system',
        createdAt: new Date(),
        updatedBy: context.createdBy || 'system',
        updatedAt: new Date(),
        tags: template.parameters.tags || []
      },
      context
    };

    this.workflows.set(workflowId, workflow);
    this.notifySubscribers(workflow);
    
    return workflow;
  }

  // Start a workflow
  startWorkflow(workflowId: string): Workflow {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = 'ACTIVE';
    workflow.metadata.updatedAt = new Date();
    
    // Start the first step
    const firstStep = workflow.steps.find(step => step.status === 'PENDING');
    if (firstStep) {
      this.executeStep(workflowId, firstStep.id);
    }

    this.workflows.set(workflowId, workflow);
    this.notifySubscribers(workflow);
    
    return workflow;
  }

  // Execute a workflow step
  async executeStep(workflowId: string, stepId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found`);
    }

    step.status = 'IN_PROGRESS';
    workflow.currentStep = step.name;

    try {
      // Execute step based on type
      switch (step.type) {
        case 'TASK':
          await this.executeTask(workflow, step);
          break;
        case 'APPROVAL':
          await this.executeApproval(workflow, step);
          break;
        case 'NOTIFICATION':
          await this.executeNotification(workflow, step);
          break;
        case 'INTEGRATION':
          await this.executeIntegration(workflow, step);
          break;
        case 'DECISION':
          await this.executeDecision(workflow, step);
          break;
      }

      step.status = 'COMPLETED';
      step.completedAt = new Date();
      
      // Move to next step
      await this.moveToNextStep(workflow, step);

    } catch (error) {
      step.status = 'FAILED';
      console.error(`Error executing step ${stepId}:`, error);
      
      // Handle step failure
      await this.handleStepFailure(workflow, step, error);
    }

    workflow.metadata.updatedAt = new Date();
    this.workflows.set(workflowId, workflow);
    this.notifySubscribers(workflow);
  }

  // Execute task step
  private async executeTask(workflow: Workflow, step: WorkflowStep): Promise<void> {
    // Simulate task execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update workflow context with task results
    workflow.context[`${step.name.toLowerCase().replace(/\s+/g, '_')}_result`] = {
      status: 'completed',
      timestamp: new Date(),
      data: step.parameters
    };
  }

  // Execute approval step
  private async executeApproval(workflow: Workflow, step: WorkflowStep): Promise<void> {
    // Create approval request
    const approvalRequest = {
      id: `${workflow.id}-approval-${step.id}`,
      workflowId: workflow.id,
      stepId: step.id,
      assignee: step.assignee,
      dueDate: step.dueDate,
      status: 'PENDING',
      createdAt: new Date()
    };

    // Store approval request (in real implementation, this would be in a database)
    workflow.context.approvalRequests = workflow.context.approvalRequests || [];
    workflow.context.approvalRequests.push(approvalRequest);

    // Publish approval event
    await complianceEventBus.publish({
      type: 'workflow:approval:requested',
      payload: approvalRequest,
      timestamp: new Date(),
      source: 'compliance-workflow'
    });
  }

  // Execute notification step
  private async executeNotification(workflow: Workflow, step: WorkflowStep): Promise<void> {
    // Send notification
    const notification = {
      id: `${workflow.id}-notification-${step.id}`,
      workflowId: workflow.id,
      stepId: step.id,
      recipients: step.parameters.recipients || [],
      template: step.parameters.template || 'default',
      status: 'SENT',
      sentAt: new Date()
    };

    // Publish notification event
    await complianceEventBus.publish({
      type: 'workflow:notification:sent',
      payload: notification,
      timestamp: new Date(),
      source: 'compliance-workflow'
    });
  }

  // Execute integration step
  private async executeIntegration(workflow: Workflow, step: WorkflowStep): Promise<void> {
    // Execute external integration
    const integrationResult = {
      id: `${workflow.id}-integration-${step.id}`,
      workflowId: workflow.id,
      stepId: step.id,
      status: 'COMPLETED',
      completedAt: new Date(),
      data: step.parameters
    };

    workflow.context.integrationResults = workflow.context.integrationResults || [];
    workflow.context.integrationResults.push(integrationResult);
  }

  // Execute decision step
  private async executeDecision(workflow: Workflow, step: WorkflowStep): Promise<void> {
    // Evaluate conditions and determine next steps
    const decisionResult = this.evaluateConditions(workflow, step.conditions || []);
    
    workflow.context[`${step.name.toLowerCase().replace(/\s+/g, '_')}_decision`] = {
      result: decisionResult,
      timestamp: new Date(),
      conditions: step.conditions
    };
  }

  // Evaluate workflow conditions
  private evaluateConditions(workflow: Workflow, conditions: WorkflowCondition[]): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition => {
      const value = workflow.context[condition.field];
      
      switch (condition.operator) {
        case 'EQUALS':
          return value === condition.value;
        case 'NOT_EQUALS':
          return value !== condition.value;
        case 'GREATER_THAN':
          return value > condition.value;
        case 'LESS_THAN':
          return value < condition.value;
        case 'CONTAINS':
          return String(value).includes(String(condition.value));
        default:
          return false;
      }
    });
  }

  // Move to next step
  private async moveToNextStep(workflow: Workflow, currentStep: WorkflowStep): Promise<void> {
    const nextStepNames = currentStep.nextSteps;
    const nextSteps = workflow.steps.filter(step => nextStepNames.includes(step.name));

    if (nextSteps.length === 0) {
      // Workflow completed
      workflow.status = 'COMPLETED';
      workflow.completedAt = new Date();
      
      await complianceEventBus.publish({
        type: 'workflow:completed',
        payload: workflow,
        timestamp: new Date(),
        source: 'compliance-workflow'
      });
      
      return;
    }

    // Activate next steps
    for (const nextStep of nextSteps) {
      nextStep.status = 'PENDING';
      
      // Auto-execute if no human intervention needed
      if (nextStep.type === 'TASK' || nextStep.type === 'INTEGRATION') {
        await this.executeStep(workflow.id, nextStep.id);
      }
    }
  }

  // Handle step failure
  private async handleStepFailure(workflow: Workflow, step: WorkflowStep, error: any): Promise<void> {
    // Log failure
    workflow.context.failures = workflow.context.failures || [];
    workflow.context.failures.push({
      stepId: step.id,
      stepName: step.name,
      error: error.message,
      timestamp: new Date()
    });

    // Publish failure event
    await complianceEventBus.publish({
      type: 'workflow:step:failed',
      payload: {
        workflowId: workflow.id,
        stepId: step.id,
        error: error.message
      },
      timestamp: new Date(),
      source: 'compliance-workflow'
    });

    // Check if workflow should be paused or cancelled
    if (workflow.context.failures.length >= 3) {
      workflow.status = 'PAUSED';
      
      await complianceEventBus.publish({
        type: 'workflow:paused',
        payload: workflow,
        timestamp: new Date(),
        source: 'compliance-workflow'
      });
    }
  }

  // Subscribe to workflow events
  subscribe(callback: (workflow: Workflow) => void): string {
    const id = `subscriber-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.subscribers.set(id, callback);
    return id;
  }

  // Unsubscribe from workflow events
  unsubscribe(subscriberId: string): boolean {
    return this.subscribers.delete(subscriberId);
  }

  // Notify subscribers
  private notifySubscribers(workflow: Workflow): void {
    this.subscribers.forEach(callback => {
      try {
        callback(workflow);
      } catch (error) {
        console.error('Error in workflow subscriber:', error);
      }
    });
  }

  // Subscribe to compliance events
  private subscribeToEvents(): void {
    complianceEventBus.on('compliance:violation:detected', async (event) => {
      // Create violation remediation workflow
      const workflow = this.createWorkflow('violation-remediation-template', {
        violation: event.payload,
        createdBy: 'system',
        priority: event.payload.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
      });
      
      this.startWorkflow(workflow.id);
    });

    complianceEventBus.on('compliance:rule:created', async (event) => {
      // Create compliance check workflow for new rules
      const workflow = this.createWorkflow('compliance-check-template', {
        rule: event.payload,
        createdBy: event.payload.metadata?.createdBy || 'system',
        priority: 'MEDIUM'
      });
      
      this.startWorkflow(workflow.id);
    });
  }

  // Get workflow by ID
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  // Get all workflows
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  // Get workflows by status
  getWorkflowsByStatus(status: string): Workflow[] {
    return this.getAllWorkflows().filter(workflow => workflow.status === status);
  }

  // Get workflow templates
  getTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get workflow statistics
  getWorkflowStats(): {
    total: number;
    active: number;
    completed: number;
    failed: number;
    averageDuration: number;
  } {
    const workflows = this.getAllWorkflows();
    const completed = workflows.filter(w => w.status === 'COMPLETED');
    
    const averageDuration = completed.length > 0
      ? completed.reduce((sum, w) => {
          const duration = w.completedAt!.getTime() - w.startedAt.getTime();
          return sum + duration;
        }, 0) / completed.length
      : 0;

    return {
      total: workflows.length,
      active: workflows.filter(w => w.status === 'ACTIVE').length,
      completed: completed.length,
      failed: workflows.filter(w => w.status === 'PAUSED').length,
      averageDuration
    };
  }
}

// Export singleton instance
export const complianceWorkflowEngine = new ComplianceWorkflowEngine();

export default complianceWorkflowEngine;