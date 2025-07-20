import sys
import os

import uvicorn

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.db_session import create_db_and_tables
from app.api.routes import (
    data_source_routes,
    scan_routes,
    compliance_rule_routes,
    compliance_framework_routes,
    compliance_risk_routes,
    custom_scan_rule_routes,
    workspace_routes,
    discovery_routes
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    create_db_and_tables()
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="Data Governance API",
    description="Comprehensive API for data governance, compliance, and scanning",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers with proper prefixes
app.include_router(data_source_routes.router, prefix="/api/v1")
app.include_router(scan_routes.router, prefix="/api/v1")
app.include_router(compliance_rule_routes.router, prefix="/api/v1")
app.include_router(compliance_framework_routes.router, prefix="/api/v1")
app.include_router(compliance_risk_routes.router, prefix="/api/v1")
app.include_router(custom_scan_rule_routes.router, prefix="/api/v1")
app.include_router(workspace_routes.router, prefix="/api/v1")
app.include_router(discovery_routes.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Data Governance API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is operational"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)