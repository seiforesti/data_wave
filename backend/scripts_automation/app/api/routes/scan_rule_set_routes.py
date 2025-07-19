from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta
import logging
from pydantic import BaseModel

from app.database import get_session
from app.models.scan_models import ScanRuleSet, DataSource, Scan, ScanResult
from app.services.scan_rule_set_service import ScanRuleSetService
from app.services.data_source_service import DataSourceService
from app.services.scan_service import ScanService
from app.auth.auth_bearer import JWTBearer
from app.auth.auth_handler import decode_jwt

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scan-rule-sets", tags=["Scan Rule Sets"])

# Pydantic models for request/response
class ScanRuleSetCreate(BaseModel):
    name: str
    description: Optional[str] = None
    data_source_id: Optional[int] = None
    include_schemas: Optional[List[str]] = None
    exclude_schemas: Optional[List[str]] = None
    include_tables: Optional[List[str]] = None
    exclude_tables: Optional[List[str]] = None
    include_columns: Optional[List[str]] = None
    exclude_columns: Optional[List[str]] = None
    sample_data: bool = False
    sample_size: Optional[int] = 100

class ScanRuleSetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    data_source_id: Optional[int] = None
    include_schemas: Optional[List[str]] = None
    exclude_schemas: Optional[List[str]] = None
    include_tables: Optional[List[str]] = None
    exclude_tables: Optional[List[str]] = None
    include_columns: Optional[List[str]] = None
    exclude_columns: Optional[List[str]] = None
    sample_data: Optional[bool] = None
    sample_size: Optional[int] = None

class ScanRuleSetResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    data_source_id: Optional[int] = None
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
    data_source: Optional[Dict[str, Any]] = None
    scan_count: int = 0
    last_scan: Optional[datetime] = None
    success_rate: Optional[float] = None

class ScanRuleSetAnalytics(BaseModel):
    total_rule_sets: int
    active_rule_sets: int
    rule_sets_by_data_source: Dict[str, int]
    average_success_rate: float
    total_scans_executed: int
    scans_last_30_days: int
    top_performing_rule_sets: List[Dict[str, Any]]
    rule_set_usage_trends: List[Dict[str, Any]]

class ScanRuleSetWorkflow(BaseModel):
    rule_set_id: int
    action: str  # execute, validate, duplicate, export
    parameters: Optional[Dict[str, Any]] = None

class ScanRuleSetReport(BaseModel):
    rule_set_id: int
    report_type: str  # performance, compliance, usage
    date_range: Optional[str] = None
    format: str = "json"  # json, csv, pdf

# Dependency for authentication
def get_current_user(token: str = Depends(JWTBearer())):
    try:
        payload = decode_jwt(token)
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

# CRUD Operations
@router.post("/", response_model=ScanRuleSetResponse, status_code=status.HTTP_201_CREATED)
async def create_scan_rule_set(
    rule_set: ScanRuleSetCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new scan rule set."""
    try:
        # Validate data source if provided
        if rule_set.data_source_id:
            data_source = session.get(DataSource, rule_set.data_source_id)
            if not data_source:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Data source with ID {rule_set.data_source_id} not found"
                )
        
        # Check if rule set with same name exists
        existing_rule_set = ScanRuleSetService.get_scan_rule_set_by_name(session, rule_set.name)
        if existing_rule_set:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Scan rule set with name '{rule_set.name}' already exists"
            )
        
        db_rule_set = ScanRuleSetService.create_scan_rule_set(
            session=session,
            name=rule_set.name,
            description=rule_set.description,
            data_source_id=rule_set.data_source_id,
            include_schemas=rule_set.include_schemas,
            exclude_schemas=rule_set.exclude_schemas,
            include_tables=rule_set.include_tables,
            exclude_tables=rule_set.exclude_tables,
            include_columns=rule_set.include_columns,
            exclude_columns=rule_set.exclude_columns,
            sample_data=rule_set.sample_data,
            sample_size=rule_set.sample_size
        )
        
        logger.info(f"User {current_user.get('user_id')} created scan rule set: {db_rule_set.name}")
        
        # Prepare response with additional data
        response_data = ScanRuleSetResponse.model_validate(db_rule_set)
        if db_rule_set.data_source:
            response_data.data_source = {
                "id": db_rule_set.data_source.id,
                "name": db_rule_set.data_source.name,
                "source_type": db_rule_set.data_source.source_type
            }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating scan rule set: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/", response_model=List[ScanRuleSetResponse])
async def get_scan_rule_sets(
    data_source_id: Optional[int] = Query(None, description="Filter by data source ID"),
    search: Optional[str] = Query(None, description="Search by name or description"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Page size"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all scan rule sets with optional filtering and pagination."""
    try:
        # Get rule sets based on data source filter
        if data_source_id:
            rule_sets = ScanRuleSetService.get_scan_rule_sets_by_data_source(session, data_source_id)
        else:
            rule_sets = ScanRuleSetService.get_all_scan_rule_sets(session)
        
        # Apply search filter
        if search:
            search_lower = search.lower()
            rule_sets = [
                rs for rs in rule_sets
                if search_lower in rs.name.lower() or 
                   (rs.description and search_lower in rs.description.lower())
            ]
        
        # Apply pagination
        total = len(rule_sets)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_rule_sets = rule_sets[start_idx:end_idx]
        
        # Prepare response with additional data
        response_data = []
        for rule_set in paginated_rule_sets:
            # Get scan statistics
            scans = session.exec(
                select(Scan).where(Scan.scan_rule_set_id == rule_set.id)
            ).all()
            
            scan_count = len(scans)
            last_scan = max([scan.completed_at for scan in scans if scan.completed_at]) if scans else None
            
            # Calculate success rate
            completed_scans = [scan for scan in scans if scan.status in ['completed', 'failed']]
            success_rate = None
            if completed_scans:
                successful_scans = len([scan for scan in completed_scans if scan.status == 'completed'])
                success_rate = (successful_scans / len(completed_scans)) * 100
            
            rule_set_data = ScanRuleSetResponse.model_validate(rule_set)
            rule_set_data.scan_count = scan_count
            rule_set_data.last_scan = last_scan
            rule_set_data.success_rate = success_rate
            
            if rule_set.data_source:
                rule_set_data.data_source = {
                    "id": rule_set.data_source.id,
                    "name": rule_set.data_source.name,
                    "source_type": rule_set.data_source.source_type
                }
            
            response_data.append(rule_set_data)
        
        return response_data
        
    except Exception as e:
        logger.error(f"Error retrieving scan rule sets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/{rule_set_id}", response_model=ScanRuleSetResponse)
async def get_scan_rule_set(
    rule_set_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific scan rule set by ID."""
    try:
        rule_set = ScanRuleSetService.get_scan_rule_set(session, rule_set_id)
        if not rule_set:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scan rule set with ID {rule_set_id} not found"
            )
        
        # Get scan statistics
        scans = session.exec(
            select(Scan).where(Scan.scan_rule_set_id == rule_set_id)
        ).all()
        
        scan_count = len(scans)
        last_scan = max([scan.completed_at for scan in scans if scan.completed_at]) if scans else None
        
        # Calculate success rate
        completed_scans = [scan for scan in scans if scan.status in ['completed', 'failed']]
        success_rate = None
        if completed_scans:
            successful_scans = len([scan for scan in completed_scans if scan.status == 'completed'])
            success_rate = (successful_scans / len(completed_scans)) * 100
        
        response_data = ScanRuleSetResponse.model_validate(rule_set)
        response_data.scan_count = scan_count
        response_data.last_scan = last_scan
        response_data.success_rate = success_rate
        
        if rule_set.data_source:
            response_data.data_source = {
                "id": rule_set.data_source.id,
                "name": rule_set.data_source.name,
                "source_type": rule_set.data_source.source_type
            }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving scan rule set {rule_set_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/{rule_set_id}", response_model=ScanRuleSetResponse)
async def update_scan_rule_set(
    rule_set_id: int,
    rule_set_update: ScanRuleSetUpdate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update a scan rule set."""
    try:
        # Check if rule set exists
        existing_rule_set = ScanRuleSetService.get_scan_rule_set(session, rule_set_id)
        if not existing_rule_set:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scan rule set with ID {rule_set_id} not found"
            )
        
        # Validate data source if provided
        if rule_set_update.data_source_id:
            data_source = session.get(DataSource, rule_set_update.data_source_id)
            if not data_source:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Data source with ID {rule_set_update.data_source_id} not found"
                )
        
        # Check name uniqueness if name is being updated
        if rule_set_update.name and rule_set_update.name != existing_rule_set.name:
            name_exists = ScanRuleSetService.get_scan_rule_set_by_name(session, rule_set_update.name)
            if name_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Scan rule set with name '{rule_set_update.name}' already exists"
                )
        
        # Update rule set
        update_data = rule_set_update.model_dump(exclude_unset=True)
        updated_rule_set = ScanRuleSetService.update_scan_rule_set(
            session=session,
            scan_rule_set_id=rule_set_id,
            **update_data
        )
        
        logger.info(f"User {current_user.get('user_id')} updated scan rule set: {updated_rule_set.name}")
        
        # Prepare response
        response_data = ScanRuleSetResponse.model_validate(updated_rule_set)
        if updated_rule_set.data_source:
            response_data.data_source = {
                "id": updated_rule_set.data_source.id,
                "name": updated_rule_set.data_source.name,
                "source_type": updated_rule_set.data_source.source_type
            }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating scan rule set {rule_set_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/{rule_set_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan_rule_set(
    rule_set_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a scan rule set."""
    try:
        # Check if rule set exists
        existing_rule_set = ScanRuleSetService.get_scan_rule_set(session, rule_set_id)
        if not existing_rule_set:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scan rule set with ID {rule_set_id} not found"
            )
        
        # Check if rule set is being used by any scans
        active_scans = session.exec(
            select(Scan).where(
                Scan.scan_rule_set_id == rule_set_id,
                Scan.status.in_(['pending', 'running'])
            )
        ).all()
        
        if active_scans:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete scan rule set that has active scans"
            )
        
        success = ScanRuleSetService.delete_scan_rule_set(session, rule_set_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete scan rule set"
            )
        
        logger.info(f"User {current_user.get('user_id')} deleted scan rule set: {existing_rule_set.name}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting scan rule set {rule_set_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Analytics and Reporting
@router.get("/analytics/overview", response_model=ScanRuleSetAnalytics)
async def get_scan_rule_set_analytics(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get analytics overview for scan rule sets."""
    try:
        # Get all rule sets
        all_rule_sets = ScanRuleSetService.get_all_scan_rule_sets(session)
        
        # Get all scans
        all_scans = session.exec(select(Scan)).all()
        
        # Calculate analytics
        total_rule_sets = len(all_rule_sets)
        active_rule_sets = len([rs for rs in all_rule_sets if rs.updated_at > datetime.utcnow() - timedelta(days=30)])
        
        # Rule sets by data source
        rule_sets_by_data_source = {}
        for rule_set in all_rule_sets:
            if rule_set.data_source:
                source_name = rule_set.data_source.name
                rule_sets_by_data_source[source_name] = rule_sets_by_data_source.get(source_name, 0) + 1
        
        # Success rate calculation
        completed_scans = [scan for scan in all_scans if scan.status in ['completed', 'failed']]
        average_success_rate = 0.0
        if completed_scans:
            successful_scans = len([scan for scan in completed_scans if scan.status == 'completed'])
            average_success_rate = (successful_scans / len(completed_scans)) * 100
        
        # Scan statistics
        total_scans_executed = len(all_scans)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        scans_last_30_days = len([scan for scan in all_scans if scan.created_at >= thirty_days_ago])
        
        # Top performing rule sets
        rule_set_performance = {}
        for scan in all_scans:
            if scan.scan_rule_set_id:
                if scan.scan_rule_set_id not in rule_set_performance:
                    rule_set_performance[scan.scan_rule_set_id] = {
                        'total_scans': 0,
                        'successful_scans': 0,
                        'rule_set_name': scan.scan_rule_set.name if scan.scan_rule_set else 'Unknown'
                    }
                rule_set_performance[scan.scan_rule_set_id]['total_scans'] += 1
                if scan.status == 'completed':
                    rule_set_performance[scan.scan_rule_set_id]['successful_scans'] += 1
        
        top_performing_rule_sets = []
        for rule_set_id, stats in rule_set_performance.items():
            if stats['total_scans'] > 0:
                success_rate = (stats['successful_scans'] / stats['total_scans']) * 100
                top_performing_rule_sets.append({
                    'rule_set_id': rule_set_id,
                    'name': stats['rule_set_name'],
                    'success_rate': success_rate,
                    'total_scans': stats['total_scans']
                })
        
        # Sort by success rate
        top_performing_rule_sets.sort(key=lambda x: x['success_rate'], reverse=True)
        top_performing_rule_sets = top_performing_rule_sets[:10]
        
        # Usage trends (last 7 days)
        usage_trends = []
        for i in range(7):
            date = datetime.utcnow() - timedelta(days=i)
            start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = start_of_day + timedelta(days=1)
            
            daily_scans = len([
                scan for scan in all_scans
                if start_of_day <= scan.created_at < end_of_day
            ])
            
            usage_trends.append({
                'date': start_of_day.date().isoformat(),
                'scan_count': daily_scans
            })
        
        usage_trends.reverse()
        
        return ScanRuleSetAnalytics(
            total_rule_sets=total_rule_sets,
            active_rule_sets=active_rule_sets,
            rule_sets_by_data_source=rule_sets_by_data_source,
            average_success_rate=average_success_rate,
            total_scans_executed=total_scans_executed,
            scans_last_30_days=scans_last_30_days,
            top_performing_rule_sets=top_performing_rule_sets,
            rule_set_usage_trends=usage_trends
        )
        
    except Exception as e:
        logger.error(f"Error generating scan rule set analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Workflow Operations
@router.post("/{rule_set_id}/execute")
async def execute_scan_rule_set(
    rule_set_id: int,
    data_source_id: Optional[int] = None,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Execute a scan using the specified rule set."""
    try:
        # Verify rule set exists
        rule_set = ScanRuleSetService.get_scan_rule_set(session, rule_set_id)
        if not rule_set:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scan rule set with ID {rule_set_id} not found"
            )
        
        # Use rule set's data source if not specified
        target_data_source_id = data_source_id or rule_set.data_source_id
        if not target_data_source_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No data source specified for scan execution"
            )
        
        # Verify data source exists
        data_source = session.get(DataSource, target_data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source with ID {target_data_source_id} not found"
            )
        
        # Create and execute scan
        scan_name = f"Scan using {rule_set.name}"
        scan = ScanService.create_scan(
            session=session,
            name=scan_name,
            data_source_id=target_data_source_id,
            scan_rule_set_id=rule_set_id,
            created_by=current_user.get('user_id', 'unknown')
        )
        
        # Execute scan asynchronously
        await ScanService.execute_scan_async(scan, data_source, rule_set)
        
        logger.info(f"User {current_user.get('user_id')} executed scan rule set: {rule_set.name}")
        
        return {
            "message": "Scan execution started",
            "scan_id": scan.scan_id,
            "rule_set_name": rule_set.name,
            "data_source_name": data_source.name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing scan rule set {rule_set_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/{rule_set_id}/duplicate")
async def duplicate_scan_rule_set(
    rule_set_id: int,
    new_name: str,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Duplicate a scan rule set."""
    try:
        # Get original rule set
        original_rule_set = ScanRuleSetService.get_scan_rule_set(session, rule_set_id)
        if not original_rule_set:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scan rule set with ID {rule_set_id} not found"
            )
        
        # Check if new name already exists
        existing_rule_set = ScanRuleSetService.get_scan_rule_set_by_name(session, new_name)
        if existing_rule_set:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Scan rule set with name '{new_name}' already exists"
            )
        
        # Create duplicate
        duplicated_rule_set = ScanRuleSetService.create_scan_rule_set(
            session=session,
            name=new_name,
            description=f"Copy of {original_rule_set.name}",
            data_source_id=original_rule_set.data_source_id,
            include_schemas=original_rule_set.include_schemas,
            exclude_schemas=original_rule_set.exclude_schemas,
            include_tables=original_rule_set.include_tables,
            exclude_tables=original_rule_set.exclude_tables,
            include_columns=original_rule_set.include_columns,
            exclude_columns=original_rule_set.exclude_columns,
            sample_data=original_rule_set.sample_data,
            sample_size=original_rule_set.sample_size
        )
        
        logger.info(f"User {current_user.get('user_id')} duplicated scan rule set: {original_rule_set.name} -> {new_name}")
        
        return ScanRuleSetResponse.model_validate(duplicated_rule_set)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error duplicating scan rule set {rule_set_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Validation
@router.post("/validate")
async def validate_scan_rule_set(
    rule_set: ScanRuleSetCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Validate a scan rule set configuration."""
    try:
        validation_errors = []
        
        # Validate data source if provided
        if rule_set.data_source_id:
            data_source = session.get(DataSource, rule_set.data_source_id)
            if not data_source:
                validation_errors.append(f"Data source with ID {rule_set.data_source_id} not found")
        
        # Validate name uniqueness
        existing_rule_set = ScanRuleSetService.get_scan_rule_set_by_name(session, rule_set.name)
        if existing_rule_set:
            validation_errors.append(f"Scan rule set with name '{rule_set.name}' already exists")
        
        # Validate sample size if sample_data is enabled
        if rule_set.sample_data and rule_set.sample_size:
            if rule_set.sample_size <= 0:
                validation_errors.append("Sample size must be greater than 0")
            elif rule_set.sample_size > 10000:
                validation_errors.append("Sample size cannot exceed 10,000")
        
        # Validate inclusion/exclusion lists
        if rule_set.include_schemas and rule_set.exclude_schemas:
            conflicts = set(rule_set.include_schemas) & set(rule_set.exclude_schemas)
            if conflicts:
                validation_errors.append(f"Schemas cannot be both included and excluded: {list(conflicts)}")
        
        if rule_set.include_tables and rule_set.exclude_tables:
            conflicts = set(rule_set.include_tables) & set(rule_set.exclude_tables)
            if conflicts:
                validation_errors.append(f"Tables cannot be both included and excluded: {list(conflicts)}")
        
        if rule_set.include_columns and rule_set.exclude_columns:
            conflicts = set(rule_set.include_columns) & set(rule_set.exclude_columns)
            if conflicts:
                validation_errors.append(f"Columns cannot be both included and excluded: {list(conflicts)}")
        
        return {
            "valid": len(validation_errors) == 0,
            "errors": validation_errors,
            "warnings": []
        }
        
    except Exception as e:
        logger.error(f"Error validating scan rule set: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )