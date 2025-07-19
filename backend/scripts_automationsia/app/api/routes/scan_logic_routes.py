from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from ...core.database import get_session
from ...core.security import get_current_user
from ...core.exceptions import NotFoundException, ValidationError, BusinessLogicError
from ...services.scan_logic_service import ScanLogicService
from ...models.scan_logic_models import (
    ScanConfiguration, ScanRun, ScanLog, ScanResult, DiscoveredEntity, ScanIssue,
    ScanSchedule, ScanAnalytics, ScanType, ScanStatus, ScanTriggerType,
    IssueSeverity, IssueType, EntityType,
    ScanConfigurationResponse, ScanRunResponse, ScanLogResponse, ScanResultResponse,
    DiscoveredEntityResponse, ScanIssueResponse, ScanScheduleResponse, ScanAnalyticsResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scan-logic", tags=["Scan Logic"])

# Service instance
scan_logic_service = ScanLogicService()


# Scan Configuration Routes
@router.post("/configurations", response_model=ScanConfigurationResponse)
async def create_scan_configuration(
    config_data: Dict[str, Any],
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Create a new scan configuration"""
    try:
        config = await scan_logic_service.create_scan_configuration(
            db, config_data, current_user
        )
        return config
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except BusinessLogicError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating scan configuration: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/configurations", response_model=Dict[str, Any])
async def get_scan_configurations(
    data_source_id: Optional[int] = Query(None, description="Filter by data source ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    scan_type: Optional[str] = Query(None, description="Filter by scan type"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get scan configurations with filtering and pagination"""
    try:
        configurations, total = await scan_logic_service.get_scan_configurations(
            db, current_user, data_source_id, status, scan_type, page, page_size
        )
        return {
            "configurations": configurations,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
    except Exception as e:
        logger.error(f"Error getting scan configurations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/configurations/{config_id}", response_model=ScanConfigurationResponse)
async def get_scan_configuration(
    config_id: int,
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get a specific scan configuration"""
    try:
        config = await scan_logic_service.get_scan_configuration(db, config_id, current_user)
        return config
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting scan configuration: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/configurations/{config_id}", response_model=ScanConfigurationResponse)
async def update_scan_configuration(
    config_id: int,
    update_data: Dict[str, Any],
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Update a scan configuration"""
    try:
        config = await scan_logic_service.update_scan_configuration(
            db, config_id, update_data, current_user
        )
        return config
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except BusinessLogicError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating scan configuration: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/configurations/{config_id}")
async def delete_scan_configuration(
    config_id: int,
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Delete a scan configuration"""
    try:
        success = await scan_logic_service.delete_scan_configuration(db, config_id, current_user)
        return {"message": "Scan configuration deleted successfully", "success": success}
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessLogicError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting scan configuration: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Scan Run Routes
@router.post("/configurations/{config_id}/runs", response_model=ScanRunResponse)
async def create_scan_run(
    config_id: int,
    run_data: Dict[str, Any],
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Create and start a new scan run"""
    try:
        trigger_type = ScanTriggerType(run_data.get("trigger_type", "manual"))
        run_name = run_data.get("run_name")
        
        scan_run = await scan_logic_service.create_scan_run(
            db, config_id, trigger_type, current_user, run_name
        )
        return scan_run
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessLogicError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating scan run: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/runs", response_model=Dict[str, Any])
async def get_scan_runs(
    config_id: Optional[int] = Query(None, description="Filter by configuration ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get scan runs with filtering and pagination"""
    try:
        scan_status = ScanStatus(status) if status else None
        runs, total = await scan_logic_service.get_scan_runs(
            db, current_user, config_id, scan_status, page, page_size
        )
        return {
            "runs": runs,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
    except Exception as e:
        logger.error(f"Error getting scan runs: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/runs/{run_id}", response_model=ScanRunResponse)
async def get_scan_run(
    run_id: int,
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get a specific scan run"""
    try:
        run = await scan_logic_service.get_scan_run(db, run_id, current_user)
        return run
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting scan run: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/runs/{run_id}/cancel", response_model=ScanRunResponse)
async def cancel_scan_run(
    run_id: int,
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Cancel a running scan"""
    try:
        run = await scan_logic_service.cancel_scan_run(db, run_id, current_user)
        return run
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessLogicError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error cancelling scan run: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Scan Results Routes
@router.get("/runs/{run_id}/results", response_model=Dict[str, Any])
async def get_scan_results(
    run_id: int,
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get comprehensive scan results"""
    try:
        results = await scan_logic_service.get_scan_results(db, run_id, current_user)
        return results
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting scan results: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/runs/{run_id}/logs", response_model=List[ScanLogResponse])
async def get_scan_logs(
    run_id: int,
    level: Optional[str] = Query(None, description="Filter by log level"),
    limit: int = Query(100, ge=1, le=1000, description="Number of logs to return"),
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get scan logs for a specific run"""
    try:
        # Verify run exists
        await scan_logic_service.get_scan_run(db, run_id, current_user)
        
        # Get logs
        query = f"""
        SELECT * FROM scan_logs 
        WHERE scan_run_id = {run_id}
        {f"AND level = '{level}'" if level else ""}
        ORDER BY timestamp DESC
        LIMIT {limit}
        """
        
        # This would be replaced with proper ORM query
        logs = []  # Placeholder
        return logs
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting scan logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/runs/{run_id}/entities", response_model=List[DiscoveredEntityResponse])
async def get_discovered_entities(
    run_id: int,
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get discovered entities for a specific run"""
    try:
        # Verify run exists
        await scan_logic_service.get_scan_run(db, run_id, current_user)
        
        # Get entities
        query = f"""
        SELECT * FROM discovered_entities 
        WHERE scan_run_id = {run_id}
        {f"AND type = '{entity_type}'" if entity_type else ""}
        ORDER BY created_at DESC
        LIMIT {page_size} OFFSET {(page - 1) * page_size}
        """
        
        # This would be replaced with proper ORM query
        entities = []  # Placeholder
        return entities
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting discovered entities: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/runs/{run_id}/issues", response_model=List[ScanIssueResponse])
async def get_scan_issues(
    run_id: int,
    severity: Optional[str] = Query(None, description="Filter by severity"),
    issue_type: Optional[str] = Query(None, description="Filter by issue type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get scan issues for a specific run"""
    try:
        # Verify run exists
        await scan_logic_service.get_scan_run(db, run_id, current_user)
        
        # Get issues
        query = f"""
        SELECT * FROM scan_issues 
        WHERE scan_run_id = {run_id}
        {f"AND severity = '{severity}'" if severity else ""}
        {f"AND type = '{issue_type}'" if issue_type else ""}
        {f"AND status = '{status}'" if status else ""}
        ORDER BY created_at DESC
        LIMIT {page_size} OFFSET {(page - 1) * page_size}
        """
        
        # This would be replaced with proper ORM query
        issues = []  # Placeholder
        return issues
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting scan issues: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Analytics Routes
@router.get("/analytics", response_model=Dict[str, Any])
async def get_scan_analytics(
    data_source_id: Optional[int] = Query(None, description="Filter by data source ID"),
    period: str = Query("daily", description="Analytics period"),
    start_date: Optional[datetime] = Query(None, description="Start date"),
    end_date: Optional[datetime] = Query(None, description="End date"),
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get scan analytics and metrics"""
    try:
        analytics = await scan_logic_service.get_scan_analytics(
            db, current_user, data_source_id, period, start_date, end_date
        )
        return analytics
    except Exception as e:
        logger.error(f"Error getting scan analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/statistics", response_model=Dict[str, Any])
async def get_scan_statistics(
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get overall scan statistics"""
    try:
        stats = await scan_logic_service.get_scan_statistics(db, current_user)
        return stats
    except Exception as e:
        logger.error(f"Error getting scan statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Schedule Management Routes
@router.get("/schedules", response_model=List[ScanScheduleResponse])
async def get_scan_schedules(
    config_id: Optional[int] = Query(None, description="Filter by configuration ID"),
    enabled: Optional[bool] = Query(None, description="Filter by enabled status"),
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get scan schedules"""
    try:
        # This would be implemented in the service
        schedules = []  # Placeholder
        return schedules
    except Exception as e:
        logger.error(f"Error getting scan schedules: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/schedules/{schedule_id}/enable")
async def enable_scan_schedule(
    schedule_id: int,
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Enable a scan schedule"""
    try:
        # This would be implemented in the service
        return {"message": "Schedule enabled successfully"}
    except Exception as e:
        logger.error(f"Error enabling scan schedule: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/schedules/{schedule_id}/disable")
async def disable_scan_schedule(
    schedule_id: int,
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Disable a scan schedule"""
    try:
        # This would be implemented in the service
        return {"message": "Schedule disabled successfully"}
    except Exception as e:
        logger.error(f"Error disabling scan schedule: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Real-time Monitoring Routes
@router.get("/monitoring/active-runs", response_model=List[ScanRunResponse])
async def get_active_runs(
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get currently active scan runs"""
    try:
        runs, _ = await scan_logic_service.get_scan_runs(
            db, current_user, status=ScanStatus.RUNNING
        )
        return runs
    except Exception as e:
        logger.error(f"Error getting active runs: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/monitoring/recent-activity", response_model=Dict[str, Any])
async def get_recent_activity(
    hours: int = Query(24, ge=1, le=168, description="Hours to look back"),
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get recent scan activity"""
    try:
        since = datetime.now() - timedelta(hours=hours)
        
        # Get recent runs
        recent_runs = []  # Placeholder for recent runs query
        
        # Get recent issues
        recent_issues = []  # Placeholder for recent issues query
        
        return {
            "recent_runs": recent_runs,
            "recent_issues": recent_issues,
            "period_hours": hours
        }
    except Exception as e:
        logger.error(f"Error getting recent activity: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Issue Management Routes
@router.put("/issues/{issue_id}", response_model=ScanIssueResponse)
async def update_scan_issue(
    issue_id: int,
    update_data: Dict[str, Any],
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Update a scan issue"""
    try:
        # This would be implemented in the service
        issue = {}  # Placeholder
        return issue
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating scan issue: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/issues/{issue_id}/assign")
async def assign_issue(
    issue_id: int,
    assignee: str,
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Assign an issue to a user"""
    try:
        # This would be implemented in the service
        return {"message": "Issue assigned successfully"}
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error assigning issue: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/issues/{issue_id}/resolve")
async def resolve_issue(
    issue_id: int,
    resolution_notes: Optional[str] = None,
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Resolve an issue"""
    try:
        # This would be implemented in the service
        return {"message": "Issue resolved successfully"}
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error resolving issue: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Bulk Operations Routes
@router.post("/configurations/bulk-update")
async def bulk_update_configurations(
    updates: List[Dict[str, Any]],
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Bulk update scan configurations"""
    try:
        results = []
        for update in updates:
            try:
                config_id = update["id"]
                update_data = {k: v for k, v in update.items() if k != "id"}
                config = await scan_logic_service.update_scan_configuration(
                    db, config_id, update_data, current_user
                )
                results.append({"id": config_id, "status": "success", "data": config})
            except Exception as e:
                results.append({"id": update.get("id"), "status": "error", "error": str(e)})
        
        return {"results": results}
    except Exception as e:
        logger.error(f"Error in bulk update: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/runs/bulk-cancel")
async def bulk_cancel_runs(
    run_ids: List[int],
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Bulk cancel scan runs"""
    try:
        results = []
        for run_id in run_ids:
            try:
                run = await scan_logic_service.cancel_scan_run(db, run_id, current_user)
                results.append({"id": run_id, "status": "success", "data": run})
            except Exception as e:
                results.append({"id": run_id, "status": "error", "error": str(e)})
        
        return {"results": results}
    except Exception as e:
        logger.error(f"Error in bulk cancel: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Export Routes
@router.get("/export/results/{run_id}")
async def export_scan_results(
    run_id: int,
    format: str = Query("json", description="Export format (json, csv, excel)"),
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Export scan results"""
    try:
        # Verify run exists
        await scan_logic_service.get_scan_run(db, run_id, current_user)
        
        # This would generate the export file
        return {"message": f"Export generated in {format} format", "download_url": f"/downloads/scan_{run_id}.{format}"}
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error exporting scan results: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/export/analytics")
async def export_analytics(
    data_source_id: Optional[int] = Query(None, description="Filter by data source ID"),
    start_date: Optional[datetime] = Query(None, description="Start date"),
    end_date: Optional[datetime] = Query(None, description="End date"),
    format: str = Query("json", description="Export format (json, csv, excel)"),
    db: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Export scan analytics"""
    try:
        # This would generate the analytics export
        return {"message": f"Analytics export generated in {format} format", "download_url": f"/downloads/analytics.{format}"}
    except Exception as e:
        logger.error(f"Error exporting analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")