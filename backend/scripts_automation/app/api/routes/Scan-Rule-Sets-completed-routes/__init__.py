"""
Scan-Rule-Sets Completed Routes Package

This package contains all the advanced API routes for the scan-rule-sets group,
including enterprise scan rules, templates, version control, collaboration, analytics,
AI pattern detection, enterprise orchestration, and rule validation.
"""

# Import all routers for easy access
from .enterprise_scan_rules_routes import router as enterprise_scan_rules_router
from .rule_template_routes import router as rule_template_router
from .rule_version_control_routes import router as rule_version_control_router
from .enhanced_collaboration_routes import router as enhanced_collaboration_router
from .analytics_reporting_routes import router as analytics_reporting_router
from .ai_pattern_detection_routes import router as ai_pattern_detection_router
from .enterprise_orchestration_routes import router as enterprise_orchestration_router
from .rule_validation_routes import router as rule_validation_router
from .scan_workflows_routes import router as scan_workflows_router
from .scan_optimization_routes import router as scan_optimization_router
from .intelligent_scanning_routes import router as intelligent_scanning_router
from .comprehensive_scan_analytics_routes import router as comprehensive_scan_analytics_router

__all__ = [
    "enterprise_scan_rules_router",
    "rule_template_router",
    "rule_version_control_router", 
    "enhanced_collaboration_router",
    "analytics_reporting_router",
    "ai_pattern_detection_router",
    "enterprise_orchestration_router",
    "rule_validation_router",
    "scan_workflows_router",
    "scan_optimization_router",
    "intelligent_scanning_router",
    "comprehensive_scan_analytics_router"
]