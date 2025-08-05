"""
Racine Main Manager API Routes Package
======================================

This package contains all the API routes for the Racine Main Manager system,
which serves as the ultimate orchestrator for the entire data governance platform.

The Racine routes provide:
- Master orchestration API endpoints coordinating all existing APIs across 7 groups
- Multi-workspace management with cross-group resource integration
- Databricks-style workflow management with cross-group orchestration
- Advanced pipeline management with AI-driven optimization
- Context-aware AI assistant with cross-group intelligence
- Comprehensive activity tracking and audit endpoints
- Intelligent dashboard and analytics endpoints
- Master collaboration endpoints with real-time features
- Cross-group integration management endpoints

All routes are designed for seamless integration with existing backend implementations
while providing enterprise-grade scalability, performance, and security.
"""

# Import all racine route modules for easy access
from .racine_orchestration_routes import router as orchestration_router
from .racine_workspace_routes import router as workspace_router
from .racine_workflow_routes import router as workflow_router
from .racine_pipeline_routes import router as pipeline_router
from .racine_ai_routes import router as ai_router
from .racine_activity_routes import router as activity_router
from .racine_dashboard_routes import router as dashboard_router
from .racine_collaboration_routes import router as collaboration_router
from .racine_integration_routes import router as integration_router

__all__ = [
    "orchestration_router",
    "workspace_router", 
    "workflow_router",
    "pipeline_router",
    "ai_router",
    "activity_router",
    "dashboard_router",
    "collaboration_router",
    "integration_router"
]