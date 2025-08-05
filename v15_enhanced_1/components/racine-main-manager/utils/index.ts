/**
 * Racine Main Manager Utils - Index
 * =================================
 *
 * Central export for all utility functions that provide cross-group
 * orchestration, workflow execution, and pipeline management capabilities.
 */

// Cross-group orchestration utilities
export * from './cross-group-orchestrator';

// Workflow engine utilities
export * from './workflow-engine';

// Pipeline engine utilities
export * from './pipeline-engine';

// Re-export main utility functions for convenience
export {
  coordinateServices,
  validateIntegration,
  optimizeExecution,
  handleErrors
} from './cross-group-orchestrator';

export {
  executeWorkflow,
  validateWorkflow,
  optimizeWorkflow,
  handleDependencies
} from './workflow-engine';

export {
  executePipeline,
  optimizePipeline,
  monitorHealth,
  handleErrors as handlePipelineErrors
} from './pipeline-engine';

// Export utility types for external usage
export type {
  OrchestrationContext,
  ServiceCoordinationResult,
  CrossGroupValidationResult,
  ExecutionOptimization,
  RetryPolicy,
  ResourceUsage
} from './cross-group-orchestrator';

export type {
  WorkflowExecutionContext,
  WorkflowValidationReport,
  StepExecutionResult,
  ExecutionLog,
  StepMetrics
} from './workflow-engine';

export type {
  PipelineExecutionContext,
  PipelineHealthReport,
  StageHealthStatus,
  DataFlowHealth,
  PerformanceHealth
} from './pipeline-engine';