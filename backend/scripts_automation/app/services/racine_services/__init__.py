"""
Racine Services Package
======================

This package contains all Racine Main Manager services that provide enterprise-grade
functionality for the next-generation data governance platform.

Services:
- Orchestration Service: Master coordination and system health management
- Workspace Service: Multi-workspace management and collaboration
- Workflow Service: Databricks-style job workflow management 
- Pipeline Service: AI-driven pipeline management and optimization
- AI Assistant Service: Context-aware intelligent assistance
"""

from .racine_orchestration_service import RacineOrchestrationService
from .racine_workspace_service import RacineWorkspaceService
from .racine_workflow_service import RacineWorkflowService
from .racine_pipeline_service import RacinePipelineService
from .racine_ai_service import RacineAIAssistantService

__all__ = [
    "RacineOrchestrationService",
    "RacineWorkspaceService", 
    "RacineWorkflowService",
    "RacinePipelineService",
    "RacineAIAssistantService"
]