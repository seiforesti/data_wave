from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta
import logging
from pydantic import BaseModel

from app.database import get_session
from app.models.catalog_models import (
    CatalogItem, CatalogTag, DataLineage, CatalogUsageLog, CatalogQualityRule,
    CatalogItemType, DataClassification, CatalogItemResponse, CatalogItemCreate,
    CatalogItemUpdate, CatalogStats, CatalogSearchRequest
)
from app.models.scan_models import DataSource
from app.services.catalog_service import CatalogService
from app.services.data_source_service import DataSourceService
from app.auth.auth_bearer import JWTBearer
from app.auth.auth_handler import decode_jwt

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/data-catalog", tags=["Data Catalog"])

# Pydantic models for request/response
class DataCatalogAnalytics(BaseModel):
    total_items: int
    items_by_type: Dict[str, int]
    items_by_classification: Dict[str, int]
    avg_quality_score: float
    total_queries: int
    unique_users: int
    top_accessed_items: List[Dict[str, Any]]
    quality_distribution: Dict[str, int]
    lineage_coverage: float
    recent_activity: List[Dict[str, Any]]

class DataCatalogWorkflow(BaseModel):
    item_id: int
    action: str  # classify, tag, quality_check, lineage_update
    parameters: Optional[Dict[str, Any]] = None

class DataCatalogReport(BaseModel):
    report_type: str  # quality, lineage, usage, compliance
    data_source_id: Optional[int] = None
    date_range: Optional[str] = None
    format: str = "json"

class LineageGraph(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    metadata: Dict[str, Any]

class QualityAssessment(BaseModel):
    item_id: int
    rules: List[Dict[str, Any]]
    overall_score: float
    issues: List[Dict[str, Any]]
    recommendations: List[str]

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
@router.post("/items", response_model=CatalogItemResponse, status_code=status.HTTP_201_CREATED)
async def create_catalog_item(
    item: CatalogItemCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new catalog item."""
    try:
        # Validate data source exists
        data_source = session.get(DataSource, item.data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source with ID {item.data_source_id} not found"
            )
        
        # Validate parent item if specified
        if item.parent_id:
            parent_item = session.get(CatalogItem, item.parent_id)
            if not parent_item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Parent catalog item with ID {item.parent_id} not found"
                )
        
        catalog_item = CatalogService.create_catalog_item(
            session=session,
            item_data=item,
            created_by=current_user.get('user_id', 'unknown')
        )
        
        logger.info(f"User {current_user.get('user_id')} created catalog item: {catalog_item.name}")
        return catalog_item
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating catalog item: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/items", response_model=List[CatalogItemResponse])
async def get_catalog_items(
    data_source_id: Optional[int] = Query(None, description="Filter by data source ID"),
    item_type: Optional[CatalogItemType] = Query(None, description="Filter by item type"),
    classification: Optional[DataClassification] = Query(None, description="Filter by classification"),
    search: Optional[str] = Query(None, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Page size"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get catalog items with filtering and pagination."""
    try:
        # Build query
        statement = select(CatalogItem).where(CatalogItem.is_active == True)
        
        if data_source_id:
            statement = statement.where(CatalogItem.data_source_id == data_source_id)
        
        if item_type:
            statement = statement.where(CatalogItem.type == item_type)
        
        if classification:
            statement = statement.where(CatalogItem.classification == classification)
        
        if search:
            statement = statement.where(
                (CatalogItem.name.ilike(f"%{search}%")) |
                (CatalogItem.description.ilike(f"%{search}%")) |
                (CatalogItem.schema_name.ilike(f"%{search}%")) |
                (CatalogItem.table_name.ilike(f"%{search}%"))
            )
        
        # Apply pagination
        total = len(session.exec(statement).all())
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        statement = statement.offset(start_idx).limit(page_size)
        items = session.exec(statement).all()
        
        # Convert to response models
        response_items = []
        for item in items:
            item_response = CatalogItemResponse.from_orm(item)
            
            # Get tags for the item
            tags = session.exec(
                select(CatalogTag).join(CatalogItemTag).where(CatalogItemTag.catalog_item_id == item.id)
            ).all()
            item_response.tags = [tag.name for tag in tags]
            
            response_items.append(item_response)
        
        return response_items
        
    except Exception as e:
        logger.error(f"Error retrieving catalog items: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/items/{item_id}", response_model=CatalogItemResponse)
async def get_catalog_item(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific catalog item by ID."""
    try:
        item = CatalogService.get_catalog_item_by_id(session, item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Catalog item with ID {item_id} not found"
            )
        
        return item
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving catalog item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/items/{item_id}", response_model=CatalogItemResponse)
async def update_catalog_item(
    item_id: int,
    item_update: CatalogItemUpdate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update a catalog item."""
    try:
        updated_item = CatalogService.update_catalog_item(
            session=session,
            item_id=item_id,
            item_data=item_update,
            updated_by=current_user.get('user_id', 'unknown')
        )
        
        if not updated_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Catalog item with ID {item_id} not found"
            )
        
        logger.info(f"User {current_user.get('user_id')} updated catalog item: {updated_item.name}")
        return updated_item
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating catalog item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_catalog_item(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a catalog item."""
    try:
        success = CatalogService.delete_catalog_item(
            session=session,
            item_id=item_id,
            deleted_by=current_user.get('user_id', 'unknown')
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Catalog item with ID {item_id} not found"
            )
        
        logger.info(f"User {current_user.get('user_id')} deleted catalog item: {item_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting catalog item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Search and Discovery
@router.post("/search", response_model=List[CatalogItemResponse])
async def search_catalog_items(
    search_request: CatalogSearchRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Search catalog items with advanced filters."""
    try:
        items = CatalogService.search_catalog_items(
            session=session,
            query=search_request.query or "",
            data_source_id=search_request.data_source_id,
            classification=search_request.classification_filter,
            limit=search_request.limit
        )
        
        return items
        
    except Exception as e:
        logger.error(f"Error searching catalog items: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/discover/{data_source_id}")
async def discover_catalog_items(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Discover and create catalog items from a data source."""
    try:
        # Verify data source exists
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source with ID {data_source_id} not found"
            )
        
        # Discover schema and create catalog items
        discovered_count = CatalogService.discover_schema(
            session=session,
            data_source_id=data_source_id,
            discovered_by=current_user.get('user_id', 'unknown')
        )
        
        logger.info(f"User {current_user.get('user_id')} discovered {discovered_count} catalog items from data source {data_source_id}")
        
        return {
            "message": f"Successfully discovered {discovered_count} catalog items",
            "discovered_count": discovered_count,
            "data_source_id": data_source_id
        }
        
    except Exception as e:
        logger.error(f"Error discovering catalog items: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Lineage Management
@router.get("/items/{item_id}/lineage", response_model=LineageGraph)
async def get_item_lineage(
    item_id: int,
    depth: int = Query(3, ge=1, le=10, description="Lineage depth"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get data lineage for a catalog item."""
    try:
        # Verify item exists
        item = session.get(CatalogItem, item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Catalog item with ID {item_id} not found"
            )
        
        lineage_data = CatalogService.get_data_lineage(session, item_id)
        
        # Build lineage graph
        nodes = []
        edges = []
        
        # Add current item
        nodes.append({
            "id": str(item.id),
            "name": item.name,
            "type": item.type,
            "classification": item.classification,
            "data_source_id": item.data_source_id
        })
        
        # Add upstream items
        for upstream in lineage_data.get("upstream", []):
            source_item = upstream["item"]
            nodes.append({
                "id": str(source_item.id),
                "name": source_item.name,
                "type": source_item.type,
                "classification": source_item.classification,
                "data_source_id": source_item.data_source_id
            })
            edges.append({
                "source": str(source_item.id),
                "target": str(item.id),
                "type": upstream["lineage"].lineage_type,
                "transformation": upstream["lineage"].transformation_logic
            })
        
        # Add downstream items
        for downstream in lineage_data.get("downstream", []):
            target_item = downstream["item"]
            nodes.append({
                "id": str(target_item.id),
                "name": target_item.name,
                "type": target_item.type,
                "classification": target_item.classification,
                "data_source_id": target_item.data_source_id
            })
            edges.append({
                "source": str(item.id),
                "target": str(target_item.id),
                "type": downstream["lineage"].lineage_type,
                "transformation": downstream["lineage"].transformation_logic
            })
        
        return LineageGraph(
            nodes=nodes,
            edges=edges,
            metadata={
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "depth": depth,
                "generated_at": datetime.utcnow().isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting lineage for item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/lineage")
async def create_lineage(
    source_item_id: int,
    target_item_id: int,
    lineage_type: str = "transform",
    transformation_logic: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a data lineage relationship."""
    try:
        # Verify both items exist
        source_item = session.get(CatalogItem, source_item_id)
        target_item = session.get(CatalogItem, target_item_id)
        
        if not source_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source catalog item with ID {source_item_id} not found"
            )
        
        if not target_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target catalog item with ID {target_item_id} not found"
            )
        
        success = CatalogService.create_lineage(
            session=session,
            source_item_id=source_item_id,
            target_item_id=target_item_id,
            transformation_logic=transformation_logic,
            created_by=current_user.get('user_id', 'unknown')
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create lineage relationship"
            )
        
        logger.info(f"User {current_user.get('user_id')} created lineage from {source_item_id} to {target_item_id}")
        
        return {
            "message": "Lineage relationship created successfully",
            "source_item_id": source_item_id,
            "target_item_id": target_item_id,
            "lineage_type": lineage_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating lineage: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Analytics and Reporting
@router.get("/analytics/overview", response_model=DataCatalogAnalytics)
async def get_catalog_analytics(
    data_source_id: Optional[int] = Query(None, description="Filter by data source ID"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get comprehensive analytics for the data catalog."""
    try:
        # Get catalog statistics
        stats = CatalogService.get_catalog_stats(session, data_source_id)
        
        # Get top accessed items
        top_accessed = session.exec(
            select(CatalogItem)
            .order_by(CatalogItem.query_count.desc())
            .limit(10)
        ).all()
        
        top_accessed_items = []
        for item in top_accessed:
            top_accessed_items.append({
                "id": item.id,
                "name": item.name,
                "type": item.type,
                "query_count": item.query_count,
                "user_count": item.user_count,
                "avg_response_time": item.avg_response_time
            })
        
        # Get quality distribution
        quality_distribution = {
            "excellent": len(session.exec(select(CatalogItem).where(CatalogItem.quality_score >= 90)).all()),
            "good": len(session.exec(select(CatalogItem).where(CatalogItem.quality_score >= 75, CatalogItem.quality_score < 90)).all()),
            "fair": len(session.exec(select(CatalogItem).where(CatalogItem.quality_score >= 60, CatalogItem.quality_score < 75)).all()),
            "poor": len(session.exec(select(CatalogItem).where(CatalogItem.quality_score < 60)).all())
        }
        
        # Calculate lineage coverage
        total_items = stats.total_items
        items_with_lineage = len(session.exec(
            select(DataLineage.source_item_id).distinct()
        ).all()) + len(session.exec(
            select(DataLineage.target_item_id).distinct()
        ).all())
        
        lineage_coverage = (items_with_lineage / total_items * 100) if total_items > 0 else 0
        
        # Get recent activity
        recent_activity = []
        recent_usage = session.exec(
            select(CatalogUsageLog)
            .order_by(CatalogUsageLog.accessed_at.desc())
            .limit(20)
        ).all()
        
        for usage in recent_usage:
            item = session.get(CatalogItem, usage.catalog_item_id)
            if item:
                recent_activity.append({
                    "item_id": item.id,
                    "item_name": item.name,
                    "operation": usage.operation_type,
                    "user_id": usage.user_id,
                    "timestamp": usage.accessed_at.isoformat(),
                    "response_time": usage.response_time_ms
                })
        
        return DataCatalogAnalytics(
            total_items=stats.total_items,
            items_by_type=stats.items_by_type,
            items_by_classification=stats.items_by_classification,
            avg_quality_score=stats.avg_quality_score,
            total_queries=stats.total_queries,
            unique_users=stats.unique_users,
            top_accessed_items=top_accessed_items,
            quality_distribution=quality_distribution,
            lineage_coverage=lineage_coverage,
            recent_activity=recent_activity
        )
        
    except Exception as e:
        logger.error(f"Error generating catalog analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Quality Management
@router.get("/items/{item_id}/quality", response_model=QualityAssessment)
async def get_item_quality_assessment(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get quality assessment for a catalog item."""
    try:
        # Verify item exists
        item = session.get(CatalogItem, item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Catalog item with ID {item_id} not found"
            )
        
        # Get quality rules
        quality_rules = session.exec(
            select(CatalogQualityRule).where(CatalogQualityRule.catalog_item_id == item_id)
        ).all()
        
        rules = []
        for rule in quality_rules:
            rules.append({
                "id": rule.id,
                "name": rule.name,
                "type": rule.rule_type,
                "description": rule.description,
                "threshold": rule.threshold,
                "last_score": rule.last_score,
                "is_active": rule.is_active
            })
        
        # Generate quality assessment
        overall_score = item.quality_score or 0.0
        
        issues = []
        if item.null_percentage and item.null_percentage > 10:
            issues.append({
                "type": "completeness",
                "severity": "medium",
                "description": f"High null percentage: {item.null_percentage}%"
            })
        
        if item.quality_score and item.quality_score < 75:
            issues.append({
                "type": "quality",
                "severity": "high",
                "description": f"Low quality score: {item.quality_score}"
            })
        
        recommendations = []
        if item.quality_score and item.quality_score < 80:
            recommendations.append("Implement data quality rules")
            recommendations.append("Review data validation processes")
        
        if not item.owner:
            recommendations.append("Assign data steward")
        
        return QualityAssessment(
            item_id=item_id,
            rules=rules,
            overall_score=overall_score,
            issues=issues,
            recommendations=recommendations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting quality assessment for item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Tag Management
@router.post("/items/{item_id}/tags")
async def add_item_tag(
    item_id: int,
    tag_name: str,
    tag_value: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Add a tag to a catalog item."""
    try:
        success = CatalogService.add_catalog_tag(
            session=session,
            item_id=item_id,
            tag_name=tag_name,
            tag_value=tag_value,
            created_by=current_user.get('user_id', 'unknown')
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to add tag"
            )
        
        logger.info(f"User {current_user.get('user_id')} added tag '{tag_name}' to item {item_id}")
        
        return {
            "message": "Tag added successfully",
            "item_id": item_id,
            "tag_name": tag_name,
            "tag_value": tag_value
        }
        
    except Exception as e:
        logger.error(f"Error adding tag to item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Usage Tracking
@router.post("/items/{item_id}/usage")
async def log_item_usage(
    item_id: int,
    operation_type: str,
    user_id: Optional[str] = None,
    query_text: Optional[str] = None,
    response_time_ms: Optional[int] = None,
    rows_returned: Optional[int] = None,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Log usage of a catalog item."""
    try:
        # Verify item exists
        item = session.get(CatalogItem, item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Catalog item with ID {item_id} not found"
            )
        
        # Create usage log
        usage_log = CatalogUsageLog(
            catalog_item_id=item_id,
            user_id=user_id or current_user.get('user_id'),
            query_text=query_text,
            operation_type=operation_type,
            response_time_ms=response_time_ms,
            rows_returned=rows_returned
        )
        
        session.add(usage_log)
        
        # Update item usage statistics
        item.query_count += 1
        if user_id and user_id not in item.user_count:
            item.user_count += 1
        
        if response_time_ms:
            if item.avg_response_time:
                item.avg_response_time = (item.avg_response_time + response_time_ms) / 2
            else:
                item.avg_response_time = response_time_ms
        
        item.last_accessed = datetime.utcnow()
        
        session.add(item)
        session.commit()
        
        logger.info(f"Logged usage for item {item_id}: {operation_type}")
        
        return {
            "message": "Usage logged successfully",
            "item_id": item_id,
            "operation_type": operation_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging usage for item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )