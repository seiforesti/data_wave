"""
Racine Main Manager Services Package
====================================

This package contains all the advanced services for the Racine Main Manager system,
which serves as the ultimate orchestrator for the entire data governance platform.

The Racine services provide:
- Master orchestration service coordinating all existing services across 7 groups
- Multi-workspace management with cross-group resource integration
- Databricks-style workflow management with cross-group orchestration
- Advanced pipeline management with AI-driven optimization
- Context-aware AI assistant with cross-group intelligence
- Comprehensive activity tracking and audit services
- Intelligent dashboard and analytics services
- Master collaboration services with real-time features
- Cross-group integration management services

All services are designed for seamless integration with existing backend implementations
while providing enterprise-grade scalability, performance, and security.
"""

# Import all racine services for easy access
from .racine_orchestration_service import RacineOrchestrationService
from .racine_workspace_service import RacineWorkspaceService
from .racine_workflow_service import RacineWorkflowService
from .racine_pipeline_service import RacinePipelineService
from .racine_ai_service import RacineAIService
from .racine_activity_service import RacineActivityService
from .racine_dashboard_service import RacineDashboardService
from .racine_collaboration_service import RacineCollaborationService
from .racine_integration_service import RacineIntegrationService

__all__ = [
    "RacineOrchestrationService",
    "RacineWorkspaceService", 
    "RacineWorkflowService",
    "RacinePipelineService",
    "RacineAIService",
    "RacineActivityService",
    "RacineDashboardService",
    "RacineCollaborationService",
    "RacineIntegrationService"
]