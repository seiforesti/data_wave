/**
 * Racine Main Manager Services - Index
 * ====================================
 *
 * Central export for all API service classes that provide 100% mapped
 * integration with backend Racine services.
 */

// Main orchestration service
export * from './racine-orchestration-apis';

// Workspace management service
export * from './workspace-management-apis';

// Job workflow service
export * from './job-workflow-apis';

// Pipeline management service
export * from './pipeline-management-apis';

// AI assistant service
export * from './ai-assistant-apis';

// Re-export service instances for convenience
export { racineOrchestrationAPI } from './racine-orchestration-apis';
export { workspaceManagementAPI } from './workspace-management-apis';
export { jobWorkflowAPI } from './job-workflow-apis';
export { pipelineManagementAPI } from './pipeline-management-apis';
export { aiAssistantAPI } from './ai-assistant-apis';

// Export service types for external usage
export type {
  OrchestrationAPIConfig,
  OrchestrationEventType,
  OrchestrationEvent,
  OrchestrationEventHandler,
  EventSubscription,
  WebSocketMessage,
  WebSocketConfig
} from './racine-orchestration-apis';

export type {
  WorkspaceAPIConfig,
  WorkspaceEventType,
  WorkspaceEvent,
  WorkspaceEventHandler,
  WorkspaceEventSubscription,
  WorkspaceWebSocketMessage
} from './workspace-management-apis';

export type {
  WorkflowAPIConfig,
  WorkflowEventType,
  WorkflowEvent,
  WorkflowEventHandler,
  WorkflowEventSubscription,
  WorkflowWebSocketMessage,
  ExecutionControlRequest
} from './job-workflow-apis';

export type {
  PipelineAPIConfig,
  PipelineEventType,
  PipelineEvent,
  PipelineEventHandler,
  PipelineEventSubscription,
  PipelineControlRequest
} from './pipeline-management-apis';

export type {
  AIAssistantAPIConfig,
  AIEventType,
  AIEvent,
  AIEventHandler,
  AIEventSubscription,
  ConversationContext
} from './ai-assistant-apis';