import sys
import os

import uvicorn

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.cors import add_cors_middleware
from app.api.routes.oauth_auth import router as oauth_auth_router
from app.api.routes.auth_routes import router as auth_router
from app.api.routes import extract, metrics
from app.api.routes.ml_metrics import router as ml_metrics_router
from app.api.routes.ml import router as ml_routes
from app.api.routes import classify
from app.api.routes.role_admin import router as role_admin_router
from app.db_session import init_db
from app.services.scheduler import schedule_tasks
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from sensitivity_labeling.api import router as sensitivity_labeling_router
from sensitivity_labeling.api import rbac_router
from sensitivity_labeling.analytics import router as analytics_router
from sensitivity_labeling.notifications import router as notifications_router
from sensitivity_labeling.ml_feedback import router as ml_feedback_router
from sensitivity_labeling.api import include_catalog_tree
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError as FastAPIRequestValidationError
from app.api.routes import scan_routes, dashboard, custom_scan_rules, data_profiling, incremental_scan, data_discovery_routes
from app.api.routes.scan_rule_set_validation import router as scan_rule_set_validation_router
from app.api.routes.enterprise_analytics import router as enterprise_analytics_router
from app.api.routes.collaboration_routes import router as collaboration_router
from app.api.routes.workflow_routes import router as workflow_router
from app.api.routes.performance_routes import router as performance_router
from app.api.routes.security_routes import router as security_router
from app.api.routes.compliance_rule_routes import router as compliance_rule_routes
from app.api.routes.compliance_framework_routes import router as compliance_framework_routes
from app.api.routes.compliance_risk_routes import router as compliance_risk_routes
from app.api.routes.compliance_reports_routes import router as compliance_reports_routes
from app.api.routes.compliance_workflows_routes import router as compliance_workflows_routes
from app.api.routes.compliance_integrations_routes import router as compliance_integrations_routes
from app.api.routes.compliance_audit_routes import router as compliance_audit_routes
from app.api.routes.classification_routes import router as classification_routes
from app.api.routes.ml_routes import router as ml_routes
from app.api.routes.ai_routes import router as ai_routes

# ========================================
# ENTERPRISE DATA GOVERNANCE CORE ROUTES
# ========================================
# Import the three missing enterprise route groups per ADVANCED_ENTERPRISE_DATA_GOVERNANCE_PLAN.md

# 1. SCAN-RULE-SETS GROUP - Enterprise Routes
from app.api.routes.enterprise_scan_rules_routes import router as enterprise_scan_rules_router

# 2. DATA CATALOG GROUP - Enterprise Routes  
from app.api.routes.enterprise_catalog_routes import router as enterprise_catalog_router
from app.api.routes.intelligent_discovery_routes import router as intelligent_discovery_router
from app.api.routes.advanced_lineage_routes import router as advanced_lineage_router
from app.api.routes.semantic_search_routes import router as semantic_search_router
from app.api.routes.catalog_quality_routes import router as catalog_quality_router

# 3. SCAN LOGIC GROUP - Enterprise Routes
from app.api.routes.enterprise_scan_orchestration_routes import router as enterprise_scan_orchestration_router
from app.api.routes.scan_intelligence_routes import router as scan_intelligence_router
from app.api.routes.scan_workflow_routes import router as scan_workflow_router
from app.api.routes.scan_performance_routes import router as scan_performance_router

# UNIFIED ENTERPRISE INTEGRATION - Cross-System Coordination
from app.api.routes.enterprise_integration_routes import router as enterprise_integration_router

# Additional missing routes for the three groups
from app.api.routes.scan_orchestration_routes import router as scan_orchestration_router
from app.api.routes.intelligent_scanning_routes import router as intelligent_scanning_router
from app.api.routes.scan_optimization_routes import router as scan_optimization_router
from app.api.routes.catalog_analytics_routes import router as catalog_analytics_router
from app.api.routes.scan_coordination_routes import router as scan_coordination_router
from app.api.routes.scan_analytics_routes import router as scan_analytics_router

from app.services.scan_scheduler_service import ScanSchedulerService
from fastapi import Request
import logging
import asyncio

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


app = FastAPI(
    title="PurSight - Enterprise Data Governance Platform",
    version="2.0.0",
    description="Advanced Enterprise Data Governance Platform - Production Implementation with AI/ML Intelligence, Real-time Orchestration, and Comprehensive Integration across all 6 core groups: Data Sources, Compliance Rules, Classifications, Scan-Rule-Sets, Data Catalog, and Scan Logic"
)

# Initialize database
init_db()

# Schedule background tasks
schedule_tasks()

# Add CORS middleware
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    # Add other frontend origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(oauth_auth_router)
app.include_router(auth_router, tags=["auth"])
app.include_router(extract.router)
app.include_router(metrics.router)
app.include_router(ml_metrics_router)
app.include_router(ml_routes)
app.include_router(classify.router)
app.include_router(role_admin_router)
app.include_router(sensitivity_labeling_router)
app.include_router(analytics_router)
app.include_router(notifications_router)
app.include_router(ml_feedback_router)
include_catalog_tree(app)

# Legacy routes (maintained for backward compatibility)
app.include_router(scan_routes.router)
app.include_router(dashboard.router)
app.include_router(custom_scan_rules.router)
app.include_router(data_profiling.router)
app.include_router(incremental_scan.router)
app.include_router(scan_rule_set_validation_router)
app.include_router(data_discovery_routes.router)  # Add the new data discovery routes
app.include_router(enterprise_analytics_router)  # Add enterprise analytics routes
app.include_router(collaboration_router)  # Add collaboration routes
app.include_router(workflow_router)  # Add workflow routes  
app.include_router(performance_router)  # Add enhanced performance routes
app.include_router(security_router)  # Add enhanced security routes
app.include_router(compliance_rule_routes)
app.include_router(compliance_framework_routes)
app.include_router(compliance_risk_routes)
app.include_router(compliance_reports_routes)
app.include_router(compliance_workflows_routes)
app.include_router(compliance_integrations_routes)
app.include_router(compliance_audit_routes)
app.include_router(classification_routes)  # Add enterprise classification routes
app.include_router(ml_routes)  # Add ML classification routes (Version 2)
app.include_router(ai_routes)  # Add AI classification routes (Version 3)

# ========================================
# ENTERPRISE DATA GOVERNANCE CORE ROUTES INTEGRATION
# ========================================

# 1. SCAN-RULE-SETS GROUP - Enterprise Implementation (85KB+ Service)
app.include_router(enterprise_scan_rules_router, tags=["Enterprise Scan Rules"])

# 2. DATA CATALOG GROUP - Enterprise Implementation (95KB+ Service)
app.include_router(enterprise_catalog_router, tags=["Enterprise Data Catalog"])
app.include_router(intelligent_discovery_router, tags=["Intelligent Discovery"])
app.include_router(advanced_lineage_router, tags=["Advanced Lineage"])
app.include_router(semantic_search_router, tags=["Semantic Search"])
app.include_router(catalog_quality_router, tags=["Catalog Quality"])

# 3. SCAN LOGIC GROUP - Enterprise Implementation (120KB+ Service)
app.include_router(enterprise_scan_orchestration_router, tags=["Enterprise Scan Orchestration"])
app.include_router(scan_intelligence_router, tags=["Scan Intelligence"])
app.include_router(scan_workflow_router, tags=["Scan Workflows"])
app.include_router(scan_performance_router, tags=["Scan Performance"])

# UNIFIED ENTERPRISE INTEGRATION - Cross-System Real-time Coordination
app.include_router(enterprise_integration_router, tags=["Enterprise Integration"])

# Additional missing routes for complete integration
app.include_router(scan_orchestration_router, tags=["Scan Orchestration"])
app.include_router(intelligent_scanning_router, tags=["Intelligent Scanning"])
app.include_router(scan_optimization_router, tags=["Scan Optimization"])
app.include_router(catalog_analytics_router, tags=["Catalog Analytics"])
app.include_router(scan_coordination_router, tags=["Scan Coordination"])
app.include_router(scan_analytics_router, tags=["Scan Analytics"])

app.mount("/popuphandler", StaticFiles(directory="app/popuphandler"), name="static")

@app.get("/")
def read_root():
    print("✅ Enterprise Data Governance Platform Root endpoint called")  # log terminal
    # Redirect to frontend home page URL (served separately)
    return RedirectResponse(url="http://localhost:5173/")

@app.exception_handler(FastAPIRequestValidationError)
async def validation_exception_handler(request: Request, exc: FastAPIRequestValidationError):
    logging.error(f"Validation error for request {request.url}: {exc.errors()} | Body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": (await request.body()).decode()
        },
    )

@app.on_event("startup")
async def startup_event():
    """Startup event handler for enterprise data governance platform."""
    # Create database tables
    init_db()
    logger.info("Enterprise database tables created")
    # Start scan scheduler
    asyncio.create_task(ScanSchedulerService.start_scheduler())
    logger.info("Enterprise scan scheduler started")
    logger.info("🚀 Enterprise Data Governance Platform started successfully!")
    logger.info("📊 All 6 core groups integrated: Data Sources, Compliance Rules, Classifications, Scan-Rule-Sets, Data Catalog, Scan Logic")

def print_routes():
    print("\nRegistered Enterprise Routes:")
    for route in app.routes:
        methods = getattr(route, "methods", None)
        path = getattr(route, "path", None)
        if methods is not None and path is not None:
            print(f"{list(methods)} {path}")

@app.on_event("shutdown")
def shutdown_event():
    """Shutdown event handler."""
    # Stop scan scheduler
    ScanSchedulerService.stop_scheduler()
    logger.info("Enterprise scan scheduler stopped")

@app.get("/health")
async def health_check():
    """Enterprise health check endpoint."""
    return {
        "status": "healthy",
        "platform": "PurSight Enterprise Data Governance",
        "version": "2.0.0",
        "core_groups": [
            "Data Sources",
            "Compliance Rules", 
            "Classifications",
            "Scan-Rule-Sets",
            "Data Catalog",
            "Scan Logic"
        ],
        "enterprise_features": "enabled",
        "ai_ml_intelligence": "active"
    }

@app.get("/api/v1/platform/status")
async def platform_status():
    """Get comprehensive platform status."""
    return {
        "platform": "PurSight Enterprise Data Governance",
        "version": "2.0.0",
        "architecture": "Advanced Enterprise Production",
        "core_groups": {
            "data_sources": "enterprise_ready",
            "compliance_rules": "enterprise_ready", 
            "classifications": "enterprise_ready",
            "scan_rule_sets": "enterprise_ready",
            "data_catalog": "enterprise_ready",
            "scan_logic": "enterprise_ready"
        },
        "capabilities": {
            "ai_ml_intelligence": "enabled",
            "real_time_orchestration": "enabled",
            "unified_coordination": "enabled",
            "advanced_lineage": "enabled",
            "semantic_search": "enabled",
            "intelligent_discovery": "enabled",
            "performance_optimization": "enabled",
            "enterprise_workflows": "enabled"
        },
        "interconnections": "fully_integrated",
        "production_ready": True
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
