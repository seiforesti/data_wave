/**
 * Racine Main Manager Hooks
 * =========================
 * 
 * Central export file for all React hooks used in the racine main manager system.
 * These hooks provide reactive state management and integrate with the API services
 * to deliver real-time, type-safe functionality across all racine components.
 */

// Core orchestration hook
export { useRacineOrchestration } from './useRacineOrchestration';

// Workspace management hooks
export { useWorkspaceManagement } from './useWorkspaceManagement';

// Job workflow hooks
export { useJobWorkflowBuilder } from './useJobWorkflowBuilder';

// Pipeline management hooks
export { usePipelineManager } from './usePipelineManager';

// AI assistant hooks
export { useAIAssistant } from './useAIAssistant';

// Activity tracking hooks
export { useActivityTracker } from './useActivityTracker';

// Re-export all hook types for external usage
export type {
  // Workspace management types
  UseWorkspaceManagementOptions,
  
  // Job workflow types
  UseJobWorkflowBuilderOptions,
  
  // Pipeline management types
  UsePipelineManagerOptions,
  
  // AI assistant types
  UseAIAssistantOptions,
  
  // Activity tracking types
  UseActivityTrackerOptions
} from './useWorkspaceManagement';

export type {
  UseJobWorkflowBuilderOptions
} from './useJobWorkflowBuilder';

export type {
  UsePipelineManagerOptions
} from './usePipelineManager';

export type {
  UseAIAssistantOptions
} from './useAIAssistant';

export type {
  UseActivityTrackerOptions
} from './useActivityTracker';