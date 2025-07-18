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
    title="PurSight - Data Platform",
    version="1.0.0",
    description="A native alternative to Databricks powered by FastAPI and SQLModel"
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
# Do NOT include rbac_router directly; it's already included under /sensitivity-labels via sensitivity_labeling_router
app.include_router(analytics_router)
app.include_router(notifications_router)
app.include_router(ml_feedback_router)
include_catalog_tree(app)
# Include routers
app.include_router(scan_routes.router)
app.include_router(dashboard.router)
app.include_router(custom_scan_rules.router)
app.include_router(data_profiling.router)
app.include_router(incremental_scan.router)
app.include_router(scan_rule_set_validation_router)
app.include_router(data_discovery_routes.router)  # Add the new data discovery routes
app.include_router(enterprise_analytics_router)  # Add enterprise analytics routes

app.mount("/popuphandler", StaticFiles(directory="app/popuphandler"), name="static")

@app.get("/")
def read_root():
    print("✅ Root endpoint called")  # log terminal
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
    """Startup event handler."""
    # Create database tables
    init_db()
    logger.info("Database tables created")
    # Start scan scheduler
    asyncio.create_task(ScanSchedulerService.start_scheduler())
    logger.info("Scan scheduler started")
def print_routes():
    print("\nRegistered routes:")
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
    logger.info("Scan scheduler stopped")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)