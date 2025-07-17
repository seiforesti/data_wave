from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.catalog_models import (
    CatalogItem, CatalogTag, DataLineage,
    DataQualityRule, DataQualityResult,
    CatalogItemResponse, CatalogTagResponse, DataLineageResponse,
    CatalogItemCreate, CatalogItemUpdate, CatalogStats,
    DataClassification, CatalogItemType
)
from app.models.scan_models import DataSource
import logging

logger = logging.getLogger(__name__)


class CatalogService:
    """Service layer for data catalog management"""
    
    @staticmethod
    def get_catalog_items_by_data_source(session: Session, data_source_id: int) -> List[CatalogItemResponse]:
        """Get all catalog items for a data source"""
        try:
            statement = select(CatalogItem).where(
                CatalogItem.data_source_id == data_source_id
            ).order_by(CatalogItem.created_at.desc())
            
            items = session.exec(statement).all()
            return [CatalogItemResponse.from_orm(item) for item in items]
        except Exception as e:
            logger.error(f"Error getting catalog items for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_catalog_item_by_id(session: Session, item_id: int) -> Optional[CatalogItemResponse]:
        """Get catalog item by ID"""
        try:
            item = session.get(CatalogItem, item_id)
            if item:
                return CatalogItemResponse.from_orm(item)
            return None
        except Exception as e:
            logger.error(f"Error getting catalog item {item_id}: {str(e)}")
            return None
    
    @staticmethod
    def create_catalog_item(session: Session, item_data: CatalogItemCreate, created_by: str) -> CatalogItemResponse:
        """Create a new catalog item"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, item_data.data_source_id)
            if not data_source:
                raise ValueError(f"Data source {item_data.data_source_id} not found")
            
            # Check if item already exists with same path
            existing = session.exec(
                select(CatalogItem).where(
                    CatalogItem.data_source_id == item_data.data_source_id,
                    CatalogItem.schema_name == item_data.schema_name,
                    CatalogItem.table_name == item_data.table_name
                )
            ).first()
            
            if existing:
                raise ValueError(f"Catalog item already exists for {item_data.schema_name}.{item_data.table_name}")
            
            item = CatalogItem(
                data_source_id=item_data.data_source_id,
                item_type=item_data.item_type,
                schema_name=item_data.schema_name,
                table_name=item_data.table_name,
                column_name=item_data.column_name,
                display_name=item_data.display_name,
                description=item_data.description,
                data_type=item_data.data_type,
                classification=item_data.classification,
                sensitivity_level=item_data.sensitivity_level,
                business_glossary=item_data.business_glossary,
                metadata=item_data.metadata,
                created_by=created_by
            )
            
            session.add(item)
            session.commit()
            session.refresh(item)
            
            logger.info(f"Created catalog item {item.id} by {created_by}")
            return CatalogItemResponse.from_orm(item)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating catalog item: {str(e)}")
            raise
    
    @staticmethod
    def update_catalog_item(session: Session, item_id: int, item_data: CatalogItemUpdate, updated_by: str) -> Optional[CatalogItemResponse]:
        """Update an existing catalog item"""
        try:
            item = session.get(CatalogItem, item_id)
            if not item:
                return None
            
            # Update fields
            if item_data.display_name is not None:
                item.display_name = item_data.display_name
            if item_data.description is not None:
                item.description = item_data.description
            if item_data.data_type is not None:
                item.data_type = item_data.data_type
            if item_data.classification is not None:
                item.classification = item_data.classification
            if item_data.sensitivity_level is not None:
                item.sensitivity_level = item_data.sensitivity_level
            if item_data.business_glossary is not None:
                item.business_glossary = item_data.business_glossary
            if item_data.metadata is not None:
                item.metadata = item_data.metadata
            if item_data.is_active is not None:
                item.is_active = item_data.is_active
            
            item.updated_at = datetime.now()
            
            session.add(item)
            session.commit()
            session.refresh(item)
            
            logger.info(f"Updated catalog item {item_id} by {updated_by}")
            return CatalogItemResponse.from_orm(item)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating catalog item {item_id}: {str(e)}")
            raise
    
    @staticmethod
    def delete_catalog_item(session: Session, item_id: int, deleted_by: str) -> bool:
        """Delete a catalog item"""
        try:
            item = session.get(CatalogItem, item_id)
            if not item:
                return False
            
            # Delete associated tags
            tags = session.exec(
                select(CatalogTag).where(CatalogTag.catalog_item_id == item_id)
            ).all()
            for tag in tags:
                session.delete(tag)
            
            # Delete associated lineage
            lineage_upstream = session.exec(
                select(DataLineage).where(DataLineage.target_item_id == item_id)
            ).all()
            lineage_downstream = session.exec(
                select(DataLineage).where(DataLineage.source_item_id == item_id)
            ).all()
            
            for lineage in lineage_upstream + lineage_downstream:
                session.delete(lineage)
            
            session.delete(item)
            session.commit()
            
            logger.info(f"Deleted catalog item {item_id} by {deleted_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting catalog item {item_id}: {str(e)}")
            return False
    
    @staticmethod
    def search_catalog_items(session: Session, query: str, data_source_id: Optional[int] = None, classification: Optional[DataClassification] = None, limit: int = 50) -> List[CatalogItemResponse]:
        """Search catalog items"""
        try:
            statement = select(CatalogItem).where(
                CatalogItem.is_active == True,
                (CatalogItem.table_name.ilike(f"%{query}%")) |
                (CatalogItem.column_name.ilike(f"%{query}%")) |
                (CatalogItem.display_name.ilike(f"%{query}%")) |
                (CatalogItem.description.ilike(f"%{query}%"))
            )
            
            if data_source_id:
                statement = statement.where(CatalogItem.data_source_id == data_source_id)
            
            if classification:
                statement = statement.where(CatalogItem.classification == classification)
            
            items = session.exec(statement.limit(limit)).all()
            return [CatalogItemResponse.from_orm(item) for item in items]
        except Exception as e:
            logger.error(f"Error searching catalog items: {str(e)}")
            return []
    
    @staticmethod
    def get_catalog_tags(session: Session, item_id: int) -> List[CatalogTagResponse]:
        """Get tags for a catalog item"""
        try:
            statement = select(CatalogTag).where(CatalogTag.catalog_item_id == item_id)
            tags = session.exec(statement).all()
            return [CatalogTagResponse.from_orm(tag) for tag in tags]
        except Exception as e:
            logger.error(f"Error getting catalog tags for item {item_id}: {str(e)}")
            return []
    
    @staticmethod
    def add_catalog_tag(session: Session, item_id: int, tag_name: str, tag_value: Optional[str], created_by: str) -> bool:
        """Add a tag to a catalog item"""
        try:
            # Verify item exists
            item = session.get(CatalogItem, item_id)
            if not item:
                return False
            
            # Check if tag already exists
            existing = session.exec(
                select(CatalogTag).where(
                    CatalogTag.catalog_item_id == item_id,
                    CatalogTag.tag_name == tag_name
                )
            ).first()
            
            if existing:
                # Update existing tag
                existing.tag_value = tag_value
                existing.updated_at = datetime.now()
                session.add(existing)
            else:
                # Create new tag
                tag = CatalogTag(
                    catalog_item_id=item_id,
                    tag_name=tag_name,
                    tag_value=tag_value,
                    created_by=created_by
                )
                session.add(tag)
            
            session.commit()
            
            logger.info(f"Added tag {tag_name} to catalog item {item_id} by {created_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error adding catalog tag: {str(e)}")
            return False
    
    @staticmethod
    def get_data_lineage(session: Session, item_id: int) -> Dict[str, Any]:
        """Get data lineage for a catalog item"""
        try:
            # Get upstream dependencies (sources)
            upstream_query = select(DataLineage).where(DataLineage.target_item_id == item_id)
            upstream = session.exec(upstream_query).all()
            
            # Get downstream dependencies (targets)
            downstream_query = select(DataLineage).where(DataLineage.source_item_id == item_id)
            downstream = session.exec(downstream_query).all()
            
            # Build lineage graph
            upstream_items = []
            for lineage in upstream:
                source_item = session.get(CatalogItem, lineage.source_item_id)
                if source_item:
                    upstream_items.append({
                        "item": CatalogItemResponse.from_orm(source_item),
                        "lineage": DataLineageResponse.from_orm(lineage)
                    })
            
            downstream_items = []
            for lineage in downstream:
                target_item = session.get(CatalogItem, lineage.target_item_id)
                if target_item:
                    downstream_items.append({
                        "item": CatalogItemResponse.from_orm(target_item),
                        "lineage": DataLineageResponse.from_orm(lineage)
                    })
            
            return {
                "item_id": item_id,
                "upstream": upstream_items,
                "downstream": downstream_items,
                "total_upstream": len(upstream_items),
                "total_downstream": len(downstream_items)
            }
            
        except Exception as e:
            logger.error(f"Error getting data lineage for item {item_id}: {str(e)}")
            return {
                "item_id": item_id,
                "upstream": [],
                "downstream": [],
                "total_upstream": 0,
                "total_downstream": 0
            }
    
    @staticmethod
    def create_lineage(session: Session, source_item_id: int, target_item_id: int, transformation_logic: Optional[str], created_by: str) -> bool:
        """Create a data lineage relationship"""
        try:
            # Verify both items exist
            source_item = session.get(CatalogItem, source_item_id)
            target_item = session.get(CatalogItem, target_item_id)
            
            if not source_item or not target_item:
                return False
            
            # Check if lineage already exists
            existing = session.exec(
                select(DataLineage).where(
                    DataLineage.source_item_id == source_item_id,
                    DataLineage.target_item_id == target_item_id
                )
            ).first()
            
            if existing:
                return False
            
            lineage = DataLineage(
                source_item_id=source_item_id,
                target_item_id=target_item_id,
                transformation_logic=transformation_logic,
                created_by=created_by
            )
            
            session.add(lineage)
            session.commit()
            
            logger.info(f"Created lineage from {source_item_id} to {target_item_id} by {created_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating lineage: {str(e)}")
            return False
    
    @staticmethod
    def get_catalog_stats(session: Session, data_source_id: Optional[int] = None) -> CatalogStats:
        """Get catalog statistics"""
        try:
            # Base query
            query = select(CatalogItem)
            if data_source_id:
                query = query.where(CatalogItem.data_source_id == data_source_id)
            
            items = session.exec(query).all()
            
            total_items = len(items)
            active_items = len([i for i in items if i.is_active])
            
            # Count by type
            type_counts = {}
            for item in items:
                type_counts[item.item_type] = type_counts.get(item.item_type, 0) + 1
            
            # Count by classification
            classified_items = len([i for i in items if i.classification])
            public_items = len([i for i in items if i.classification == DataClassification.PUBLIC])
            confidential_items = len([i for i in items if i.classification == DataClassification.CONFIDENTIAL])
            restricted_items = len([i for i in items if i.classification == DataClassification.RESTRICTED])
            
            # Get tag count
            tag_count = len(session.exec(select(CatalogTag)).all())
            
            # Get lineage count
            lineage_count = len(session.exec(select(DataLineage)).all())
            
            # Get recent items
            recent_items = session.exec(
                select(CatalogItem).order_by(CatalogItem.created_at.desc()).limit(5)
            ).all()
            
            return CatalogStats(
                total_items=total_items,
                active_items=active_items,
                tables=type_counts.get(CatalogItemType.TABLE, 0),
                columns=type_counts.get(CatalogItemType.COLUMN, 0),
                views=type_counts.get(CatalogItemType.VIEW, 0),
                classified_items=classified_items,
                public_items=public_items,
                confidential_items=confidential_items,
                restricted_items=restricted_items,
                total_tags=tag_count,
                total_lineage=lineage_count,
                data_quality_rules=0,  # TODO: Implement when data quality is added
                recent_items=[CatalogItemResponse.from_orm(item) for item in recent_items]
            )
            
        except Exception as e:
            logger.error(f"Error getting catalog stats: {str(e)}")
            return CatalogStats(
                total_items=0,
                active_items=0,
                tables=0,
                columns=0,
                views=0,
                classified_items=0,
                public_items=0,
                confidential_items=0,
                restricted_items=0,
                total_tags=0,
                total_lineage=0,
                data_quality_rules=0,
                recent_items=[]
            )
    
    @staticmethod
    def discover_schema(session: Session, data_source_id: int, discovered_by: str) -> int:
        """Discover and catalog schema from a data source"""
        try:
            # This would integrate with actual schema discovery logic
            # For now, we'll create some mock schema items
            
            data_source = session.get(DataSource, data_source_id)
            if not data_source:
                return 0
            
            discovered_count = 0
            
            # Mock discovery of common tables
            mock_tables = [
                ("public", "users", "User management table"),
                ("public", "orders", "Customer orders"),
                ("public", "products", "Product catalog"),
                ("analytics", "user_events", "User activity tracking"),
                ("analytics", "metrics", "Business metrics")
            ]
            
            for schema, table, description in mock_tables:
                existing = session.exec(
                    select(CatalogItem).where(
                        CatalogItem.data_source_id == data_source_id,
                        CatalogItem.schema_name == schema,
                        CatalogItem.table_name == table
                    )
                ).first()
                
                if not existing:
                    item = CatalogItem(
                        data_source_id=data_source_id,
                        item_type=CatalogItemType.TABLE,
                        schema_name=schema,
                        table_name=table,
                        description=description,
                        classification=DataClassification.INTERNAL,
                        created_by=discovered_by
                    )
                    session.add(item)
                    discovered_count += 1
            
            session.commit()
            
            logger.info(f"Discovered {discovered_count} schema items for data source {data_source_id}")
            return discovered_count
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error discovering schema: {str(e)}")
            return 0