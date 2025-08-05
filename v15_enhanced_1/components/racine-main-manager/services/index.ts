/**
 * Racine Main Manager Services - Index
 * ====================================
 *
 * Central export for all API service classes that provide 100% mapped
 * integration with backend Racine services.
 */

// Main orchestration service
export * from './racine-orchestration-apis';

// Re-export service instances for convenience
export { racineOrchestrationAPI } from './racine-orchestration-apis';

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