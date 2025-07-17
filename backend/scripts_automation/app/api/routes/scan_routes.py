from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlmodel import Session
from typing import List, Optional, Dict, Any, cast
from app.db_session import get_session
from app.models.scan_models import (
    DataSource, DataSourceHealthResponse, DataSourceStatsResponse,
    DataSourceType, DataSourceLocation, DataSourceStatus,
    Environment, Criticality, DataClassification, ScanFrequency,
    CloudProvider,
    ScanRuleSet, Scan, ScanStatus, ScanResult, ScanSchedule
)
from app.services.data_source_service import DataSourceService
from app.services.scan_rule_set_service import ScanRuleSetService
from app.services.scan_service import ScanService
from app.services.scan_scheduler_service import ScanSchedulerService
from app.services.data_source_connection_service import DataSourceConnectionService
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_SCAN_VIEW, PERMISSION_SCAN_CREATE, 
    PERMISSION_SCAN_EDIT, PERMISSION_SCAN_DELETE
)
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/scan", tags=["scan"])

# Initialize services
connection_service = DataSourceConnectionService()


# Pydantic models for request/response
class DataSourceCreate(BaseModel):
    name: str
    source_type: str
    location: str
    host: str
    port: int
    username: str
    password: str
    database_name: Optional[str] = None
    description: Optional[str] = None
    connection_properties: Optional[Dict[str, Any]] = None
    environment: Optional[Environment] = None
    criticality: Optional[Criticality] = None
    data_classification: Optional[DataClassification] = None
    owner: Optional[str] = None
    team: Optional[str] = None
    tags: Optional[List[str]] = None
    scan_frequency: Optional[ScanFrequency] = None
    monitoring_enabled: Optional[bool] = Field(default=True, description="Enable runtime monitoring for this data source")
    backup_enabled: Optional[bool] = Field(default=False, description="Enable automated backups for this data source")
    encryption_enabled: Optional[bool] = Field(default=False, description="Store credentials encrypted at rest")

class DataSourceBulkUpdateRequest(BaseModel):
    data_source_ids: List[int]
    updates: Dict[str, Any]


class DataSourceResponse(BaseModel):
    id: int
    name: str
    source_type: str
    location: str
    host: str
    port: int
    username: str
    database_name: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    status: str
    environment: Optional[Environment] = None
    criticality: Optional[Criticality] = None
    data_classification: Optional[DataClassification] = None
    owner: Optional[str] = None
    team: Optional[str] = None
    tags: Optional[List[str]] = None
    health_score: Optional[int] = None
    compliance_score: Optional[int] = None
    entity_count: Optional[int] = None
    size_gb: Optional[float] = None
    last_scan: Optional[datetime] = None
    next_scan: Optional[datetime] = None
    monitoring_enabled: bool
    backup_enabled: bool
    encryption_enabled: bool


class DataSourceUpdate(BaseModel):
    name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    database_name: Optional[str] = None
    description: Optional[str] = None
    connection_properties: Optional[Dict[str, Any]] = None
    environment: Optional[Environment] = None
    criticality: Optional[Criticality] = None
    data_classification: Optional[DataClassification] = None
    owner: Optional[str] = None
    team: Optional[str] = None
    tags: Optional[List[str]] = None
    scan_frequency: Optional[ScanFrequency] = None
    monitoring_enabled: Optional[bool] = None
    backup_enabled: Optional[bool] = None
    encryption_enabled: Optional[bool] = None


class DataSourceMetricsUpdateRequest(BaseModel):
    health_score: Optional[int] = None
    compliance_score: Optional[int] = None
    entity_count: Optional[int] = None
    size_gb: Optional[float] = None
    avg_response_time: Optional[int] = None
    error_rate: Optional[float] = None
    uptime_percentage: Optional[float] = None


class ScanRuleSetCreate(BaseModel):
    name: str
    data_source_id: Optional[int] = None
    description: Optional[str] = None
    include_schemas: Optional[List[str]] = None
    exclude_schemas: Optional[List[str]] = None
    include_tables: Optional[List[str]] = None
    exclude_tables: Optional[List[str]] = None
    include_columns: Optional[List[str]] = None
    exclude_columns: Optional[List[str]] = None
    sample_data: bool = False
    sample_size: Optional[int] = 100


class ScanRuleSetResponse(BaseModel):
    id: int
    name: str
    data_source_id: Optional[int] = None
    description: Optional[str] = None
    include_schemas: Optional[List[str]] = None
    exclude_schemas: Optional[List[str]] = None
    include_tables: Optional[List[str]] = None
    exclude_tables: Optional[List[str]] = None
    include_columns: Optional[List[str]] = None
    exclude_columns: Optional[List[str]] = None
    sample_data: bool
    sample_size: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class ScanRuleSetUpdate(BaseModel):
    name: Optional[str] = None
    data_source_id: Optional[int] = None
    description: Optional[str] = None
    include_schemas: Optional[List[str]] = None
    exclude_schemas: Optional[List[str]] = None
    include_tables: Optional[List[str]] = None
    exclude_tables: Optional[List[str]] = None
    include_columns: Optional[List[str]] = None
    exclude_columns: Optional[List[str]] = None
    sample_data: Optional[bool] = None
    sample_size: Optional[int] = None


class ScanCreate(BaseModel):
    name: str
    data_source_id: int
    scan_rule_set_id: Optional[int] = None
    description: Optional[str] = None


class ScanResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    data_source_id: int
    scan_rule_set_id: Optional[int] = None
    status: str
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    scan_id: str


class ScanResultResponse(BaseModel):
    id: int
    scan_id: int
    schema_name: Optional[str] = None
    table_name: str
    column_name: Optional[str] = None
    data_type: Optional[str] = None
    nullable: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime


class ScanScheduleCreate(BaseModel):
    name: str
    data_source_id: int
    scan_rule_set_id: int
    cron_expression: str
    description: Optional[str] = None
    enabled: bool = True


class ScanScheduleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    data_source_id: int
    scan_rule_set_id: int
    cron_expression: str
    enabled: bool
    created_at: datetime
    updated_at: datetime
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None


class ScanScheduleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    data_source_id: Optional[int] = None
    scan_rule_set_id: Optional[int] = None
    cron_expression: Optional[str] = None
    enabled: Optional[bool] = None

#==============================================
# Data Source routes
#==============================================




# Data Source routes
@router.post("/data-sources", response_model=DataSourceResponse, status_code=status.HTTP_201_CREATED)
async def create_data_source(
    data_source: DataSourceCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_CREATE))
):
    """Create a new data source."""
    try:
        # Create data source
        db_data_source = DataSourceService.create_data_source(
            session=session,
            name=data_source.name,
            source_type=data_source.source_type,
            location=data_source.location,
            host=data_source.host,
            port=data_source.port,
            username=data_source.username,
            password=data_source.password,
            database_name=data_source.database_name,
            description=data_source.description,
            connection_properties=data_source.connection_properties,
            environment=data_source.environment,
            criticality=data_source.criticality,
            data_classification=data_source.data_classification,
            owner=data_source.owner,
            team=data_source.team,
            tags=data_source.tags,
            scan_frequency=data_source.scan_frequency
        )
        
        return db_data_source
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating data source: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/data-sources", response_model=List[DataSourceResponse])
async def get_data_sources(
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    environment: Optional[str] = Query(None),
    criticality: Optional[str] = Query(None),
    owner: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get all data sources with filtering and pagination."""
    try:
        # Apply filters in the service layer
        data_sources = DataSourceService.get_all_data_sources(session)
        
        # Filter results
        filtered_sources = []
        for ds in data_sources:
            if type and ds.source_type != type:
                continue
            if status and ds.status != status:
                continue
            if environment and ds.environment != environment:
                continue
            if criticality and ds.criticality != criticality:
                continue
            if owner and ds.owner != owner:
                continue
            if team and ds.team != team:
                continue
            if search:
                search_lower = search.lower()
                if not (search_lower in ds.name.lower() or 
                       search_lower in (ds.description or "").lower() or
                       search_lower in ds.host.lower()):
                    continue
            filtered_sources.append(ds)
        
        # Apply pagination                              
        start = (page - 1) * limit
        end = start + limit
        paginated_sources = filtered_sources[start:end]
        
        return paginated_sources
    except Exception as e:
        logger.error(f"Error getting data sources: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/data-sources/{data_source_id}", response_model=DataSourceResponse)
async def get_data_source(
    data_source_id: int, 
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get a data source by ID."""
    data_source = DataSourceService.get_data_source(session, data_source_id)
    if not data_source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data source not found")
    return data_source


@router.put("/data-sources/{data_source_id}", response_model=DataSourceResponse)
async def update_data_source(
    data_source_id: int,
    data_source: DataSourceUpdate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Update a data source."""
    try:
        # Convert to dict and remove None values
        update_data = data_source.dict(exclude_unset=True)
        
        # Handle password update separately
        if "password" in update_data:
            update_data["password_secret"] = update_data.pop("password")
        
        updated_data_source = DataSourceService.update_data_source(
            session=session,
            data_source_id=data_source_id,
            **update_data
        )
        
        if not updated_data_source:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data source not found")
        
        return updated_data_source
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating data source: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.delete("/data-sources/{data_source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_data_source(
    data_source_id: int, 
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_DELETE))
):
    """Delete a data source."""
    success = DataSourceService.delete_data_source(session, data_source_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data source not found")
    return None

@router.post("/data-sources/{data_source_id}/validate", status_code=status.HTTP_200_OK)
async def validate_data_source_connection(
    data_source_id: int, 
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Validate connection to a data source."""
    data_source = DataSourceService.get_data_source(session, data_source_id)
    if not data_source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data source not found")
    
    try:
        result = DataSourceService.validate_connection(data_source)
        return result
    except Exception as e:
        logger.error(f"Error validating connection: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating connection: {str(e)}"
        )

@router.get("/data-sources/{data_source_id}/health", response_model=DataSourceHealthResponse)
async def get_data_source_health(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get health status for a data source."""
    try:
        health = DataSourceService.get_data_source_health(session, data_source_id)
        return health
    except Exception as e:
        logger.error(f"Error getting data source health: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting data source health: {str(e)}"
        )


@router.get("/data-sources/{data_source_id}/stats", response_model=DataSourceStatsResponse)
async def get_data_source_stats(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get statistics for a data source."""
    try:
        stats = DataSourceService.get_data_source_stats(session, data_source_id)
        return stats
    except Exception as e:
        logger.error(f"Error getting data source stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting data source stats: {str(e)}"
        )


@router.put("/data-sources/{data_source_id}/metrics")
async def update_data_source_metrics(
    data_source_id: int,
    metrics: DataSourceMetricsUpdateRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Update performance and health metrics for a data source."""
    try:
        updated = DataSourceService.update_data_source_metrics(
            session=session,
            data_source_id=data_source_id,
            metrics=metrics.dict(exclude_unset=True)
        )
        
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data source not found")
        
        return {"message": "Metrics updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating metrics: {str(e)}"
        )


@router.post("/data-sources/{data_source_id}/toggle-favorite")
async def toggle_favorite_data_source(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Toggle favorite status for a data source."""
    try:
        user_id = current_user.get("user_id", "anonymous")
        success = DataSourceService.toggle_favorite(session, data_source_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Data source not found")
        return {"message": "Favorite status updated"}
    except Exception as e:
        logger.error(f"Error toggling favorite: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating favorite: {str(e)}")

# Enhanced scan trigger
@router.post("/data-sources/{data_source_id}/scan")
async def start_data_source_scan(
    data_source_id: int,
    scan_name: Optional[str] = Body(None),
    description: Optional[str] = Body(None),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_CREATE))
):
    """Start a new scan for a data source."""
    try:
        # Create and execute scan
        scan_name = scan_name or f"Auto Scan - {datetime.now().isoformat()}"
        scan = ScanService.create_scan(
            session=session,
            name=scan_name,
            data_source_id=data_source_id,
            description=description
        )

        # Execute the scan
        if scan.id is None:
            raise HTTPException(status_code=500, detail="Scan ID is None after creation")
        result = ScanService.execute_scan(session, scan.id)
        return result
    except Exception as e:
        logger.error(f"Error starting scan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting scan: {str(e)}")


@router.post("/data-sources/bulk-update")
async def bulk_update_data_sources(
    data_source_ids: List[int],
    updates: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Bulk update multiple data sources."""
    try:
        updated_sources = DataSourceService.bulk_update_data_sources(
            session=session,
            data_source_ids=data_source_ids,
            updates=updates
        )
        
        return {
            "message": f"Updated {len(updated_sources)} data sources",
            "updated_ids": [ds.id for ds in updated_sources]
        }
    except Exception as e:
        logger.error(f"Error in bulk update: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in bulk update: {str(e)}"
        )

@router.delete("/data-sources/bulk-delete")
async def bulk_delete_data_sources(
    data_source_ids: List[int] = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_DELETE))
):
    """Bulk delete multiple data sources."""
    try:
        for data_source_id in data_source_ids:
            success = DataSourceService.delete_data_source(session, data_source_id)
            if not success:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Data source {data_source_id} not found"
                )
        return {"message": f"Successfully deleted {len(data_source_ids)} data sources"}
    except Exception as e:
        logger.error(f"Error in bulk delete: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting data sources: {str(e)}")


# ---------------------------------------------------------------------------
# Helper endpoints for UI metadata
# ---------------------------------------------------------------------------


@router.get("/data-sources/enums")
async def get_data_source_enums(current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))):
    """Return lists of enum values required by the front-end for drop-downs."""
    return {
        "source_types": [e.value for e in DataSourceType],
        "locations": [e.value for e in DataSourceLocation],
        "statuses": [e.value for e in DataSourceStatus],
        "cloud_providers": [e.value for e in CloudProvider],
        "environments": [e.value for e in Environment],
        "criticalities": [e.value for e in Criticality],
        "data_classifications": [e.value for e in DataClassification],
        "scan_frequencies": [e.value for e in ScanFrequency]
    }


# ---------------------------------------------------------------------------
# Favorites management
# ---------------------------------------------------------------------------


@router.get("/data-sources/favorites", response_model=List[DataSourceResponse])
async def get_user_favorite_data_sources(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Return the authenticated user's favorite data sources."""
    user_id = current_user.get("user_id", "anonymous")
    return DataSourceService.get_user_favorites(session, user_id)


# ---------------------------------------------------------------------------
# Monitoring / Backup toggles
# ---------------------------------------------------------------------------


@router.post("/data-sources/{data_source_id}/toggle-monitoring")
async def toggle_monitoring(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Enable/disable monitoring for a specific data source."""
    ds = DataSourceService.get_data_source(session, data_source_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Data source not found")

    updated = DataSourceService.update_data_source(
        session,
        data_source_id,
        monitoring_enabled=not bool(ds and getattr(ds, "monitoring_enabled", False))
    )
    return {"message": f"Monitoring set to {updated.monitoring_enabled}", "monitoring_enabled": updated.monitoring_enabled}


@router.post("/data-sources/{data_source_id}/toggle-backup")
async def toggle_backup(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Enable/disable automated backups for a specific data source."""
    ds = DataSourceService.get_data_source(session, data_source_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Data source not found")

    updated = DataSourceService.update_data_source(
        session,
        data_source_id,
        backup_enabled=not bool(ds and getattr(ds, "backup_enabled", False))
    )
    return {"message": f"Backup set to {updated.backup_enabled}", "backup_enabled": updated.backup_enabled}


# Scan Rule Set routes
@router.post("/rule-sets", response_model=ScanRuleSetResponse, status_code=status.HTTP_201_CREATED)
async def create_scan_rule_set(
    rule_set: ScanRuleSetCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_CREATE))
):
    """Create a new scan rule set."""
    try:
        db_rule_set = ScanRuleSetService.create_scan_rule_set(
            session=session,
            name=rule_set.name,
            data_source_id=rule_set.data_source_id,
            description=rule_set.description,
            include_schemas=rule_set.include_schemas,
            exclude_schemas=rule_set.exclude_schemas,
            include_tables=rule_set.include_tables,
            exclude_tables=rule_set.exclude_tables,
            include_columns=rule_set.include_columns,
            exclude_columns=rule_set.exclude_columns,
            sample_data=rule_set.sample_data,
            sample_size=rule_set.sample_size
        )
        
        return db_rule_set
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating scan rule set: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/rule-sets", response_model=List[ScanRuleSetResponse])
async def get_scan_rule_sets(
    data_source_id: Optional[int] = Query(None),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get all scan rule sets, optionally filtered by data source ID."""
    if data_source_id is not None:
        return ScanRuleSetService.get_scan_rule_sets_by_data_source(session, data_source_id)
    return ScanRuleSetService.get_all_scan_rule_sets(session)


@router.get("/rule-sets/{rule_set_id}", response_model=ScanRuleSetResponse)
async def get_scan_rule_set(
    rule_set_id: int, 
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get a scan rule set by ID."""
    rule_set = ScanRuleSetService.get_scan_rule_set(session, rule_set_id)
    if not rule_set:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan rule set not found")
    return rule_set


@router.put("/rule-sets/{rule_set_id}", response_model=ScanRuleSetResponse)
async def update_scan_rule_set(
    rule_set_id: int,
    rule_set: ScanRuleSetUpdate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Update a scan rule set."""
    try:
        # Convert to dict and remove None values
        update_data = rule_set.dict(exclude_unset=True)
        
        updated_rule_set = ScanRuleSetService.update_scan_rule_set(
            session=session,
            scan_rule_set_id=rule_set_id,
            **update_data
        )
        
        if not updated_rule_set:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan rule set not found")
        
        return updated_rule_set
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating scan rule set: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.delete("/rule-sets/{rule_set_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan_rule_set(
    rule_set_id: int, 
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_DELETE))
):
    """Delete a scan rule set."""
    success = ScanRuleSetService.delete_scan_rule_set(session, rule_set_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan rule set not found")
    return None


#==============================================
# Scan routes
#==============================================


# Scan routes
@router.post("/scans", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def create_scan(
    scan: ScanCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_CREATE))
):
    """Create a new scan."""
    try:
        db_scan = ScanService.create_scan(
            session=session,
            name=scan.name,
            data_source_id=scan.data_source_id,
            scan_rule_set_id=scan.scan_rule_set_id,
            description=scan.description
        )
        
        return db_scan
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating scan: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/scans", response_model=List[ScanResponse])
async def get_scans(
    data_source_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Get all scans, optionally filtered by data source ID or status."""
    if data_source_id is not None:
        return ScanService.get_scans_by_data_source(session, data_source_id)
    if status is not None:
        return ScanService.get_scans_by_status(session, status)
    return ScanService.get_all_scans(session)


@router.get("/scans/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: int, session: Session = Depends(get_session)):
    """Get a scan by ID."""
    scan = ScanService.get_scan(session, scan_id)
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    return scan


@router.post("/scans/{scan_id}/execute", status_code=status.HTTP_200_OK)
async def execute_scan(scan_id: int, session: Session = Depends(get_session)):
    """Execute a scan."""
    try:
        result = ScanService.execute_scan(session, scan_id)
        if not result["success"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing scan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing scan: {str(e)}"
        )


@router.get("/scans/{scan_id}/results", response_model=List[ScanResultResponse])
async def get_scan_results(
    scan_id: int,
    schema_name: Optional[str] = Query(None),
    table_name: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Get scan results, optionally filtered by schema and table name."""
    # Check if scan exists
    scan = ScanService.get_scan(session, scan_id)
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    
    # Get results based on filters
    if schema_name and table_name:
        return ScanService.get_scan_results_by_table(session, scan_id, schema_name, table_name)
    elif schema_name:
        return ScanService.get_scan_results_by_schema(session, scan_id, schema_name)
    else:
        return ScanService.get_scan_results(session, scan_id)


@router.get("/scans/{scan_id}/summary")
async def get_scan_summary(scan_id: int, session: Session = Depends(get_session)):
    """Get a summary of scan results."""
    summary = ScanService.get_scan_summary(session, scan_id)
    if "success" in summary and not summary["success"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=summary["message"])
    return summary


@router.delete("/scans/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan(scan_id: int, session: Session = Depends(get_session)):
    """Delete a scan."""
    success = ScanService.delete_scan(session, scan_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    return None


#==============================================
# Scan Schedule routes
#==============================================


# Scan Schedule routes
@router.post("/schedules", response_model=ScanScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_scan_schedule(
    schedule: ScanScheduleCreate,
    session: Session = Depends(get_session)
):
    """Create a new scan schedule."""
    try:
        db_schedule = ScanSchedulerService.create_scan_schedule(
            session=session,
            name=schedule.name,
            data_source_id=schedule.data_source_id,
            scan_rule_set_id=schedule.scan_rule_set_id,
            cron_expression=schedule.cron_expression,
            description=schedule.description,
            enabled=schedule.enabled
        )
        
        return db_schedule
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating scan schedule: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/schedules", response_model=List[ScanScheduleResponse])
async def get_scan_schedules(
    enabled: Optional[bool] = Query(None),
    session: Session = Depends(get_session)
):
    """Get all scan schedules, optionally filtered by enabled status."""
    if enabled is not None and enabled:
        return ScanSchedulerService.get_enabled_scan_schedules(session)
    return ScanSchedulerService.get_all_scan_schedules(session)


@router.get("/schedules/{schedule_id}", response_model=ScanScheduleResponse)
async def get_scan_schedule(schedule_id: int, session: Session = Depends(get_session)):
    """Get a scan schedule by ID."""
    schedule = ScanSchedulerService.get_scan_schedule(session, schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan schedule not found")
    return schedule


@router.put("/schedules/{schedule_id}", response_model=ScanScheduleResponse)
async def update_scan_schedule(
    schedule_id: int,
    schedule: ScanScheduleUpdate,
    session: Session = Depends(get_session)
):
    """Update a scan schedule."""
    try:
        # Convert to dict and remove None values
        update_data = schedule.dict(exclude_unset=True)
        
        updated_schedule = ScanSchedulerService.update_scan_schedule(
            session=session,
            schedule_id=schedule_id,
            **update_data
        )
        
        if not updated_schedule:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan schedule not found")
        
        return updated_schedule
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating scan schedule: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post("/schedules/{schedule_id}/enable", response_model=ScanScheduleResponse)
async def enable_scan_schedule(schedule_id: int, session: Session = Depends(get_session)):
    """Enable a scan schedule."""
    schedule = ScanSchedulerService.enable_scan_schedule(session, schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan schedule not found")
    return schedule


@router.post("/schedules/{schedule_id}/disable", response_model=ScanScheduleResponse)
async def disable_scan_schedule(schedule_id: int, session: Session = Depends(get_session)):
    """Disable a scan schedule."""
    schedule = ScanSchedulerService.disable_scan_schedule(session, schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan schedule not found")
    return schedule


@router.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan_schedule(schedule_id: int, session: Session = Depends(get_session)):
    """Delete a scan schedule."""
    success = ScanSchedulerService.delete_scan_schedule(session, schedule_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan schedule not found")
    return None


# ============================================================================
# NEW: Additional API endpoints for enhanced functionality
# ============================================================================

# Performance Metrics Endpoints
@router.get("/data-sources/{data_source_id}/performance-metrics")
async def get_performance_metrics(
    data_source_id: int,
    time_range: str = Query("24h", description="Time range for metrics"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get performance metrics for a data source"""
    try:
        # Mock performance data - replace with actual implementation
        metrics = {
            "overall_score": 92,
            "response_time": {
                "value": 45,
                "unit": "ms",
                "trend": "improving",
                "threshold": 100,
                "status": "good"
            },
            "throughput": {
                "value": 1250,
                "unit": "req/min",
                "trend": "stable",
                "threshold": 1000,
                "status": "good"
            },
            "error_rate": {
                "value": 0.2,
                "unit": "%",
                "trend": "stable",
                "threshold": 1.0,
                "status": "good"
            },
            "uptime": {
                "value": 99.8,
                "unit": "%",
                "trend": "stable",
                "threshold": 99.5,
                "status": "good"
            },
            "cpu_usage": {
                "value": 75,
                "unit": "%",
                "trend": "increasing",
                "threshold": 80,
                "status": "warning"
            },
            "memory_usage": {
                "value": 68,
                "unit": "%",
                "trend": "stable",
                "threshold": 85,
                "status": "warning"
            },
            "disk_usage": {
                "value": 45,
                "unit": "%",
                "trend": "stable",
                "threshold": 90,
                "status": "good"
            },
            "network_latency": {
                "value": 12,
                "unit": "ms",
                "trend": "stable",
                "threshold": 50,
                "status": "good"
            },
            "active_connections": {
                "value": 156,
                "unit": "connections",
                "trend": "stable",
                "threshold": 500,
                "status": "good"
            },
            "historical_data": []
        }
        
        return {
            "success": True,
            "data": metrics,
            "data_source_id": data_source_id,
            "time_range": time_range
        }
    except Exception as e:
        logger.error(f"Error getting performance metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get performance metrics")


# Security Audit Endpoints
@router.get("/data-sources/{data_source_id}/security-audit")
async def get_security_audit(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get security audit data for a data source"""
    try:
        # Mock security data - replace with actual implementation
        security_data = {
            "security_score": 78,
            "last_scan": datetime.now().isoformat(),
            "vulnerabilities": [
                {
                    "id": "vuln-001",
                    "name": "SQL Injection Vulnerability",
                    "description": "Potential SQL injection in user input validation",
                    "category": "Application Security",
                    "severity": "high",
                    "status": "open",
                    "cve_id": "CVE-2024-1234",
                    "cvss_score": 8.5,
                    "discovered_at": (datetime.now() - timedelta(days=1)).isoformat(),
                    "last_updated": datetime.now().isoformat(),
                    "remediation": "Implement parameterized queries and input validation",
                    "affected_components": ["user_management", "authentication"]
                }
            ],
            "controls": [
                {
                    "id": "control-01",
                    "name": "Multi-Factor Authentication",
                    "description": "Require MFA for all user accounts",
                    "category": "Access Control",
                    "status": "enabled",
                    "effectiveness": 95,
                    "last_tested": (datetime.now() - timedelta(days=7)).isoformat(),
                    "next_test": (datetime.now() + timedelta(days=30)).isoformat()
                }
            ],
            "incidents": [
                {
                    "id": "incident-001",
                    "title": "Unauthorized Access Attempt",
                    "description": "Multiple failed login attempts detected",
                    "severity": "medium",
                    "status": "resolved",
                    "discovered_at": (datetime.now() - timedelta(hours=1)).isoformat(),
                    "resolved_at": (datetime.now() - timedelta(minutes=30)).isoformat(),
                    "affected_data": ["user_profiles", "access_logs"],
                    "remediation": "Account locked and IP blocked"
                }
            ],
            "threat_intelligence": {
                "recent_threats": 12,
                "blocked_attacks": 156,
                "suspicious_activities": 8,
                "last_updated": datetime.now().isoformat()
            }
        }
        
        return {
            "success": True,
            "data": security_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting security audit: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get security audit")


# Compliance Status Endpoints
@router.get("/data-sources/{data_source_id}/compliance-status")
async def get_compliance_status(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get compliance status for a data source"""
    try:
        # Mock compliance data - replace with actual implementation
        compliance_data = {
            "overall_score": 85,
            "last_assessment": datetime.now().isoformat(),
            "frameworks": {
                "gdpr": {
                    "score": 92,
                    "status": "compliant",
                    "last_checked": datetime.now().isoformat(),
                    "next_check": (datetime.now() + timedelta(days=30)).isoformat(),
                    "issues": []
                },
                "sox": {
                    "score": 78,
                    "status": "partial",
                    "last_checked": datetime.now().isoformat(),
                    "next_check": (datetime.now() + timedelta(days=15)).isoformat(),
                    "issues": [
                        {
                            "id": "sox-001",
                            "description": "Missing audit trail for data modifications",
                            "severity": "medium",
                            "status": "open"
                        }
                    ]
                },
                "hipaa": {
                    "score": 88,
                    "status": "compliant",
                    "last_checked": datetime.now().isoformat(),
                    "next_check": (datetime.now() + timedelta(days=60)).isoformat(),
                    "issues": []
                }
            },
            "data_classification": {
                "public": 25,
                "internal": 40,
                "confidential": 30,
                "restricted": 15
            },
            "retention_policies": {
                "compliant": 85,
                "non_compliant": 15
            }
        }
        
        return {
            "success": True,
            "data": compliance_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting compliance status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get compliance status")


# Backup Status Endpoints
@router.get("/data-sources/{data_source_id}/backup-status")
async def get_backup_status(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get backup status for a data source"""
    try:
        # Mock backup data - replace with actual implementation
        backup_data = {
            "backups": [
                {
                    "id": "backup-001",
                    "name": "Full Backup - 2024-01-15",
                    "size": "2.5GB",
                    "status": "completed",
                    "created_at": "2024-01-15T02:00:00Z",
                    "type": "full",
                    "retention_days": 30,
                    "location": "S3://backups/prod/db-1"
                },
                {
                    "id": "backup-002",
                    "name": "Incremental Backup - 2024-01-14",
                    "size": "150MB",
                    "status": "completed",
                    "created_at": "2024-01-14T02:00:00Z",
                    "type": "incremental",
                    "retention_days": 7,
                    "location": "S3://backups/prod/db-01"
                }
            ],
            "last_backup": "2024-01-15T02:00:00Z",
            "next_backup": "2024-01-16T02:00:00Z",
            "backup_enabled": True,
            "retention_policy": {
                "full_backups": 30,
                "incremental_backups": 7
            }
        }
        
        return {
            "success": True,
            "data": backup_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting backup status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get backup status")


# Scheduled Tasks Endpoints
@router.get("/data-sources/{data_source_id}/scheduled-tasks")
async def get_scheduled_tasks(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get scheduled tasks for a data source"""
    try:
        # Mock scheduled tasks data - replace with actual implementation
        tasks_data = {
            "tasks": [
                {
                    "id": "task-001",
                    "name": "Daily Backup",
                    "description": "Automated daily backup at 2:00AM",
                    "type": "backup",
                    "schedule": "Daily at 2:00 AM",
                    "status": "active",
                    "last_run": "2024-01-15T02:00:00Z",
                    "next_run": "2024-01-16T02:00:00Z",
                    "cron_expression": "0 2 * * *",
                    "enabled": True,
                    "retry_count": 0,
                    "max_retries": 3
                },
                {
                    "id": "task-002",
                    "name": "Weekly Security Scan",
                    "description": "Comprehensive security scan every Sunday",
                    "type": "security_scan",
                    "schedule": "Weekly on Sunday at 3:00 AM",
                    "status": "active",
                    "last_run": "2024-01-14T03:00:00Z",
                    "next_run": "2024-01-21T03:00:00Z",
                    "cron_expression": "0 3 * * 0",
                    "enabled": True,
                    "retry_count": 0,
                    "max_retries": 3
                }
            ]
        }
        
        return {
            "success": True,
            "data": tasks_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting scheduled tasks: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get scheduled tasks")


# Access Control Endpoints
@router.get("/data-sources/{data_source_id}/access-control")
async def get_access_control(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get access control information for a data source"""
    try:
        # Mock access control data - replace with actual implementation
        access_data = {
            "permissions": [
                {
                    "id": "perm-001",
                    "user_id": "user-1",
                    "username": "john.doe",
                    "email": "john.doe@company.com",
                    "role": "admin",
                    "permissions": ["read", "write", "execute", "delete"],
                    "granted_at": "2024-01-01T00:00:00Z",
                    "granted_by": "system-admin",
                    "status": "active"
                },
                {
                    "id": "perm-002",
                    "user_id": "user-2",
                    "username": "jane.smith",
                    "email": "jane.smith@company.com",
                    "role": "analyst",
                    "permissions": ["read", "execute"],
                    "granted_at": "2024-01-05T00:00:00Z",
                    "granted_by": "john.doe",
                    "status": "active"
                }
            ]
        }
        
        return {
            "success": True,
            "data": access_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting access control: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get access control")


# Notifications Endpoints
@router.get("/notifications")
async def get_notifications(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get notifications for the current user"""
    try:
        # Mock notifications data - replace with actual implementation
        notifications_data = {
            "notifications": [
                {
                    "id": "notif-001",
                    "title": "Backup Completed Successfully",
                    "message": "Backup of production database completed at 2:00AM",
                    "type": "success",
                    "priority": "low",
                    "created_at": "2024-01-15T02:05:00Z",
                    "read": False,
                    "category": "backup"
                },
                {
                    "id": "notif-002",
                    "title": "High CPU Usage Detected",
                    "message": "CPU usage has exceeded 80% for the last 10 minutes",
                    "type": "warning",
                    "priority": "high",
                    "created_at": "2024-01-15T10:30:00Z",
                    "read": False,
                    "category": "performance"
                }
            ]
        }
        
        return {
            "success": True,
            "data": notifications_data
        }
    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get notifications")


# Reports Endpoints
@router.get("/data-sources/{data_source_id}/reports")
async def get_reports(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get reports for a data source"""
    try:
        # Mock reports data - replace with actual implementation
        reports_data = {
            "reports": [
                {
                    "id": "report-001",
                    "name": "Monthly Performance Report",
                    "type": "performance",
                    "status": "completed",
                    "created_at": "2024-01-01T00:00:00Z",
                    "generated_at": "2024-01-01T01:00:00Z",
                    "size": "2.5MB",
                    "format": "pdf"
                },
                {
                    "id": "report-002",
                    "name": "Security Audit Report",
                    "type": "security",
                    "status": "completed",
                    "created_at": "2024-01-01T00:00:00Z",
                    "generated_at": "2024-01-01T01:30:00Z",
                    "size": "1.8MB",
                    "format": "pdf"
                }
            ]
        }
        
        return {
            "success": True,
            "data": reports_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get reports")


# Version History Endpoints
@router.get("/data-sources/{data_source_id}/version-history")
async def get_version_history(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get version history for a data source"""
    try:
        # Mock version history data - replace with actual implementation
        version_data = {
            "versions": [
                {
                    "id": "v-001",
                    "version": "1.2.3",
                    "description": "Updated security configurations",
                    "created_at": "2024-01-15T10:00:00Z",
                    "created_by": "john.doe",
                    "changes": [
                        "Added new encryption settings",
                        "Updated access control policies",
                        "Fixed backup scheduling issue"
                    ],
                    "status": "active"
                },
                {
                    "id": "v-002",
                    "version": "1.2.2",
                    "description": "Performance improvements",
                    "created_at": "2024-01-10T14:30:00Z",
                    "created_by": "jane.smith",
                    "changes": [
                        "Optimized query performance",
                        "Reduced memory usage",
                        "Updated indexing strategy"
                    ],
                    "status": "archived"
                }
            ]
        }
        
        return {
            "success": True,
            "data": version_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting version history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get version history")


# Tags Management Endpoints
@router.get("/data-sources/{data_source_id}/tags")
async def get_data_source_tags(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get tags for a data source"""
    try:
        # Mock tags data - replace with actual implementation
        tags_data = {
            "tags": [
                {
                    "id": "tag-001",
                    "name": "production",
                    "color": "#ff0000",
                    "description": "Production environment",
                    "created_at": "2024-01-01T00:00:00Z"
                },
                {
                    "id": "tag-002",
                    "name": "critical",
                    "color": "#ff6600",
                    "description": "Critical system component",
                    "created_at": "2024-01-01T00:00:00Z"
                },
                {
                    "id": "tag-003",
                    "name": "database",
                    "color": "#0066ff",
                    "description": "Database system",
                    "created_at": "2024-01-01T00:00:00Z"
                }
            ]
        }
        
        return {
            "success": True,
            "data": tags_data,
            "data_source_id": data_source_id
        }
    except Exception as e:
        logger.error(f"Error getting tags: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get tags")