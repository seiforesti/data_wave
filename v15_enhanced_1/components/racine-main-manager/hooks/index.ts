/**
 * Racine Main Manager Hooks - Index
 * =================================
 *
 * Central export for all React hooks that provide state management
 * and API integration for Racine Main Manager components.
 */

// Main orchestration hook
export * from './useRacineOrchestration';

// Re-export hook for convenience
export { useRacineOrchestration } from './useRacineOrchestration';

// Export hook types for external usage
export type {
  UseOrchestrationOptions,
  UseOrchestrationReturn,
  OrchestrationState,
  OrchestrationLoading,
  OrchestrationErrors
} from './useRacineOrchestration';