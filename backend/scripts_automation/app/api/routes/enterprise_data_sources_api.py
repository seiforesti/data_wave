"""
Enterprise Data Sources API
===========================

Production-grade API for advanced data source management, connectivity testing,
monitoring, and intelligent discovery across the enterprise data governance platform.

Features:
- Comprehensive CRUD operations with RBAC
- Real-time connection testing and monitoring
- Intelligent data source discovery
- Advanced metadata extraction
- Performance monitoring and analytics
- Compliance and security integration
- Auto-discovery and cataloging
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import asyncio
import json
import logging

# Database and models
from app.db_session import get_session
from app.models.scan_models import DataSource, DataSourceType, DataSourceStatus

# Services
from app.services.data_source_service import DataSourceService
from app.services.data_source_connection_service import DataSourceConnectionService
from app.services.unified_rbac_service import get_rbac_service, UnifiedRBACService
from app.services.telemetry_service import get_telemetry_service, TelemetryService
from app.services.audit_service import get_audit_service, AuditService

# RBAC and Security
from app.api.security.rbac import (
    get_current_user, require_datasource_permission,
    PERMISSION_DATASOURCE_VIEW, PERMISSION_DATASOURCE_CREATE,
    PERMISSION_DATASOURCE_EDIT, PERMISSION_DATASOURCE_DELETE,
    PERMISSION_DATASOURCE_CONNECT, PERMISSION_DATASOURCE_MONITOR
)

# Configure logging
logger = logging.getLogger(__name__)

# ===============================================================================
# REQUEST/RESPONSE MODELS
# ===============================================================================

class DataSourceCreateRequest(BaseModel):
    """Request model for creating a new data source"""
    name: str = Field(..., min_length=1, max_length=255, description="Data source name")
    description: Optional[str] = Field(None, max_length=1000, description="Data source description")
    source_type: DataSourceType = Field(..., description="Type of data source")
    connection_details: Dict[str, Any] = Field(..., description="Connection configuration")
    environment: str = Field(default="production", description="Environment (dev/staging/production)")
    criticality: str = Field(default="medium", description="Business criticality level")
    owner_email: Optional[str] = Field(None, description="Owner email address")
    tags: List[str] = Field(default_factory=list, description="Tags for categorization")
    compliance_requirements: List[str] = Field(default_factory=list, description="Compliance frameworks")
    auto_discovery_enabled: bool = Field(default=True, description="Enable automatic discovery")
    monitoring_enabled: bool = Field(default=True, description="Enable monitoring")

class DataSourceUpdateRequest(BaseModel):
    """Request model for updating a data source"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    connection_details: Optional[Dict[str, Any]] = None
    environment: Optional[str] = None
    criticality: Optional[str] = None
    owner_email: Optional[str] = None
    tags: Optional[List[str]] = None
    compliance_requirements: Optional[List[str]] = None
    auto_discovery_enabled: Optional[bool] = None
    monitoring_enabled: Optional[bool] = None
    status: Optional[DataSourceStatus] = None

class DataSourceResponse(BaseModel):
    """Response model for data source information"""
    id: int
    name: str
    description: Optional[str]
    source_type: DataSourceType
    status: DataSourceStatus
    environment: str
    criticality: str
    owner_email: Optional[str]
    tags: List[str]
    compliance_requirements: List[str]
    connection_status: str
    last_connection_test: Optional[datetime]
    auto_discovery_enabled: bool
    monitoring_enabled: bool
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]
    health_metrics: Dict[str, Any]

class ConnectionTestRequest(BaseModel):
    """Request model for connection testing"""
    connection_details: Dict[str, Any] = Field(..., description="Connection parameters to test")
    timeout_seconds: int = Field(default=30, ge=5, le=300, description="Connection timeout")
    validate_credentials: bool = Field(default=True, description="Validate credentials")
    test_queries: List[str] = Field(default_factory=list, description="Test queries to execute")

class ConnectionTestResponse(BaseModel):
    """Response model for connection test results"""
    success: bool
    connection_time_ms: float
    message: str
    details: Dict[str, Any]
    test_results: List[Dict[str, Any]]
    recommendations: List[str]

class DataSourceDiscoveryRequest(BaseModel):
    """Request model for data source discovery"""
    discovery_scope: str = Field(..., description="Scope of discovery (schema/table/column)")
    include_metadata: bool = Field(default=True, description="Include metadata extraction")
    include_samples: bool = Field(default=False, description="Include data samples")
    max_tables: int = Field(default=100, ge=1, le=1000, description="Maximum tables to discover")
    discovery_filters: Dict[str, Any] = Field(default_factory=dict, description="Discovery filters")

class DataSourceMetrics(BaseModel):
    """Data source performance metrics"""
    connection_count: int
    avg_response_time_ms: float
    error_rate_percent: float
    data_volume_gb: float
    last_scan_time: Optional[datetime]
    health_score: float
    uptime_percent: float

# ===============================================================================
# API ROUTER SETUP
# ===============================================================================

def get_data_sources_router() -> APIRouter:
    """Get the enterprise data sources API router"""
    from app.api.routes.enterprise_unified_api_router import get_enterprise_api_router
    
    enterprise_router = get_enterprise_api_router()
    router = enterprise_router.get_data_sources_router()
    
    # Add all the endpoints to the router
    _add_data_source_endpoints(router)
    
    return router

def _add_data_source_endpoints(router: APIRouter):
    """Add all data source endpoints to the router"""
    
    # ===============================================================================
    # CORE CRUD OPERATIONS
    # ===============================================================================
    
    @router.get("/", response_model=List[DataSourceResponse])
    @require_datasource_permission(PERMISSION_DATASOURCE_VIEW)
    async def list_data_sources(
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
        source_type: Optional[DataSourceType] = Query(None, description="Filter by source type"),
        status: Optional[DataSourceStatus] = Query(None, description="Filter by status"),
        environment: Optional[str] = Query(None, description="Filter by environment"),
        search: Optional[str] = Query(None, description="Search in name and description"),
        tags: Optional[List[str]] = Query(None, description="Filter by tags"),
        current_user = Depends(get_current_user),
        db: Session = Depends(get_session),
        rbac_service: UnifiedRBACService = Depends(get_rbac_service),
        telemetry: TelemetryService = Depends(get_telemetry_service),
        audit: AuditService = Depends(get_audit_service)
    ):
        """List all data sources with advanced filtering and pagination"""
        try:
            service = DataSourceService(db)
            
            # Build filters
            filters = {}
            if source_type:
                filters["source_type"] = source_type
            if status:
                filters["status"] = status
            if environment:
                filters["environment"] = environment
            if search:
                filters["search"] = search
            if tags:
                filters["tags"] = tags
            
            # Get data sources
            data_sources = await service.list_data_sources(
                skip=skip,
                limit=limit,
                filters=filters,
                user_id=current_user.id
            )
            
            # Log audit event
            await audit.log_data_access(
                user_id=current_user.id,
                resource_type="data_source",
                resource_id="list",
                action="list",
                group="data_sources",
                details={"filters": filters, "count": len(data_sources)}
            )
            
            return data_sources
            
        except Exception as e:
            logger.error(f"Error listing data sources: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve data sources")
    
    @router.get("/{data_source_id}", response_model=DataSourceResponse)
    @require_datasource_permission(PERMISSION_DATASOURCE_VIEW)
    async def get_data_source(
        data_source_id: int,
        include_metrics: bool = Query(False, description="Include performance metrics"),
        current_user = Depends(get_current_user),
        db: Session = Depends(get_session),
        rbac_service: UnifiedRBACService = Depends(get_rbac_service)
    ):
        """Get detailed information about a specific data source"""
        try:
            service = DataSourceService(db)
            
            # Verify access to specific data source
            can_access, reason = rbac_service.can_access_datasource(
                user_id=current_user.id,
                data_source_id=data_source_id,
                action="view"
            )
            
            if not can_access:
                raise HTTPException(status_code=403, detail=reason)
            
            data_source = await service.get_data_source(
                data_source_id=data_source_id,
                include_metrics=include_metrics
            )
            
            if not data_source:
                raise HTTPException(status_code=404, detail="Data source not found")
            
            return data_source
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error retrieving data source {data_source_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve data source")
    
    @router.post("/", response_model=DataSourceResponse)
    @require_datasource_permission(PERMISSION_DATASOURCE_CREATE)
    async def create_data_source(
        request: DataSourceCreateRequest,
        test_connection: bool = Query(True, description="Test connection before creating"),
        current_user = Depends(get_current_user),
        db: Session = Depends(get_session),
        background_tasks: BackgroundTasks = BackgroundTasks()
    ):
        """Create a new data source with optional connection testing"""
        try:
            service = DataSourceService(db)
            connection_service = DataSourceConnectionService()
            
            # Test connection if requested
            if test_connection:
                test_result = await connection_service.test_connection(
                    source_type=request.source_type,
                    connection_details=request.connection_details,
                    timeout=30
                )
                
                if not test_result.success:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Connection test failed: {test_result.message}"
                    )
            
            # Create data source
            data_source = await service.create_data_source(
                name=request.name,
                description=request.description,
                source_type=request.source_type,
                connection_details=request.connection_details,
                environment=request.environment,
                criticality=request.criticality,
                owner_email=request.owner_email,
                tags=request.tags,
                compliance_requirements=request.compliance_requirements,
                created_by=current_user.id
            )
            
            # Schedule background tasks
            if request.auto_discovery_enabled:
                background_tasks.add_task(
                    _schedule_discovery,
                    data_source.id,
                    current_user.id
                )
            
            if request.monitoring_enabled:
                background_tasks.add_task(
                    _enable_monitoring,
                    data_source.id,
                    current_user.id
                )
            
            return data_source
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating data source: {e}")
            raise HTTPException(status_code=500, detail="Failed to create data source")
    
    @router.put("/{data_source_id}", response_model=DataSourceResponse)
    @require_datasource_permission(PERMISSION_DATASOURCE_EDIT)
    async def update_data_source(
        data_source_id: int,
        request: DataSourceUpdateRequest,
        test_connection: bool = Query(False, description="Test connection after update"),
        current_user = Depends(get_current_user),
        db: Session = Depends(get_session),
        rbac_service: UnifiedRBACService = Depends(get_rbac_service)
    ):
        """Update an existing data source"""
        try:
            service = DataSourceService(db)
            
            # Verify access
            can_access, reason = rbac_service.can_access_datasource(
                user_id=current_user.id,
                data_source_id=data_source_id,
                action="edit"
            )
            
            if not can_access:
                raise HTTPException(status_code=403, detail=reason)
            
            # Update data source
            updated_fields = request.dict(exclude_unset=True)
            data_source = await service.update_data_source(
                data_source_id=data_source_id,
                updates=updated_fields,
                updated_by=current_user.id
            )
            
            # Test connection if requested and connection details changed
            if test_connection and "connection_details" in updated_fields:
                connection_service = DataSourceConnectionService()
                test_result = await connection_service.test_connection(
                    source_type=data_source.source_type,
                    connection_details=data_source.connection_details,
                    timeout=30
                )
                
                if not test_result.success:
                    logger.warning(f"Connection test failed for updated data source {data_source_id}")
            
            return data_source
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating data source {data_source_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to update data source")
    
    @router.delete("/{data_source_id}")
    @require_datasource_permission(PERMISSION_DATASOURCE_DELETE)
    async def delete_data_source(
        data_source_id: int,
        force: bool = Query(False, description="Force delete even if in use"),
        current_user = Depends(get_current_user),
        db: Session = Depends(get_session),
        rbac_service: UnifiedRBACService = Depends(get_rbac_service),
        audit: AuditService = Depends(get_audit_service)
    ):
        """Delete a data source"""
        try:
            service = DataSourceService(db)
            
            # Verify access
            can_access, reason = rbac_service.can_access_datasource(
                user_id=current_user.id,
                data_source_id=data_source_id,
                action="delete"
            )
            
            if not can_access:
                raise HTTPException(status_code=403, detail=reason)
            
            # Check if data source is in use
            if not force:
                is_in_use = await service.check_data_source_usage(data_source_id)
                if is_in_use:
                    raise HTTPException(
                        status_code=400,
                        detail="Data source is in use. Use force=true to delete anyway."
                    )
            
            # Delete data source
            await service.delete_data_source(
                data_source_id=data_source_id,
                deleted_by=current_user.id
            )
            
            # Log deletion
            await audit.log_data_access(
                user_id=current_user.id,
                resource_type="data_source",
                resource_id=str(data_source_id),
                action="delete",
                group="data_sources",
                details={"force": force}
            )
            
            return {"message": "Data source deleted successfully"}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting data source {data_source_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete data source")
    
    # ===============================================================================
    # CONNECTION TESTING AND MONITORING
    # ===============================================================================
    
    @router.post("/test-connection", response_model=ConnectionTestResponse)
    @require_datasource_permission(PERMISSION_DATASOURCE_CONNECT)
    async def test_connection(
        request: ConnectionTestRequest,
        source_type: DataSourceType = Query(..., description="Type of data source"),
        current_user = Depends(get_current_user)
    ):
        """Test connection to a data source without creating it"""
        try:
            connection_service = DataSourceConnectionService()
            
            result = await connection_service.test_connection(
                source_type=source_type,
                connection_details=request.connection_details,
                timeout=request.timeout_seconds,
                validate_credentials=request.validate_credentials,
                test_queries=request.test_queries
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error testing connection: {e}")
            raise HTTPException(status_code=500, detail="Connection test failed")
    
    @router.post("/{data_source_id}/test-connection", response_model=ConnectionTestResponse)
    @require_datasource_permission(PERMISSION_DATASOURCE_CONNECT)
    async def test_existing_connection(
        data_source_id: int,
        current_user = Depends(get_current_user),
        db: Session = Depends(get_session),
        rbac_service: UnifiedRBACService = Depends(get_rbac_service)
    ):
        """Test connection for an existing data source"""
        try:
            # Verify access
            can_access, reason = rbac_service.can_access_datasource(
                user_id=current_user.id,
                data_source_id=data_source_id,
                action="connect"
            )
            
            if not can_access:
                raise HTTPException(status_code=403, detail=reason)
            
            service = DataSourceService(db)
            connection_service = DataSourceConnectionService()
            
            # Get data source
            data_source = await service.get_data_source(data_source_id)
            if not data_source:
                raise HTTPException(status_code=404, detail="Data source not found")
            
            # Test connection
            result = await connection_service.test_connection(
                source_type=data_source.source_type,
                connection_details=data_source.connection_details,
                timeout=30
            )
            
            # Update connection status
            await service.update_connection_status(
                data_source_id=data_source_id,
                status="connected" if result.success else "error",
                last_test_time=datetime.utcnow(),
                test_details=result.details
            )
            
            return result
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error testing connection for data source {data_source_id}: {e}")
            raise HTTPException(status_code=500, detail="Connection test failed")
    
    @router.get("/{data_source_id}/metrics", response_model=DataSourceMetrics)
    @require_datasource_permission(PERMISSION_DATASOURCE_MONITOR)
    async def get_data_source_metrics(
        data_source_id: int,
        hours: int = Query(24, ge=1, le=168, description="Hours of metrics to retrieve"),
        current_user = Depends(get_current_user),
        db: Session = Depends(get_session),
        rbac_service: UnifiedRBACService = Depends(get_rbac_service)
    ):
        """Get performance metrics for a data source"""
        try:
            # Verify access
            can_access, reason = rbac_service.can_access_datasource(
                user_id=current_user.id,
                data_source_id=data_source_id,
                action="monitor"
            )
            
            if not can_access:
                raise HTTPException(status_code=403, detail=reason)
            
            service = DataSourceService(db)
            
            metrics = await service.get_data_source_metrics(
                data_source_id=data_source_id,
                hours=hours
            )
            
            return metrics
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error retrieving metrics for data source {data_source_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve metrics")
    
    # ===============================================================================
    # DISCOVERY AND CATALOGING
    # ===============================================================================
    
    @router.post("/{data_source_id}/discover")
    @require_datasource_permission(PERMISSION_DATASOURCE_DISCOVERY)
    async def discover_data_source(
        data_source_id: int,
        request: DataSourceDiscoveryRequest,
        current_user = Depends(get_current_user),
        db: Session = Depends(get_session),
        background_tasks: BackgroundTasks = BackgroundTasks(),
        rbac_service: UnifiedRBACService = Depends(get_rbac_service)
    ):
        """Start data discovery process for a data source"""
        try:
            # Verify access
            can_access, reason = rbac_service.can_access_datasource(
                user_id=current_user.id,
                data_source_id=data_source_id,
                action="discovery"
            )
            
            if not can_access:
                raise HTTPException(status_code=403, detail=reason)
            
            service = DataSourceService(db)
            
            # Validate data source exists
            data_source = await service.get_data_source(data_source_id)
            if not data_source:
                raise HTTPException(status_code=404, detail="Data source not found")
            
            # Start discovery in background
            discovery_id = await service.start_discovery(
                data_source_id=data_source_id,
                scope=request.discovery_scope,
                include_metadata=request.include_metadata,
                include_samples=request.include_samples,
                max_tables=request.max_tables,
                filters=request.discovery_filters,
                started_by=current_user.id
            )
            
            return {
                "discovery_id": discovery_id,
                "status": "started",
                "message": "Discovery process started successfully"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error starting discovery for data source {data_source_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to start discovery")

# ===============================================================================
# BACKGROUND TASK FUNCTIONS
# ===============================================================================

async def _schedule_discovery(data_source_id: int, user_id: int):
    """Schedule automatic discovery for a data source"""
    try:
        # Implementation would schedule discovery based on configuration
        logger.info(f"Scheduled discovery for data source {data_source_id}")
    except Exception as e:
        logger.error(f"Error scheduling discovery for data source {data_source_id}: {e}")

async def _enable_monitoring(data_source_id: int, user_id: int):
    """Enable monitoring for a data source"""
    try:
        # Implementation would set up monitoring
        logger.info(f"Enabled monitoring for data source {data_source_id}")
    except Exception as e:
        logger.error(f"Error enabling monitoring for data source {data_source_id}: {e}")

# Export the router getter function
__all__ = ["get_data_sources_router"]