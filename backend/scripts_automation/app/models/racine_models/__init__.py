"""
Racine Main Manager Models Package
==================================

This package contains all the advanced models for the Racine Main Manager system,
which serves as the ultimate orchestrator for the entire data governance platform.

The Racine models provide:
- Master orchestration across all 7 groups (Data Sources, Scan Rule Sets, Classifications, 
  Compliance Rules, Advanced Catalog, Scan Logic, RBAC System)
- Multi-workspace management with cross-group resource linking
- Databricks-style workflow management with cross-group orchestration
- Advanced pipeline management with AI-driven optimization
- Context-aware AI assistant with cross-group intelligence
- Comprehensive activity tracking and audit trails
- Intelligent dashboard and analytics system
- Master collaboration system with real-time features
- Cross-group integration management

All models are designed for seamless integration with existing backend implementations
while providing enterprise-grade scalability, performance, and security.
"""

# Import all racine models for easy access
from .racine_orchestration_models import (
    RacineOrchestrationMaster,
    RacineWorkflowExecution,
    RacineSystemHealth,
    RacineCrossGroupIntegration,
    RacinePerformanceMetrics,
    RacineResourceAllocation,
    RacineErrorLog,
    RacineIntegrationStatus
)

from .racine_workspace_models import (
    RacineWorkspace,
    RacineWorkspaceMember,
    RacineWorkspaceResource,
    RacineWorkspaceTemplate,
    RacineWorkspaceAnalytics,
    RacineWorkspaceSettings,
    RacineWorkspaceAudit,
    RacineWorkspaceNotification
)

from .racine_workflow_models import (
    RacineJobWorkflow,
    RacineJobExecution,
    RacineWorkflowTemplate,
    RacineWorkflowSchedule,
    RacineWorkflowStep,
    RacineWorkflowDependency,
    RacineWorkflowVersion,
    RacineWorkflowAudit
)

from .racine_pipeline_models import (
    RacinePipeline,
    RacinePipelineExecution,
    RacinePipelineStage,
    RacinePipelineTemplate,
    RacinePipelineVersion,
    RacinePipelineMetrics,
    RacinePipelineAlert,
    RacinePipelineOptimization
)

from .racine_ai_models import (
    RacineAIConversation,
    RacineAIMessage,
    RacineAIRecommendation,
    RacineAIInsight,
    RacineAILearning,
    RacineAIContext,
    RacineAIModel,
    RacineAIAnalytics
)

from .racine_activity_models import (
    RacineActivity,
    RacineAuditTrail,
    RacineActivityPattern,
    RacineActivityAlert,
    RacineActivityReport,
    RacineActivityMetrics,
    RacineComplianceActivity,
    RacineActivitySearch
)

from .racine_dashboard_models import (
    RacineDashboard,
    RacineWidget,
    RacineDashboardTemplate,
    RacineDashboardShare,
    RacineDashboardAlert,
    RacineDashboardMetrics,
    RacineDashboardFilter,
    RacineDashboardExport
)

from .racine_collaboration_models import (
    RacineCollaboration,
    RacineCollaborationSession,
    RacineCollaborationMessage,
    RacineCollaborationDocument,
    RacineCollaborationWorkspace,
    RacineCollaborationPermission,
    RacineCollaborationAudit,
    RacineCollaborationNotification
)

from .racine_integration_models import (
    RacineIntegrationEndpoint,
    RacineIntegrationMapping,
    RacineIntegrationSync,
    RacineIntegrationLog,
    RacineIntegrationMetrics,
    RacineIntegrationAlert,
    RacineIntegrationHealth,
    RacineIntegrationConfig
)

__all__ = [
    # Orchestration Models
    "RacineOrchestrationMaster",
    "RacineWorkflowExecution", 
    "RacineSystemHealth",
    "RacineCrossGroupIntegration",
    "RacinePerformanceMetrics",
    "RacineResourceAllocation",
    "RacineErrorLog",
    "RacineIntegrationStatus",
    
    # Workspace Models
    "RacineWorkspace",
    "RacineWorkspaceMember",
    "RacineWorkspaceResource",
    "RacineWorkspaceTemplate",
    "RacineWorkspaceAnalytics",
    "RacineWorkspaceSettings",
    "RacineWorkspaceAudit",
    "RacineWorkspaceNotification",
    
    # Workflow Models
    "RacineJobWorkflow",
    "RacineJobExecution",
    "RacineWorkflowTemplate",
    "RacineWorkflowSchedule",
    "RacineWorkflowStep",
    "RacineWorkflowDependency",
    "RacineWorkflowVersion",
    "RacineWorkflowAudit",
    
    # Pipeline Models
    "RacinePipeline",
    "RacinePipelineExecution",
    "RacinePipelineStage",
    "RacinePipelineTemplate",
    "RacinePipelineVersion",
    "RacinePipelineMetrics",
    "RacinePipelineAlert",
    "RacinePipelineOptimization",
    
    # AI Models
    "RacineAIConversation",
    "RacineAIMessage",
    "RacineAIRecommendation",
    "RacineAIInsight",
    "RacineAILearning",
    "RacineAIContext",
    "RacineAIModel",
    "RacineAIAnalytics",
    
    # Activity Models
    "RacineActivity",
    "RacineAuditTrail",
    "RacineActivityPattern",
    "RacineActivityAlert",
    "RacineActivityReport",
    "RacineActivityMetrics",
    "RacineComplianceActivity",
    "RacineActivitySearch",
    
    # Dashboard Models
    "RacineDashboard",
    "RacineWidget",
    "RacineDashboardTemplate",
    "RacineDashboardShare",
    "RacineDashboardAlert",
    "RacineDashboardMetrics",
    "RacineDashboardFilter",
    "RacineDashboardExport",
    
    # Collaboration Models
    "RacineCollaboration",
    "RacineCollaborationSession",
    "RacineCollaborationMessage",
    "RacineCollaborationDocument",
    "RacineCollaborationWorkspace",
    "RacineCollaborationPermission",
    "RacineCollaborationAudit",
    "RacineCollaborationNotification",
    
    # Integration Models
    "RacineIntegrationEndpoint",
    "RacineIntegrationMapping",
    "RacineIntegrationSync",
    "RacineIntegrationLog",
    "RacineIntegrationMetrics",
    "RacineIntegrationAlert",
    "RacineIntegrationHealth",
    "RacineIntegrationConfig"
]