"""
Advanced Data Source Connection Service
Handles real connections to various data source types with discovery capabilities
Similar to Microsoft Purview's data source connection and discovery features
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Union, cast, Sequence, TypeVar, Iterable, TYPE_CHECKING
from datetime import datetime
import traceback
import os

# Database connectors
import psycopg2
import pymongo
try:
    import mysql.connector
except ImportError:
    mysql = None
import redis
try:
    import snowflake.connector
except ImportError:
    snowflake = None
try:
    import boto3
except ImportError:
    boto3 = None
from sqlalchemy import create_engine, MetaData, inspect, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.engine import Row, RowMapping, CursorResult
from sqlalchemy.sql.expression import Select

# Internal imports
from sqlmodel import Session, select, func, text, Column, JSON, String
from app.models.scan_models import DataSource, DataSourceType, DataSourceLocation, CloudProvider
from app.core.config import settings
from app.services.data_source_service import DataSourceService
import aioredis

# Type variables for better type hints
T = TypeVar('T')
RowDict = Dict[str, Any]
TablePreviewResult = List[Dict[str, Union[List[str], List[RowDict], int]]]
ColumnProfileResult = Dict[str, Any]
MongoDocument = Dict[str, Any]

# Setup logging
logger = logging.getLogger(__name__)

def safe_cast(value: Any, target_type: type[T], default: T) -> T:
    """Safely cast a value to a target type."""
    try:
        return target_type(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def ensure_list(value: Union[List[T], T, None]) -> List[T]:
    """Ensure a value is a list."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]

def dict_to_list(d: Dict[str, Any]) -> List[RowDict]:
    """Convert a dictionary to a list of row dictionaries."""
    if not d:
        return []
    return [{"key": k, "value": v} for k, v in d.items()]

def row_to_dict(row: Union[Row, RowMapping, None]) -> Dict[str, Any]:
    """Convert a SQLAlchemy Row or RowMapping to a dictionary."""
    if row is None:
        return {}
    if isinstance(row, (Row, RowMapping)):
        return dict(row)
    return {}

class BaseConnector:
    """Base class for all data source connectors"""
    
    def __init__(self, data_source: 'DataSource'):
        self.data_source = data_source
        self.connection = None
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test connection - to be implemented by subclasses"""
        raise NotImplementedError
    
    async def discover_schema(self) -> Dict[str, Any]:
        """Discover schema structure - to be implemented by subclasses"""
        raise NotImplementedError
    
    async def get_table_preview(self, schema_name: str, table_name: str, limit: int = 100) -> TablePreviewResult:
        """Get table preview - to be implemented by subclasses"""
        raise NotImplementedError
    
    async def get_column_profile(self, schema_name: str, table_name: str, column_name: str) -> ColumnProfileResult:
        """Get column profile - to be implemented by subclasses"""
        raise NotImplementedError
    
    def _build_connection_string(self) -> str:
        """Build connection string - to be implemented by subclasses"""
        raise NotImplementedError

    def _get_password(self) -> Optional[str]:
        """Get decrypted password from DataSourceService"""
        from app.services.data_source_service import DataSourceService
        return DataSourceService.get_data_source_password(self.data_source)

class LocationAwareConnector:
    """Base class for location-aware connectors that handle ON_PREM, CLOUD, and HYBRID deployments"""
    
    def __init__(self, data_source: DataSource):
        self.data_source = data_source
        self.location = data_source.location
        self.connection = None
        self.failover_connection = None
        self.is_primary = True
        
    async def initialize(self):
        """Initialize connections based on location type"""
        if self.location == DataSourceLocation.HYBRID:
            # For hybrid setup, initialize both primary and secondary connections
            try:
                self.connection = await self._initialize_primary()
                self.failover_connection = await self._initialize_secondary()
            except Exception as e:
                logger.error(f"Hybrid initialization error: {str(e)}")
                raise
        else:
            # For ON_PREM or CLOUD, initialize single connection
            self.connection = await self._initialize_connection()
    
    async def _initialize_primary(self):
        """Initialize primary connection for hybrid setup"""
        raise NotImplementedError
    
    async def _initialize_secondary(self):
        """Initialize secondary connection for hybrid setup"""
        raise NotImplementedError
    
    async def _initialize_connection(self):
        """Initialize single connection for ON_PREM or CLOUD"""
        raise NotImplementedError
    
    async def failover(self):
        """Switch to failover connection in hybrid setup"""
        if self.location != DataSourceLocation.HYBRID:
            raise ValueError("Failover only supported in HYBRID mode")
        
        if not self.failover_connection:
            raise ValueError("No failover connection available")
        
        # Swap connections
        self.connection, self.failover_connection = self.failover_connection, self.connection
        self.is_primary = not self.is_primary
        logger.info(f"Failover executed. Now using {'primary' if self.is_primary else 'secondary'} connection")
    
    def _get_cloud_credentials(self) -> Dict[str, Any]:
        """Get cloud-specific credentials and configuration"""
        if not self.data_source.connection_properties:
            return {}
            
        cloud_config = self.data_source.connection_properties.get('cloud_config', {})
        if not cloud_config:
            return {}
            
        if self.data_source.source_type == DataSourceType.POSTGRESQL:
            return {
                'azure_tenant_id': cloud_config.get('azure_tenant_id'),
                'azure_client_id': cloud_config.get('azure_client_id'),
                'azure_client_secret': cloud_config.get('azure_client_secret'),
                'managed_identity': cloud_config.get('use_managed_identity', False)
            }
        elif self.data_source.source_type == DataSourceType.MYSQL:
            return {
                'aws_access_key_id': cloud_config.get('aws_access_key_id'),
                'aws_secret_access_key': cloud_config.get('aws_secret_access_key'),
                'aws_region': cloud_config.get('aws_region'),
                'iam_auth': cloud_config.get('use_iam_auth', False)
            }
        return {}
    
    def _get_connection_args(self) -> Dict[str, Any]:
        """Get connection arguments based on location type"""
        base_args = {
            'connect_timeout': 30,
            'keepalives': 1,
            'keepalives_idle': 30,
            'keepalives_interval': 10,
            'keepalives_count': 5
        }
        
        if self.location == DataSourceLocation.CLOUD:
            # Add cloud-specific connection args
            if self.data_source.connection_properties:
                cloud_args = {
                    'ssl': True,
                    'ssl_ca': self.data_source.connection_properties.get('ssl_ca'),
                    'ssl_cert': self.data_source.connection_properties.get('ssl_cert'),
                    'ssl_key': self.data_source.connection_properties.get('ssl_key'),
                }
                base_args.update(cloud_args)
            
        elif self.location == DataSourceLocation.HYBRID:
            # Add hybrid-specific connection args
            hybrid_args = {
                'application_name': f"hybrid_{'primary' if self.is_primary else 'secondary'}",
                'fallback_application_name': self.data_source.name,
                'tcp_keepalives': 1
            }
            base_args.update(hybrid_args)
            
        return base_args

class PostgreSQLConnector(BaseConnector):
    """PostgreSQL connector with advanced discovery capabilities"""
    
    async def test_connection(self) -> Dict[str, Any]:
        try:
            password = self._get_password()
            if not password:
                return {
                    "success": False,
                    "message": "Failed to retrieve password",
                    "details": {"error": "Password retrieval failed"},
                    "recommendations": ["Check secret manager configuration"]
                }

            connection_string = self._build_connection_string()
            engine = create_engine(connection_string, connect_args={"connect_timeout": 10})
            
            with engine.connect() as conn:
                result = conn.execute(text("SELECT version(), current_database(), current_user"))
                row = result.fetchone()
                
                # Get additional stats
                stats = conn.execute(text("""
                    SELECT 
                        numbackends as active_connections,
                        xact_commit + xact_rollback as total_transactions,
                        blks_hit::float / nullif(blks_hit + blks_read, 0) * 100 as cache_hit_ratio
                    FROM pg_stat_database 
                    WHERE datname = current_database()
                """)).mappings().first()
                
                return {
                    "success": True,
                    "message": "Connection successful",
                    "details": {
                        "version": row[0] if row else "unknown",
                        "database": row[1] if row else "unknown",
                        "user": row[2] if row else "unknown",
                        "host_reachable": True,
                        "port_open": True,
                        "authentication": True,
                        "stats": row_to_dict(stats) if stats else {}
                    }
                }
                
        except Exception as e:
            return {
                "success": False,
                "message": f"PostgreSQL connection failed: {str(e)}",
                "details": {"error": str(e)}
            }
    
    async def discover_schema(self) -> Dict[str, Any]:
        try:
            password = self._get_password()
            if not password:
                return {"success": False, "error": "Failed to retrieve password"}

            connection_string = self._build_connection_string()
            engine = create_engine(connection_string)
            inspector = inspect(engine)
            
            databases = []
            current_db = {
                "name": self.data_source.database_name or "default",
                "schemas": []
            }
            
            # Get all schemas
            schema_names = inspector.get_schema_names()
            
            for schema_name in schema_names:
                if schema_name in ('pg_catalog', 'information_schema'):
                    continue
                
                schema_info = {
                    "name": schema_name,
                    "tables": [],
                    "views": []
                }
                
                # Get tables in schema
                table_names = inspector.get_table_names(schema=schema_name)
                for table_name in table_names:
                    table_info = await self._get_table_info(inspector, schema_name, table_name, engine)
                    schema_info["tables"].append(table_info)
                
                # Get views in schema
                view_names = inspector.get_view_names(schema=schema_name)
                for view_name in view_names:
                    view_info = await self._get_view_info(inspector, schema_name, view_name)
                    schema_info["views"].append(view_info)
                
                current_db["schemas"].append(schema_info)
            
            databases.append(current_db)
            
            return {"databases": databases}
            
        except Exception as e:
            logger.error(f"PostgreSQL schema discovery failed: {str(e)}")
            raise
    
    async def _get_table_info(self, inspector, schema_name: str, table_name: str, engine) -> Dict[str, Any]:
        """Get detailed table information"""
        columns = []
        for column in inspector.get_columns(table_name, schema=schema_name):
            columns.append({
                "name": column["name"],
                "data_type": str(column["type"]),
                "nullable": column.get("nullable", True),
                "default": str(column.get("default", "")),
                "primary_key": column.get("primary_key", False)
            })
        
        # Get indexes
        indexes = inspector.get_indexes(table_name, schema=schema_name)
        
        # Get foreign keys
        foreign_keys = inspector.get_foreign_keys(table_name, schema=schema_name)
        
        # Get additional table metadata
        with engine.connect() as conn:
            row_count = conn.execute(text(f"""
                SELECT reltuples::bigint AS estimate
                FROM pg_class
                WHERE relname = '{table_name}'
            """)).scalar()
            
            size_bytes = conn.execute(text(f"""
                SELECT pg_total_relation_size('{schema_name}.{table_name}')
            """)).scalar()
        
        return {
            "name": table_name,
            "type": "table",
            "columns": columns,
            "indexes": indexes,
            "foreign_keys": foreign_keys,
            "row_count_estimate": row_count,
            "size_bytes": size_bytes,
            "has_primary_key": bool(inspector.get_pk_constraint(table_name, schema=schema_name)["constrained_columns"])
        }
    
    async def _get_view_info(self, inspector, schema_name: str, view_name: str) -> Dict[str, Any]:
        """Get detailed view information"""
        columns = []
        for column in inspector.get_columns(view_name, schema=schema_name):
            columns.append({
                "name": column["name"],
                "data_type": str(column["type"]),
                "nullable": column.get("nullable", True)
            })
        
        return {
            "name": view_name,
            "type": "view",
            "columns": columns
        }
        
    async def _get_row_count(self, schema_name: str, table_name: str) -> int:
        """Get approximate row count for table"""
        try:
            connection_string = self._build_connection_string()
            engine = create_engine(connection_string)
            
            with engine.connect() as conn:
                query = text(f"SELECT reltuples::bigint FROM pg_class WHERE relname = :table_name")
                result = conn.execute(query, {"table_name": table_name})
                row = result.fetchone()
                return int(row[0]) if row and row[0] else 0
                
        except Exception:
            return 0
    
    async def get_table_preview(self, schema_name: str, table_name: str, limit: int = 100) -> TablePreviewResult:
        """Get preview of table data"""
        try:
            connection_string = self._build_connection_string()
            engine = create_engine(connection_string)
            
            with engine.connect() as conn:
                query = text(f'SELECT * FROM "{schema_name}"."{table_name}" LIMIT :limit')
                result = conn.execute(query, {"limit": limit})
                
                columns = [str(col) for col in result.keys()]
                rows: List[RowDict] = []
                
                for row in result:
                    row_dict: RowDict = {}
                    for i, value in enumerate(row):
                        # Convert datetime and other non-serializable types
                        if isinstance(value, datetime):
                            row_dict[columns[i]] = value.isoformat()
                        else:
                            row_dict[columns[i]] = str(value) if value is not None else None
                    rows.append(row_dict)

              # Ensure the return type matches List[Dict] for rows, and columns is a List[str]
                return [{
                    "columns": columns,
                    "rows": rows,
                    "total_rows": len(rows)
                }]

        except Exception as e:
            logger.error(f"Table preview failed: {str(e)}")
            raise
    
    async def get_column_profile(self, schema_name: str, table_name: str, column_name: str) -> ColumnProfileResult:
        """Get detailed column profile and statistics"""
        try:
            connection_string = self._build_connection_string()
            engine = create_engine(connection_string)
            
            with engine.connect() as conn:
                # Get basic statistics
                stats_query = text(f"""
                    SELECT 
                        COUNT(*) as total_rows,
                        COUNT(DISTINCT "{column_name}") as unique_values,
                        COUNT(CASE WHEN "{column_name}" IS NULL THEN 1 END) as null_count,
                        MIN("{column_name}") as min_value,
                        MAX("{column_name}") as max_value
                    FROM "{schema_name}"."{table_name}"
                """)
                stats_result = conn.execute(stats_query).mappings().first()
                stats = row_to_dict(stats_result)
                
                # Get value distribution (top 10 most common values)
                dist_query = text(f"""
                    SELECT "{column_name}" as value, COUNT(*) as count
                    FROM "{schema_name}"."{table_name}"
                    WHERE "{column_name}" IS NOT NULL
                    GROUP BY "{column_name}"
                    ORDER BY count DESC
                    LIMIT 10
                """)
                distribution = [row_to_dict(row) for row in conn.execute(dist_query).mappings()]
                
                return {
                    "statistics": stats,
                    "value_distribution": distribution,
                    "profile_date": datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Column profiling failed: {str(e)}")
            raise
    
    def _build_connection_string(self) -> str:
        """Build PostgreSQL connection string"""
        password = self._get_password()
        if not password:
            raise ValueError("Failed to retrieve password")
            
        return (f"postgresql://{self.data_source.username}:{password}@"
                f"{self.data_source.host}:{self.data_source.port}/{self.data_source.database_name or 'postgres'}")

class MySQLConnector(BaseConnector):
    """MySQL connector with discovery capabilities"""
    
    async def test_connection(self) -> Dict[str, Any]:
        try:
            password = self._get_password()
            if not password:
                return {
                    "success": False,
                    "message": "Failed to retrieve password",
                    "recommendations": ["Check secret manager configuration"]
                }

            connection_string = self._build_connection_string()
            engine = create_engine(connection_string)
            
            start = datetime.now()
            with engine.connect() as conn:
                # Basic connectivity test
                conn.execute(text("SELECT 1"))
                
                # Get version info
                version = conn.execute(text("SELECT VERSION()")).scalar()
                
                # Get basic stats
                stats = conn.execute(text("""
                    SHOW GLOBAL STATUS WHERE Variable_name IN 
                    ('Threads_connected', 'Uptime', 'Questions')
                """)).mappings().all()
                stats_dict = {row["Variable_name"]: row["Value"] for row in stats}
            
            end = datetime.now()
            latency = int((end - start).total_seconds() * 1000)
            
            recommendations = []
            if latency > 1000:
                recommendations.append("High latency detected. Consider connection pooling or network optimization.")
            
            return {
                "success": True,
                "message": "Connection successful",
                "connection_time_ms": latency,
                "details": {
                    "version": version,
                    "stats": stats_dict
                },
                "recommendations": recommendations
            }
            
        except Exception as e:
            logger.error(f"MySQL connection test failed: {str(e)}")
            return {
                "success": False,
                "message": str(e),
                "recommendations": [
                    "Check network connectivity",
                    "Verify credentials",
                    "Ensure MySQL is running",
                    "Check firewall rules"
                ]
            }
    
    async def discover_schema(self) -> Dict[str, Any]:
        try:
            password = self._get_password()
            if not password:
                return {"success": False, "error": "Failed to retrieve password"}

            connection_string = self._build_connection_string()
            engine = create_engine(connection_string)
            
            inspector = inspect(engine)
            schemas = []
            
            for schema_name in inspector.get_schema_names():
                if schema_name in ('information_schema', 'performance_schema', 'mysql'):
                    continue
                
                tables = []
                for table_name in inspector.get_table_names(schema=schema_name):
                    columns = []
                    for column in inspector.get_columns(table_name, schema=schema_name):
                        columns.append({
                            "name": column["name"],
                            "type": str(column["type"]),
                            "nullable": column.get("nullable", True),
                            "default": str(column.get("default", ""))
                        })
                    
                    # Get additional table metadata
                    with engine.connect() as conn:
                        result = conn.execute(text(f"""
                            SELECT 
                                table_rows as row_count,
                                data_length + index_length as total_bytes
                            FROM information_schema.tables 
                            WHERE table_schema = '{schema_name}'
                            AND table_name = '{table_name}'
                        """)).mappings().first()
                    
                    tables.append({
                        "name": table_name,
                        "columns": columns,
                        "row_count_estimate": result["row_count"] if result else None,
                        "size_bytes": result["total_bytes"] if result else None,
                        "has_primary_key": bool(inspector.get_pk_constraint(table_name, schema=schema_name)["constrained_columns"])
                    })
                
                schemas.append({
                    "name": schema_name,
                    "tables": tables
                })
            
            return {
                "success": True,
                "schema": schemas,
                "summary": {
                    "total_schemas": len(schemas),
                    "total_tables": sum(len(s["tables"]) for s in schemas),
                    "total_columns": sum(sum(len(t["columns"]) for t in s["tables"]) for s in schemas)
                }
            }
            
        except Exception as e:
            logger.error(f"MySQL schema discovery failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_table_preview(self, schema_name: str, table_name: str, limit: int = 100) -> TablePreviewResult:
        """Get preview of table data"""
        try:
            connection_string = self._build_connection_string()
            engine = create_engine(connection_string)
            
            with engine.connect() as conn:
                query = text(f'SELECT * FROM `{schema_name}`.`{table_name}` LIMIT :limit')
                result = conn.execute(query, {"limit": limit})
                
                columns = [str(col) for col in result.keys()]
                rows: List[RowDict] = []
                
                for row in result:
                    row_dict: RowDict = {}
                    for i, value in enumerate(row):
                        # Convert datetime and other non-serializable types
                        if isinstance(value, datetime):
                            row_dict[columns[i]] = value.isoformat()
                        else:
                            row_dict[columns[i]] = str(value) if value is not None else None
                    rows.append(row_dict)
                
                return [{
                    "columns": columns,
                    "rows": rows,
                    "total_rows": len(rows)
                }]
                
        except Exception as e:
            logger.error(f"Table preview failed: {str(e)}")
            raise
    
    async def get_column_profile(self, schema_name: str, table_name: str, column_name: str) -> ColumnProfileResult:
        """Get detailed column profile and statistics"""
        try:
            connection_string = self._build_connection_string()
            engine = create_engine(connection_string)
            
            with engine.connect() as conn:
                # Get basic statistics
                stats = conn.execute(text(f"""
                    SELECT 
                        COUNT(*) as total_rows,
                        COUNT(DISTINCT `{column_name}`) as unique_values,
                        COUNT(CASE WHEN `{column_name}` IS NULL THEN 1 END) as null_count,
                        MIN(`{column_name}`) as min_value,
                        MAX(`{column_name}`) as max_value
                    FROM `{schema_name}`.`{table_name}`
                """)).mappings().first()
                
                # Get value distribution (top 10 most common values)
                distribution = conn.execute(text(f"""
                    SELECT `{column_name}` as value, COUNT(*) as count
                    FROM `{schema_name}`.`{table_name}`
                    WHERE `{column_name}` IS NOT NULL
                    GROUP BY `{column_name}`
                    ORDER BY count DESC
                    LIMIT 10
                """)).mappings().all()
                
                return {
                    "statistics": row_to_dict(stats),
                    "value_distribution": [row_to_dict(row) for row in distribution],
                    "profile_date": datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Column profiling failed: {str(e)}")
            raise
    
    def _build_connection_string(self) -> str:
        """Build MySQL connection string"""
        password = self._get_password()
        if not password:
            raise ValueError("Failed to retrieve password")
            
        return (f"mysql+pymysql://{self.data_source.username}:{password}@"
                f"{self.data_source.host}:{self.data_source.port}/{self.data_source.database_name or ''}")

class MongoDBConnector(BaseConnector):
    """MongoDB connector with discovery capabilities"""
    
    async def test_connection(self) -> Dict[str, Any]:
        try:
            password = self._get_password()
            if not password:
                return {
                    "success": False,
                    "message": "Failed to retrieve password",
                    "recommendations": ["Check secret manager configuration"]
                }

            connection_string = self._build_connection_string()
            client = pymongo.MongoClient(connection_string)
            
            # Test connection by pinging the server
            client.admin.command('ping')
            
            return {
                "success": True,
                "message": "Connection successful",
                "details": {
                    "server_info": client.server_info()
                }
            }
            
        except Exception as e:
            logger.error(f"MongoDB connection test failed: {str(e)}")
            return {
                "success": False,
                "message": str(e),
                "recommendations": [
                    "Check network connectivity",
                    "Verify MongoDB server is running",
                    "Check firewall rules",
                    "Verify credentials"
                ]
            }
    
    async def discover_schema(self) -> Dict[str, Any]:
        try:
            password = self._get_password()
            if not password:
                return {"success": False, "error": "Failed to retrieve password"}

            connection_string = self._build_connection_string()
            client = pymongo.MongoClient(connection_string)
            
            # Get database names
            db_names = client.list_database_names()
            
            databases = []
            for db_name in db_names:
                if db_name in ('admin', 'local', 'config'):
                    continue
                
                db_info = {
                    "name": db_name,
                    "collections": []
                }
                
                # Get collection names for each database
                collection_names = client[db_name].list_collection_names()
                
                for collection_name in collection_names:
                    # Get collection metadata
                    collection_info = {
                        "name": collection_name,
                        "type": "collection",
                        "size_bytes": 0,
                        "row_count_estimate": 0,
                        "has_primary_key": False
                    }
                    
                    # Attempt to get size and row count if possible
                    try:
                        collection_info["size_bytes"] = client[db_name][collection_name].estimated_data_size()
                        collection_info["row_count_estimate"] = client[db_name][collection_name].count_documents({})
                    except Exception as e:
                        logger.warning(f"Could not get size/row count for collection {collection_name}: {e}")
                    
                    # Attempt to get primary key if available
                    try:
                        pk_info = client[db_name][collection_name].find_one({}, {"_id": 1})
                        if pk_info and "_id" in pk_info:
                            collection_info["has_primary_key"] = True
                    except Exception as e:
                        logger.warning(f"Could not get primary key for collection {collection_name}: {e}")
                    
                    db_info["collections"].append(collection_info)
                
                databases.append(db_info)
            
            return {
                "success": True,
                "schema": databases,
                "summary": {
                    "total_databases": len(databases),
                    "total_collections": sum(len(db.get("collections", [])) for db in databases)
                }
            }
            
        except Exception as e:
            logger.error(f"MongoDB schema discovery failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_table_preview(self, schema_name: str, table_name: str, limit: int = 100) -> TablePreviewResult:
        """Get preview of MongoDB collection data"""
        client = None
        try:
            password = self._get_password()
            if not password:
                raise ValueError("Failed to retrieve password")

            client = pymongo.MongoClient(
                host=self.data_source.host,
                port=self.data_source.port,
                username=self.data_source.username,
                password=password
            )
            collection = client[schema_name][table_name]
            
            # Get documents
            cursor = collection.find({}, {"_id": 0}).limit(limit)
            documents: List[MongoDocument] = list(cursor)
            
            # Get columns from first document
            columns = list(documents[0].keys()) if documents else []
            
            preview_result: TablePreviewResult = [{
                "columns": columns,
                "rows": cast(List[RowDict], documents),
                "total_rows": len(documents)
            }]
            
            return preview_result
            
        except Exception as e:
            logger.error(f"MongoDB preview failed: {str(e)}")
            raise
        finally:
            if client:
                client.close()
    
    async def get_column_profile(self, schema_name: str, table_name: str, column_name: str) -> ColumnProfileResult:
        """Get detailed column profile and statistics"""
        client = None
        try:
            password = self._get_password()
            if not password:
                raise ValueError("Failed to retrieve password")

            client = pymongo.MongoClient(
                host=self.data_source.host,
                port=self.data_source.port,
                username=self.data_source.username,
                password=password
            )
            collection = client[schema_name][table_name]
            
            # Get basic statistics
            pipeline = [
                {
                    "$group": {
                        "_id": None,
                        "total_rows": {"$sum": 1},
                        "null_count": {"$sum": {"$cond": [{"$eq": [f"${column_name}", None]}, 1, 0]}},
                        "unique_values": {"$addToSet": f"${column_name}"},
                        "min_value": {"$min": f"${column_name}"},
                        "max_value": {"$max": f"${column_name}"}
                    }
                }
            ]
            
            stats_result = list(collection.aggregate(pipeline))
            stats = stats_result[0] if stats_result else {}
            
            # Get value distribution
            distribution_pipeline = [
                {"$group": {"_id": f"${column_name}", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            
            distribution = list(collection.aggregate(distribution_pipeline))
            
            profile_result: ColumnProfileResult = {
                "statistics": {
                    "total_rows": stats.get("total_rows", 0),
                    "null_count": stats.get("null_count", 0),
                    "unique_values": len(stats.get("unique_values", [])),
                    "min_value": stats.get("min_value"),
                    "max_value": stats.get("max_value")
                },
                "value_distribution": [
                    {"value": d["_id"], "count": d["count"]}
                    for d in distribution
                ],
                "profile_date": datetime.now().isoformat()
            }
            
            return profile_result
            
        except Exception as e:
            logger.error(f"MongoDB profiling failed: {str(e)}")
            raise
        finally:
            if client:
                client.close()
    
    def _build_connection_string(self) -> str:
        """Build MongoDB connection string"""
        password = self._get_password()
        if not password:
            raise ValueError("Failed to retrieve password")
            
        return (f"mongodb://{self.data_source.username}:{password}@"
                f"{self.data_source.host}:{self.data_source.port}/{self.data_source.database_name or ''}")

class SnowflakeConnector(BaseConnector):
    """Snowflake connector with discovery capabilities"""
    
    async def test_connection(self) -> Dict[str, Any]:
        try:
            password = self._get_password()
            if not password:
                return {
                    "success": False,
                    "message": "Failed to retrieve password",
                    "recommendations": ["Check secret manager configuration"]
                }

            connection_string = self._build_connection_string()
            conn = snowflake.connector.connect(
                user=self.data_source.username,
                password=password,
                account=self.data_source.host,
                warehouse=self.data_source.database_name,
                database=self.data_source.database_name,
                role=self.data_source.username,
                application="data_source_discovery"
            )
            
            # Test connection by executing a simple query
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                if result == (1,):
                    return {
                        "success": True,
                        "message": "Connection successful",
                        "details": {
                            "version": conn.get_server_version()
                        }
                    }
                else:
                    return {
                        "success": False,
                        "message": "Connection failed to execute query",
                        "details": {"error": "Could not execute query"}
                    }
            
        except Exception as e:
            logger.error(f"Snowflake connection test failed: {str(e)}")
            return {
                "success": False,
                "message": str(e),
                "recommendations": [
                    "Check network connectivity",
                    "Verify Snowflake account credentials",
                    "Check firewall rules",
                    "Ensure Snowflake service is running"
                ]
            }
    
    async def discover_schema(self) -> Dict[str, Any]:
        try:
            password = self._get_password()
            if not password:
                return {"success": False, "error": "Failed to retrieve password"}

            connection_string = self._build_connection_string()
            conn = snowflake.connector.connect(
                user=self.data_source.username,
                password=password,
                account=self.data_source.host,
                warehouse=self.data_source.database_name,
                database=self.data_source.database_name,
                role=self.data_source.username,
                application="data_source_discovery"
            )
            
            with conn.cursor() as cursor:
                # Get database names
                cursor.execute("SHOW DATABASES")
                databases = [row[0] for row in cursor.fetchall()]
                
                schema_info = []
                for db_name in databases:
                    if db_name in ('INFORMATION_SCHEMA', 'SNOWFLAKE', 'SYSTEM'):
                        continue
                    
                    with conn.cursor() as inner_cursor:
                        # Get schema names within the database
                        inner_cursor.execute(f"SHOW SCHEMAS IN {db_name}")
                        schema_names = [row[0] for row in inner_cursor.fetchall()]
                        
                        for schema_name in schema_names:
                            if schema_name in ('INFORMATION_SCHEMA', 'SNOWFLAKE', 'SYSTEM'):
                                continue
                            
                            tables = []
                            with conn.cursor() as table_cursor:
                                # Get table names within the schema
                                table_cursor.execute(f"SHOW TABLES IN {db_name}.{schema_name}")
                                table_names = [row[0] for row in table_cursor.fetchall()]
                                
                                for table_name in table_names:
                                    columns = []
                                    with conn.cursor() as column_cursor:
                                        # Get column names and types
                                        column_cursor.execute(f"DESCRIBE {db_name}.{schema_name}.{table_name}")
                                        for row in column_cursor.fetchall():
                                            columns.append({
                                                "name": row[0],
                                                "type": row[1],
                                                "nullable": row[2] == 'YES',
                                                "default": row[3] if row[3] else None
                                            })
                                    
                                    # Get additional table metadata
                                    with conn.cursor() as metadata_cursor:
                                        metadata_cursor.execute(f"""
                                            SELECT 
                                                table_rows as row_count,
                                                total_bytes as size_bytes
                                            FROM snowflake.account_usage.table_storage_usage
                                            WHERE database_name = '{db_name}'
                                            AND schema_name = '{schema_name}'
                                            AND table_name = '{table_name}'
                                        """)
                                        result = metadata_cursor.fetchone()
                                        row_count = result[0] if result else 0
                                        size_bytes = result[1] if result else 0
                                    
                                    tables.append({
                                        "name": table_name,
                                        "type": "table",
                                        "columns": columns,
                                        "row_count_estimate": row_count,
                                        "size_bytes": size_bytes,
                                        "has_primary_key": False # Snowflake doesn't have a direct PK constraint like PostgreSQL
                                    })
                            
                            schema_info.append({
                                "name": schema_name,
                                "tables": tables
                            })
                
                return {
                    "success": True,
                    "schema": schema_info,
                    "summary": {
                        "total_databases": len(databases),
                        "total_schemas": sum(len(s["tables"]) for s in schema_info),
                        "total_tables": sum(len(t["tables"]) for s in schema_info for t in s["tables"])
                    }
                }
            
        except Exception as e:
            logger.error(f"Snowflake schema discovery failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_table_preview(self, db_name: str, schema_name: str, table_name: str, limit: int = 100) -> List[Dict]:
        """Get preview of table data"""
        try:
            connection_string = self._build_connection_string()
            conn = snowflake.connector.connect(
                user=self.data_source.username,
                password=password,
                account=self.data_source.host,
                warehouse=self.data_source.database_name,
                database=self.data_source.database_name,
                role=self.data_source.username,
                application="data_source_discovery"
            )
            
            with conn.cursor() as cursor:
                query = text(f"""
                    SELECT * FROM {db_name}.{schema_name}.{table_name} LIMIT :limit
                """)
                cursor.execute(query, {"limit": limit})
                
                columns = [col[0] for col in cursor.description]
                rows = []
                
                for row in cursor:
                    row_dict = {}
                    for i, value in enumerate(row):
                        # Convert datetime and other non-serializable types
                        if isinstance(value, datetime):
                            row_dict[columns[i]] = value.isoformat()
                        else:
                            row_dict[columns[i]] = str(value) if value is not None else None
                    rows.append(row_dict)
                
                return [{
                    "columns": columns,
                    "rows": rows,
                    "total_rows": len(rows)
                }]
                
        except Exception as e:
            logger.error(f"Table preview failed: {str(e)}")
            raise
    
    async def get_column_profile(self, db_name: str, schema_name: str, table_name: str, column_name: str) -> Dict[str, Any]:
        """Get detailed column profile and statistics"""
        try:
            connection_string = self._build_connection_string()
            conn = snowflake.connector.connect(
                user=self.data_source.username,
                password=password,
                account=self.data_source.host,
                warehouse=self.data_source.database_name,
                database=self.data_source.database_name,
                role=self.data_source.username,
                application="data_source_discovery"
            )
            
            with conn.cursor() as cursor:
                # Get basic statistics
                stats = {}
                try:
                    cursor.execute(f"""
                        SELECT 
                            COUNT(*) as total_rows,
                            COUNT(DISTINCT "{column_name}") as unique_values,
                            COUNT(CASE WHEN "{column_name}" IS NULL THEN 1 END) as null_count,
                            MIN("{column_name}") as min_value,
                            MAX("{column_name}") as max_value
                        FROM {db_name}.{schema_name}.{table_name}
                    """)
                    stats = cursor.fetchone()
                except Exception as e:
                    logger.warning(f"Could not get stats for column {column_name}: {e}")
                
                # Get value distribution (top 10 most common values)
                distribution = []
                try:
                    cursor.execute(f"""
                        SELECT "{column_name}" as value, COUNT(*) as count
                        FROM {db_name}.{schema_name}.{table_name}
                        WHERE "{column_name}" IS NOT NULL
                        GROUP BY "{column_name}"
                        ORDER BY count DESC
                        LIMIT 10
                    """)
                    distribution = cursor.fetchall()
                except Exception as e:
                    logger.warning(f"Could not get distribution for column {column_name}: {e}")
                
                return {
                    "statistics": row_to_dict(stats),
                    "value_distribution": [row_to_dict(row) for row in distribution],
                    "profile_date": datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Column profiling failed: {str(e)}")
            raise
    
    def _build_connection_string(self) -> str:
        """Build Snowflake connection string"""
        password = self._get_password()
        if not password:
            raise ValueError("Failed to retrieve password")
            
        return (f"snowflake://{self.data_source.username}:{password}@"
                f"{self.data_source.host}:{self.data_source.port}/{self.data_source.database_name or ''}")

class S3Connector(BaseConnector):
    """S3 connector for file-based data sources"""
    
    async def test_connection(self) -> Dict[str, Any]:
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=self.data_source.username,
                aws_secret_access_key=self.data_source.password_secret,
                region_name=self.data_source.database_name or 'us-east-1'
            )
            
            # Test by listing buckets
            response = s3_client.list_buckets()
            
            return {
                "success": True,
                "message": "S3 connection successful",
                "details": {
                    "bucket_count": len(response.get('Buckets', [])),
                    "region": self.data_source.database_name or 'us-east-1',
                    "account_id": response.get('Owner', {}).get('ID'),
                    "account_name": response.get('Owner', {}).get('DisplayName')
                }
            }
            
        except Exception as e:
            logger.error(f"S3 connection test failed: {str(e)}")
            return {
                "success": False,
                "message": str(e),
                "recommendations": [
                    "Check AWS credentials",
                    "Verify region configuration",
                    "Ensure IAM permissions include s3:ListBuckets",
                    "Check network connectivity to AWS"
                ]
            }
    
    async def discover_schema(self) -> Dict[str, Any]:
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=self.data_source.username,
                aws_secret_access_key=self.data_source.password_secret,
                region_name=self.data_source.database_name or 'us-east-1'
            )
            
            # List all buckets
            response = s3_client.list_buckets()
            buckets = []
            
            for bucket in response.get('Buckets', []):
                bucket_name = bucket['Name']
                try:
                    # Get bucket location
                    location = s3_client.get_bucket_location(Bucket=bucket_name)
                    region = location.get('LocationConstraint') or 'us-east-1'
                    
                    # Get bucket versioning status
                    versioning = s3_client.get_bucket_versioning(Bucket=bucket_name)
                    versioning_status = versioning.get('Status', 'Disabled')
                    
                    # Get bucket encryption
                    try:
                        encryption = s3_client.get_bucket_encryption(Bucket=bucket_name)
                        encryption_type = encryption.get('ServerSideEncryptionConfiguration', {}).get('Rules', [{}])[0].get('ApplyServerSideEncryptionByDefault', {}).get('SSEAlgorithm')
                    except s3_client.exceptions.ClientError:
                        encryption_type = 'None'
                    
                    # Get bucket objects (limited to 1000)
                    objects = []
                    paginator = s3_client.get_paginator('list_objects_v2')
                    for page in paginator.paginate(Bucket=bucket_name, MaxKeys=1000):
                        for obj in page.get('Contents', []):
                            # Get object metadata
                            head = s3_client.head_object(Bucket=bucket_name, Key=obj['Key'])
                            objects.append({
                                "key": obj['Key'],
                                "size": obj['Size'],
                                "last_modified": obj['LastModified'].isoformat(),
                                "storage_class": obj['StorageClass'],
                                "content_type": head.get('ContentType'),
                                "metadata": head.get('Metadata', {}),
                                "etag": head.get('ETag'),
                                "version_id": head.get('VersionId')
                            })
                    
                    buckets.append({
                        "name": bucket_name,
                        "creation_date": bucket['CreationDate'].isoformat(),
                        "region": region,
                        "versioning": versioning_status,
                        "encryption": encryption_type,
                        "objects": objects,
                        "total_objects": len(objects),
                        "total_size": sum(obj['size'] for obj in objects)
                    })
                    
                except Exception as e:
                    logger.warning(f"Error accessing bucket {bucket_name}: {str(e)}")
                    buckets.append({
                        "name": bucket_name,
                        "error": str(e),
                        "accessible": False
                    })
            
            return {
                "buckets": buckets,
                "summary": {
                    "total_buckets": len(buckets),
                    "accessible_buckets": sum(1 for b in buckets if b.get('accessible', True)),
                    "total_objects": sum(b.get('total_objects', 0) for b in buckets if b.get('accessible', True)),
                    "total_size": sum(b.get('total_size', 0) for b in buckets if b.get('accessible', True))
                }
            }
            
        except Exception as e:
            logger.error(f"S3 schema discovery failed: {str(e)}")
            raise
    
    async def get_table_preview(self, bucket_name: str, object_key: str, limit: int = 100) -> List[Dict]:
        """Get preview of S3 object data"""
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=self.data_source.username,
                aws_secret_access_key=self.data_source.password_secret,
                region_name=self.data_source.database_name or 'us-east-1'
            )
            
            # Get object metadata
            head = s3_client.head_object(Bucket=bucket_name, Key=object_key)
            content_type = head.get('ContentType', '')
            
            # Get object content
            obj = s3_client.get_object(Bucket=bucket_name, Key=object_key)
            content = obj['Body'].read()
            
            # Parse content based on type
            if content_type.startswith('text/csv'):
                import csv
                import io
                csv_data = csv.reader(io.StringIO(content.decode('utf-8')))
                headers = next(csv_data)  # Get headers
                rows = []
                for i, row in enumerate(csv_data):
                    if i >= limit:
                        break
                    rows.append(dict(zip(headers, row)))
                return [{
                    "columns": headers,
                    "rows": rows,
                    "total_rows": len(rows)
                }]
            
            elif content_type.startswith('application/json'):
                import json
                json_data = json.loads(content)
                if isinstance(json_data, list):
                    # List of objects
                    if not json_data:
                        return [{"columns": [], "rows": [], "total_rows": 0}]
                    columns = list(json_data[0].keys())
                    rows = json_data[:limit]
                    return [{
                        "columns": columns,
                        "rows": rows,
                        "total_rows": len(rows)
                    }]
                else:
                    # Single object
                    columns = list(json_data.keys())
                    return [{
                        "columns": columns,
                        "rows": [json_data],
                        "total_rows": 1
                    }]
            
            else:
                # For other types, return metadata only
                return [{
                    "columns": ["key", "size", "content_type", "last_modified"],
                    "rows": [{
                        "key": object_key,
                        "size": head['ContentLength'],
                        "content_type": content_type,
                        "last_modified": head['LastModified'].isoformat()
                    }],
                    "total_rows": 1
                }]
            
        except Exception as e:
            logger.error(f"S3 preview failed: {str(e)}")
            raise
    
    async def get_column_profile(self, bucket_name: str, object_key: str, column_name: str) -> Dict[str, Any]:
        """Get detailed column profile and statistics for S3 object"""
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=self.data_source.username,
                aws_secret_access_key=self.data_source.password_secret,
                region_name=self.data_source.database_name or 'us-east-1'
            )
            
            # Get object metadata
            head = s3_client.head_object(Bucket=bucket_name, Key=object_key)
            content_type = head.get('ContentType', '')
            
            # Get object content
            obj = s3_client.get_object(Bucket=bucket_name, Key=object_key)
            content = obj['Body'].read()
            
            # Initialize statistics
            stats = {
                "total_rows": 0,
                "unique_values": set(),
                "null_count": 0,
                "min_value": None,
                "max_value": None
            }
            
            # Process content based on type
            if content_type.startswith('text/csv'):
                import csv
                import io
                csv_data = csv.DictReader(io.StringIO(content.decode('utf-8')))
                
                # Collect statistics
                for row in csv_data:
                    stats["total_rows"] += 1
                    value = row.get(column_name)
                    
                    if value is None or value == '':
                        stats["null_count"] += 1
                    else:
                        stats["unique_values"].add(value)
                        
                        # Update min/max for numeric values
                        try:
                            num_value = float(value)
                            if stats["min_value"] is None or num_value < stats["min_value"]:
                                stats["min_value"] = num_value
                            if stats["max_value"] is None or num_value > stats["max_value"]:
                                stats["max_value"] = num_value
                        except ValueError:
                            pass
            
            elif content_type.startswith('application/json'):
                import json
                json_data = json.loads(content)
                
                if isinstance(json_data, list):
                    # Process list of objects
                    for item in json_data:
                        stats["total_rows"] += 1
                        value = item.get(column_name)
                        
                        if value is None:
                            stats["null_count"] += 1
                        else:
                            stats["unique_values"].add(str(value))
                            
                            # Update min/max for numeric values
                            if isinstance(value, (int, float)):
                                if stats["min_value"] is None or value < stats["min_value"]:
                                    stats["min_value"] = value
                                if stats["max_value"] is None or value > stats["max_value"]:
                                    stats["max_value"] = value
            
            # Convert set to list for JSON serialization
            stats["unique_values"] = list(stats["unique_values"])
            
            return {
                "statistics": stats,
                "profile_date": datetime.now().isoformat(),
                "object_metadata": {
                    "content_type": content_type,
                    "size": head['ContentLength'],
                    "last_modified": head['LastModified'].isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"S3 profiling failed: {str(e)}")
            raise
    
    def _build_connection_string(self) -> str:
        """Build S3 connection string"""
        region = self.data_source.database_name or 'us-east-1'
        return f"s3://{self.data_source.username}@{region}"

class RedisConnector(BaseConnector):
    """Redis connector with key discovery capabilities"""
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test connection to Redis"""
        try:
            redis = await aioredis.create_redis_pool(
                f'redis://{self.data_source.host}:{self.data_source.port}',
                username=self.data_source.username,
                password=self._get_password(),
                db=int(self.data_source.database_name or 0),
                timeout=10
            )
            
            try:
                # Test connection and get server info
                info = await redis.info()
                
                # Get additional stats
                stats = {
                    "connected_clients": info.get("connected_clients", 0),
                    "used_memory_human": info.get("used_memory_human", "0B"),
                    "total_keys": sum(await redis.dbsize() for _ in range(16)),  # Check all DBs
                    "uptime_days": info.get("uptime_in_days", 0),
                    "redis_mode": info.get("redis_mode", "standalone"),
                    "role": info.get("role", "master")
                }
                
                return {
                    "success": True,
                    "message": "Redis connection successful",
                    "details": {
                        "version": info.get("redis_version", "unknown"),
                        "mode": info.get("redis_mode", "unknown"),
                        "stats": stats
                    }
                }
            finally:
                redis.close()
                await redis.wait_closed()
                
        except Exception as e:
            return {
                "success": False,
                "message": f"Redis connection failed: {str(e)}",
                "details": {"error": str(e)},
                "recommendations": [
                    "Check Redis server status",
                    "Verify credentials",
                    "Check network connectivity",
                    "Verify Redis port is accessible",
                    "Check Redis configuration allows remote connections"
                ]
            }
    
    async def discover_schema(self) -> Dict[str, Any]:
        try:
            r = redis.Redis(
                host=self.data_source.host,
                port=self.data_source.port,
                username=self.data_source.username,
                password=self.data_source.password_secret,
                db=int(self.data_source.database_name or 0),
                decode_responses=True
            )
            
            databases = []
            
            # Scan all databases (0-15 by default)
            for db_index in range(16):
                try:
                    r.select(db_index)
                    
                    # Get all keys in current database
                    keys = []
                    cursor = 0
                    while True:
                        cursor, partial_keys = r.scan(cursor, count=1000)
                        for key in partial_keys:
                            # Get key type and additional info
                            key_type = r.type(key)
                            ttl = r.ttl(key)
                            
                            key_info = {
                                "name": key,
                                "type": key_type,
                                "ttl": ttl if ttl > -1 else None,
                                "size": 0,  # Will be updated based on type
                                "metadata": {}
                            }
                            
                            # Get type-specific information
                            if key_type == "string":
                                key_info["size"] = r.strlen(key)
                                key_info["metadata"]["encoding"] = r.object("encoding", key)
                                
                            elif key_type == "list":
                                key_info["size"] = r.llen(key)
                                key_info["metadata"]["first_element"] = r.lindex(key, 0)
                                key_info["metadata"]["last_element"] = r.lindex(key, -1)
                                
                            elif key_type == "set":
                                key_info["size"] = r.scard(key)
                                key_info["metadata"]["random_member"] = r.srandmember(key)
                                
                            elif key_type == "zset":
                                key_info["size"] = r.zcard(key)
                                key_info["metadata"]["score_range"] = {
                                    "min": r.zrange(key, 0, 0, withscores=True)[0][1] if r.zcard(key) > 0 else None,
                                    "max": r.zrange(key, -1, -1, withscores=True)[0][1] if r.zcard(key) > 0 else None
                                }
                                
                            elif key_type == "hash":
                                key_info["size"] = r.hlen(key)
                                key_info["metadata"]["fields"] = list(r.hkeys(key))
                            
                            keys.append(key_info)
                        
                        if cursor == 0:
                            break
                    
                    if keys:  # Only add database if it has keys
                        databases.append({
                            "index": db_index,
                            "name": f"db{db_index}",
                            "key_count": len(keys),
                            "keys": keys,
                            "types": {
                                "string": sum(1 for k in keys if k["type"] == "string"),
                                "list": sum(1 for k in keys if k["type"] == "list"),
                                "set": sum(1 for k in keys if k["type"] == "set"),
                                "zset": sum(1 for k in keys if k["type"] == "zset"),
                                "hash": sum(1 for k in keys if k["type"] == "hash")
                            }
                        })
                        
                except redis.ResponseError:
                    # Skip databases that can't be accessed
                    continue
            
            r.close()
            
            return {
                "databases": databases,
                "summary": {
                    "total_databases": len(databases),
                    "total_keys": sum(db["key_count"] for db in databases),
                    "key_types": {
                        "string": sum(db["types"]["string"] for db in databases),
                        "list": sum(db["types"]["list"] for db in databases),
                        "set": sum(db["types"]["set"] for db in databases),
                        "zset": sum(db["types"]["zset"] for db in databases),
                        "hash": sum(db["types"]["hash"] for db in databases)
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Redis schema discovery failed: {str(e)}")
            raise
    
    async def get_table_preview(self, db_index: str, key: str, limit: int = 100) -> List[Dict]:
        """Get preview of Redis key data"""
        try:
            redis = await aioredis.create_redis_pool(
                f'redis://{self.data_source.host}:{self.data_source.port}',
                username=self.data_source.username,
                password=self._get_password(),
                db=int(db_index),
            )
            
            try:
                key_type = await redis.type(key)
                
                if key_type == b'string':
                    value = await redis.get(key)
                    try:
                        data = json.loads(value)
                        if isinstance(data, list):
                            if not data:
                                return [{"columns": [], "rows": [], "total_rows": 0}]
                            columns = list(data[0].keys()) if isinstance(data[0], dict) else ["value"]
                            rows = data[:limit] if isinstance(data[0], dict) else [{"value": v} for v in data[:limit]]
                            return [{"columns": columns, "rows": rows, "total_rows": len(rows)}]
                    except json.JSONDecodeError:
                        return [{"columns": ["key", "value", "type"], "rows": [{"key": key, "value": value.decode(), "type": "string"}], "total_rows": 1}]
                
                elif key_type == b'list':
                    values = await redis.lrange(key, 0, limit - 1)
                    return [{
                        "columns": ["index", "value"],
                        "rows": [{"index": i, "value": v.decode()} for i, v in enumerate(values)],
                        "total_rows": len(values)
                    }]
                
                elif key_type == b'set':
                    values = await redis.smembers(key)
                    values_list = [v.decode() for v in values][:limit]
                    return [{
                        "columns": ["value"],
                        "rows": [{"value": v} for v in values_list],
                        "total_rows": len(values_list)
                    }]
                
                elif key_type == b'zset':
                    values = await redis.zrange(key, 0, limit - 1, withscores=True)
                    return [{
                        "columns": ["value", "score"],
                        "rows": [{"value": v[0].decode(), "score": v[1]} for v in values],
                        "total_rows": len(values)
                    }]
                
                elif key_type == b'hash':
                    all_fields = await redis.hgetall(key)
                    fields = [(k.decode(), v.decode()) for k, v in all_fields.items()][:limit]
                    return [{
                        "columns": ["field", "value"],
                        "rows": [{"field": f[0], "value": f[1]} for f in fields],
                        "total_rows": len(fields)
                    }]
                
                return [{
                    "columns": ["key", "type"],
                    "rows": [{"key": key, "type": key_type.decode()}],
                    "total_rows": 1
                }]
            
            finally:
                redis.close()
                await redis.wait_closed()
                
        except Exception as e:
            logger.error(f"Redis preview failed: {str(e)}")
            raise
    
    async def get_column_profile(self, db_index: str, key: str, field: str) -> Dict[str, Any]:
        """Get detailed profile and statistics for Redis key/field"""
        try:
            redis = await aioredis.create_redis_pool(
                f'redis://{self.data_source.host}:{self.data_source.port}',
                username=self.data_source.username,
                password=self._get_password(),
                db=int(db_index),
            )
            
            try:
                key_type = await redis.type(key)
                stats = {
                    "total_values": 0,
                    "unique_values": set(),
                    "null_count": 0,
                    "min_value": None,
                    "max_value": None,
                    "numeric_count": 0
                }
                
                if key_type == b'hash' and field:
                    # Profile specific hash field
                    value = await redis.hget(key, field)
                    stats["total_values"] = 1
                    if value is None:
                        stats["null_count"] = 1
                    else:
                        stats["unique_values"].add(value.decode())
                        try:
                            num_value = float(value)
                            stats["numeric_count"] = 1
                            stats["min_value"] = num_value
                            stats["max_value"] = num_value
                        except ValueError:
                            pass
                        
                elif key_type == b'list':
                    # Profile list values
                    values = await redis.lrange(key, 0, -1)
                    stats["total_values"] = len(values)
                    for value in values:
                        if value is None:
                            stats["null_count"] += 1
                        else:
                            stats["unique_values"].add(value.decode())
                            try:
                                num_value = float(value)
                                stats["numeric_count"] += 1
                                if stats["min_value"] is None or num_value < stats["min_value"]:
                                    stats["min_value"] = num_value
                                if stats["max_value"] is None or num_value > stats["max_value"]:
                                    stats["max_value"] = num_value
                            except ValueError:
                                pass
                            
                elif key_type == b'set':
                    # Profile set members
                    values = await redis.smembers(key)
                    stats["total_values"] = len(values)
                    stats["unique_values"] = set(v.decode() for v in values)
                    for value in values:
                        if value is None:
                            stats["null_count"] += 1
                        else:
                            try:
                                num_value = float(value)
                                stats["numeric_count"] += 1
                                if stats["min_value"] is None or num_value < stats["min_value"]:
                                    stats["min_value"] = num_value
                                if stats["max_value"] is None or num_value > stats["max_value"]:
                                    stats["max_value"] = num_value
                            except ValueError:
                                pass
                            
                elif key_type == b'zset':
                    # Profile sorted set members and scores
                    values = await redis.zrange(key, 0, -1, withscores=True)
                    stats["total_values"] = len(values)
                    for value, score in values:
                        if value is None:
                            stats["null_count"] += 1
                        else:
                            stats["unique_values"].add(value.decode())
                            # Scores are always numeric
                            if stats["min_value"] is None or score < stats["min_value"]:
                                stats["min_value"] = score
                            if stats["max_value"] is None or score > stats["max_value"]:
                                stats["max_value"] = score
                    stats["numeric_count"] = len(values)  # All scores are numeric
                
                # Convert set to list for JSON serialization
                stats["unique_values"] = list(stats["unique_values"])
                
                return {
                    "statistics": stats,
                    "key_metadata": {
                        "type": key_type.decode(),
                        "ttl": await redis.ttl(key),
                        "encoding": await redis.object("encoding", key),
                        "idle_time": await redis.object("idletime", key)
                    },
                    "profile_date": datetime.now().isoformat()
                }
            
            finally:
                redis.close()
                await redis.wait_closed()
            
        except Exception as e:
            logger.error(f"Redis profiling failed: {str(e)}")
            raise
    
    def _build_connection_string(self) -> str:
        """Build Redis connection string"""
        db = self.data_source.database_name or '0'
        auth = f"{self.data_source.username}:{self._get_password()}@" if self.data_source.username else ""
        return f"redis://{auth}{self.data_source.host}:{self.data_source.port}/{db}"

class CloudAwarePostgreSQLConnector(PostgreSQLConnector, LocationAwareConnector):
    """PostgreSQL connector with cloud and hybrid deployment support"""
    
    async def _initialize_primary(self):
        """Initialize primary PostgreSQL connection for hybrid setup"""
        connection_args = self._get_connection_args()
        cloud_creds = self._get_cloud_credentials()
        
        if cloud_creds.get('managed_identity'):
            # Use Azure managed identity
            credential = DefaultAzureCredential()
            token = credential.get_token("https://ossrdbms-aad.database.windows.net/.default")
            
            connection_args['password'] = token.token
        else:
            connection_args['password'] = self._get_password()
        
        connection_string = self._build_connection_string(is_primary=True)
        return create_engine(connection_string, connect_args=connection_args)
    
    async def _initialize_secondary(self):
        """Initialize secondary PostgreSQL connection for hybrid setup"""
        if not self.data_source.connection_properties.get('replica_host'):
            raise ValueError("No replica host configured for hybrid setup")
            
        connection_args = self._get_connection_args()
        connection_args['password'] = self._get_password()
        
        connection_string = self._build_connection_string(is_primary=False)
        return create_engine(connection_string, connect_args=connection_args)
    
    async def _initialize_connection(self):
        """Initialize single PostgreSQL connection for ON_PREM or CLOUD"""
        connection_args = self._get_connection_args()
        cloud_creds = self._get_cloud_credentials()
        
        if self.location == DataSourceLocation.CLOUD:
            if cloud_creds.get('managed_identity'):
                # Use Azure managed identity
                credential = DefaultAzureCredential()
                token = credential.get_token("https://ossrdbms-aad.database.windows.net/.default")
                connection_args['password'] = token.token
            else:
                connection_args['password'] = self._get_password()
        else:
            connection_args['password'] = self._get_password()
        
        connection_string = self._build_connection_string()
        return create_engine(connection_string, connect_args=connection_args)
    
    def _build_connection_string(self, is_primary: bool = True) -> str:
        """Build connection string based on location type"""
        if self.location == DataSourceLocation.HYBRID and not is_primary:
            # Use replica host for secondary connection
            host = self.data_source.connection_properties.get('replica_host')
            port = self.data_source.connection_properties.get('replica_port', self.data_source.port)
        else:
            host = self.data_source.host
            port = self.data_source.port
        
        return f"postgresql+psycopg2://{self.data_source.username}@{host}:{port}/{self.data_source.database_name or ''}"

class CloudAwareMySQLConnector(MySQLConnector, LocationAwareConnector):
    """MySQL connector with cloud and hybrid deployment support"""
    
    async def _initialize_primary(self):
        """Initialize primary MySQL connection for hybrid setup"""
        connection_args = self._get_connection_args()
        cloud_creds = self._get_cloud_credentials()
        
        if cloud_creds.get('iam_auth'):
            # Use AWS IAM authentication
            import boto3
            rds = boto3.client('rds')
            token = rds.generate_db_auth_token(
                DBHostname=self.data_source.host,
                Port=self.data_source.port,
                DBUsername=self.data_source.username,
                Region=cloud_creds.get('aws_region')
            )
            connection_args['password'] = token
        else:
            connection_args['password'] = self._get_password()
        
        connection_string = self._build_connection_string(is_primary=True)
        return create_engine(connection_string, connect_args=connection_args)
    
    async def _initialize_secondary(self):
        """Initialize secondary MySQL connection for hybrid setup"""
        if not self.data_source.connection_properties.get('replica_host'):
            raise ValueError("No replica host configured for hybrid setup")
            
        connection_args = self._get_connection_args()
        connection_args['password'] = self._get_password()
        
        connection_string = self._build_connection_string(is_primary=False)
        return create_engine(connection_string, connect_args=connection_args)
    
    async def _initialize_connection(self):
        """Initialize single MySQL connection for ON_PREM or CLOUD"""
        connection_args = self._get_connection_args()
        cloud_creds = self._get_cloud_credentials()
        
        if self.location == DataSourceLocation.CLOUD:
            if cloud_creds.get('iam_auth'):
                # Use AWS IAM authentication
                import boto3
                rds = boto3.client('rds')
                token = rds.generate_db_auth_token(
                    DBHostname=self.data_source.host,
                    Port=self.data_source.port,
                    DBUsername=self.data_source.username,
                    Region=cloud_creds.get('aws_region')
                )
                connection_args['password'] = token
            else:
                connection_args['password'] = self._get_password()
        else:
            connection_args['password'] = self._get_password()
        
        connection_string = self._build_connection_string()
        return create_engine(connection_string, connect_args=connection_args)
    
    def _build_connection_string(self, is_primary: bool = True) -> str:
        """Build connection string based on location type"""
        if self.location == DataSourceLocation.HYBRID and not is_primary:
            # Use replica host for secondary connection
            host = self.data_source.connection_properties.get('replica_host')
            port = self.data_source.connection_properties.get('replica_port', self.data_source.port)
        else:
            host = self.data_source.host
            port = self.data_source.port
        
        return f"mysql+pymysql://{self.data_source.username}@{host}:{port}/{self.data_source.database_name or ''}"

class CloudAwareMongoDBConnector(MongoDBConnector, LocationAwareConnector):
    """MongoDB connector with cloud and hybrid deployment support"""
    
    async def _initialize_primary(self):
        """Initialize primary MongoDB connection for hybrid setup"""
        connection_args = self._get_connection_args()
        connection_args['password'] = self._get_password()
        
        # Add replica set options for hybrid setup
        connection_args.update({
            'replicaSet': self.data_source.connection_properties.get('replica_set'),
            'readPreference': 'primaryPreferred'
        })
        
        connection_string = self._build_connection_string(is_primary=True)
        return pymongo.MongoClient(connection_string, **connection_args)
    
    async def _initialize_secondary(self):
        """Initialize secondary MongoDB connection for hybrid setup"""
        if not self.data_source.connection_properties:
            raise ValueError("No connection properties configured for hybrid setup")
            
        replica_members = self.data_source.connection_properties.get('replica_members')
        if not replica_members:
            raise ValueError("No replica members configured for hybrid setup")
            
        connection_args = self._get_connection_args()
        connection_args['password'] = self._get_password()
        
        # Add replica set options for hybrid setup
        connection_args.update({
            'replicaSet': self.data_source.connection_properties.get('replica_set'),
            'readPreference': 'secondary'
        })
        
        connection_string = self._build_connection_string(is_primary=False)
        return pymongo.MongoClient(connection_string, **connection_args)
    
    async def _initialize_connection(self):
        """Initialize single MongoDB connection for ON_PREM or CLOUD"""
        connection_args = self._get_connection_args()
        
        if self.location == DataSourceLocation.CLOUD:
            # Add cloud-specific options
            connection_args.update({
                'retryWrites': True,
                'w': 'majority',
                'authSource': 'admin',
                'authMechanism': 'SCRAM-SHA-256'
            })
            
            # Handle Atlas connection if specified
            if self.data_source.connection_properties.get('is_atlas'):
                connection_args.update({
                    'ssl': True,
                    'tlsAllowInvalidCertificates': False,
                    'authMechanism': 'MONGODB-AWS' if self.data_source.connection_properties.get('use_aws_auth') else 'SCRAM-SHA-256'
                })
        
        connection_args['password'] = self._get_password()
        connection_string = self._build_connection_string()
        return pymongo.MongoClient(connection_string, **connection_args)
    
    def _build_connection_string(self, is_primary: bool = True) -> str:
        """Build connection string based on location type"""
        if self.location == DataSourceLocation.HYBRID:
            # Use replica set connection string
            hosts = []
            if is_primary:
                hosts.append(f"{self.data_source.host}:{self.data_source.port}")
                replica_members = self.data_source.connection_properties.get('replica_members', [])
                hosts.extend(replica_members)
            else:
                hosts = self.data_source.connection_properties.get('replica_members', [])
            
            hosts_str = ','.join(hosts)
            replica_set = self.data_source.connection_properties.get('replica_set')
            return f"mongodb://{self.data_source.username}@{hosts_str}/{self.data_source.database_name or ''}?replicaSet={replica_set}"
        else:
            return f"mongodb://{self.data_source.username}@{self.data_source.host}:{self.data_source.port}/{self.data_source.database_name or ''}"

class DataSourceConnectionService:
    """Advanced service for connecting to and discovering data sources"""
    
    def __init__(self):
        self.connection_timeout = 30
        self.discovery_limit = 1000  # Limit for initial discovery
        self.connection_cache = {}  # Cache for active connections
        self.connection_stats = {}  # Cache for connection statistics
    
    async def test_connection(self, data_source: DataSource) -> Dict[str, Any]:
        """Test connection to data source with detailed diagnostics"""
        start_time = datetime.now()
        result = {
            "success": False,
            "message": "",
            "connection_time_ms": 0,
            "details": {},
            "recommendations": []
        }
        
        try:
            connector = self._get_connector(data_source)
            connection_result = await connector.test_connection()
            
            end_time = datetime.now()
            result.update({
                "success": connection_result["success"],
                "message": connection_result["message"],
                "connection_time_ms": int((end_time - start_time).total_seconds() * 1000),
                "details": connection_result.get("details", {}),
                "recommendations": connection_result.get("recommendations", [])
            })
            
        except Exception as e:
            end_time = datetime.now()
            result.update({
                "success": False,
                "message": f"Connection failed: {str(e)}",
                "connection_time_ms": int((end_time - start_time).total_seconds() * 1000),
                "details": {"error": str(e), "traceback": traceback.format_exc()},
                "recommendations": self._get_error_recommendations(str(e))
            })
            
        return result
    
    async def discover_schema(self, data_source: DataSource) -> Dict[str, Any]:
        """Discover full schema structure of the data source"""
        try:
            connector = self._get_connector(data_source)
            schema_info = await connector.discover_schema()
            
            return {
                "success": True,
                "data_source_id": data_source.id,
                "discovery_time": datetime.now().isoformat(),
                "schema": schema_info,
                "summary": self._generate_schema_summary(schema_info)
            }
            
        except Exception as e:
            logger.error(f"Schema discovery failed for data source {data_source.id}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "data_source_id": data_source.id
            }
    
    async def get_table_preview(self, data_source: DataSource, schema_name: str, table_name: str, limit: int = 100) -> Dict[str, Any]:
        """Get preview of table data"""
        try:
            connector = self._get_connector(data_source)
            preview_data = await connector.get_table_preview(schema_name, table_name, limit)
            
            return {
                "success": True,
                "schema_name": schema_name,
                "table_name": table_name,
                "data": preview_data
            }
            
        except Exception as e:
            logger.error(f"Table preview failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_column_profile(self, data_source: DataSource, schema_name: str, table_name: str, column_name: str) -> Dict[str, Any]:
        """Get detailed column profile and statistics"""
        try:
            connector = self._get_connector(data_source)
            profile_data = await connector.get_column_profile(schema_name, table_name, column_name)
            
            return {
                "success": True,
                "column_profile": profile_data
            }
            
        except Exception as e:
            logger.error(f"Column profiling failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _get_connector(self, data_source: DataSource) -> BaseConnector:
        """Get appropriate connector based on data source type and location"""
        connector_map = {
            DataSourceType.POSTGRESQL: CloudAwarePostgreSQLConnector,
            DataSourceType.MYSQL: CloudAwareMySQLConnector,
            DataSourceType.MONGODB: CloudAwareMongoDBConnector,
            DataSourceType.SNOWFLAKE: SnowflakeConnector if snowflake else None,
            DataSourceType.S3: S3Connector if boto3 else None,
            DataSourceType.REDIS: RedisConnector
        }
        
        connector_class = connector_map.get(data_source.source_type)
        if not connector_class:
            raise ValueError(f"Unsupported data source type: {data_source.source_type}")
        
        return connector_class(data_source)
    
    def _generate_schema_summary(self, schema_info: Dict) -> Dict[str, Any]:
        """Generate summary statistics from schema discovery"""
        total_tables = 0
        total_columns = 0
        data_types = set()
        
        for database in schema_info.get("databases", []):
            for schema in database.get("schemas", []):
                total_tables += len(schema.get("tables", []))
                for table in schema.get("tables", []):
                    total_columns += len(table.get("columns", []))
                    for column in table.get("columns", []):
                        data_types.add(column.get("data_type", "unknown"))
        
        return {
            "total_databases": len(schema_info.get("databases", [])),
            "total_schemas": sum(len(db.get("schemas", [])) for db in schema_info.get("databases", [])),
            "total_tables": total_tables,
            "total_columns": total_columns,
            "unique_data_types": list(data_types),
            "discovery_date": datetime.now().isoformat()
        }
    
    def _get_error_recommendations(self, error_message: str) -> List[str]:
        """Generate recommendations based on error message"""
        recommendations = []
        error_lower = error_message.lower()
        
        if "timeout" in error_lower:
            recommendations.extend([
                "Check network connectivity between application and data source",
                "Verify firewall settings allow connections on the specified port",
                "Consider increasing connection timeout if network is slow"
            ])
        elif "authentication" in error_lower or "password" in error_lower:
            recommendations.extend([
                "Verify username and password are correct",
                "Check if account has necessary permissions",
                "Ensure account is not locked or expired"
            ])
        elif "host" in error_lower or "connection refused" in error_lower:
            recommendations.extend([
                "Verify host address is correct and accessible",
                "Check if service is running on the target host",
                "Validate port number is correct"
            ])
        else:
            recommendations.append("Check connection parameters and network connectivity")
        
        return recommendations 

    async def initialize_connection_pool(self, data_source: DataSource) -> Dict[str, Any]:
        """Initialize connection pool with configured settings."""
        try:
            connector = self._get_connector(data_source)
            if data_source.location == DataSourceLocation.HYBRID:
                await connector.initialize()  # This will set up both primary and failover
            else:
                connection = await connector._initialize_connection()
                
            pool_stats = {
                "pool_size": data_source.pool_size,
                "max_overflow": data_source.max_overflow,
                "pool_timeout": data_source.pool_timeout,
                "active_connections": 0,
                "available_connections": data_source.pool_size
            }
            
            self.connection_cache[data_source.id] = connector
            self.connection_stats[data_source.id] = pool_stats
            
            return {
                "success": True,
                "message": "Connection pool initialized successfully",
                "pool_stats": pool_stats
            }
            
        except Exception as e:
            logger.error(f"Error initializing connection pool: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to initialize pool: {str(e)}",
                "error": str(e)
            }

    async def get_connection_pool_stats(self, data_source_id: int) -> Dict[str, Any]:
        """Get current statistics for the connection pool."""
        stats = self.connection_stats.get(data_source_id, {})
        if not stats:
            return {
                "success": False,
                "message": "No active connection pool found",
                "stats": None
            }
            
        return {
            "success": True,
            "message": "Pool statistics retrieved",
            "stats": stats
        }

    async def reconfigure_connection_pool(
        self,
        data_source: DataSource,
        pool_size: Optional[int] = None,
        max_overflow: Optional[int] = None,
        pool_timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """Reconfigure connection pool with new settings."""
        try:
            # Close existing pool if any
            await self.close_connection_pool(data_source.id)
            
            # Update pool settings
            if pool_size is not None:
                data_source.pool_size = pool_size
            if max_overflow is not None:
                data_source.max_overflow = max_overflow
            if pool_timeout is not None:
                data_source.pool_timeout = pool_timeout
                
            # Initialize new pool
            result = await self.initialize_connection_pool(data_source)
            return result
            
        except Exception as e:
            logger.error(f"Error reconfiguring connection pool: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to reconfigure pool: {str(e)}",
                "error": str(e)
            }

    async def close_connection_pool(self, data_source_id: int) -> Dict[str, Any]:
        """Close and cleanup connection pool."""
        try:
            connector = self.connection_cache.pop(data_source_id, None)
            if connector:
                if hasattr(connector, 'connection') and connector.connection:
                    await connector.connection.close()
                if hasattr(connector, 'failover_connection') and connector.failover_connection:
                    await connector.failover_connection.close()
                    
            self.connection_stats.pop(data_source_id, None)
            
            return {
                "success": True,
                "message": "Connection pool closed successfully"
            }
            
        except Exception as e:
            logger.error(f"Error closing connection pool: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to close pool: {str(e)}",
                "error": str(e)
            }

    async def validate_cloud_config(self, data_source: DataSource) -> Dict[str, Any]:
        """Validate cloud provider configuration."""
        try:
            if not data_source.cloud_provider:
                return {
                    "success": False,
                    "message": "No cloud provider configured",
                    "details": {"error": "Cloud provider is required"}
                }
                
            if not data_source.cloud_config:
                return {
                    "success": False,
                    "message": "No cloud configuration found",
                    "details": {"error": "Cloud configuration is required"}
                }
                
            # Validate based on cloud provider
            if data_source.cloud_provider == CloudProvider.AWS:
                required_fields = ["aws_access_key_id", "aws_secret_access_key", "aws_region"]
            elif data_source.cloud_provider == CloudProvider.AZURE:
                required_fields = ["azure_tenant_id", "azure_client_id", "azure_client_secret"]
            elif data_source.cloud_provider == CloudProvider.GCP:
                required_fields = ["project_id", "private_key_id", "private_key"]
            else:
                return {
                    "success": False,
                    "message": f"Unsupported cloud provider: {data_source.cloud_provider}",
                    "details": {"error": "Invalid cloud provider"}
                }
                
            # Check required fields
            missing_fields = [
                field for field in required_fields
                if field not in data_source.cloud_config
            ]
            
            if missing_fields:
                return {
                    "success": False,
                    "message": "Missing required cloud configuration fields",
                    "details": {"missing_fields": missing_fields}
                }
                
            # Test cloud credentials
            connector = self._get_connector(data_source)
            cloud_creds = connector._get_cloud_credentials()
            
            return {
                "success": True,
                "message": "Cloud configuration is valid",
                "details": {
                    "provider": data_source.cloud_provider,
                    "credentials_valid": bool(cloud_creds),
                    "managed_identity": cloud_creds.get("managed_identity", False),
                    "iam_auth": cloud_creds.get("iam_auth", False)
                }
            }
            
        except Exception as e:
            logger.error(f"Error validating cloud config: {str(e)}")
            return {
                "success": False,
                "message": f"Validation failed: {str(e)}",
                "error": str(e)
            }

    async def validate_replica_config(self, data_source: DataSource) -> Dict[str, Any]:
        """Validate replica configuration for hybrid setup."""
        try:
            if data_source.location != DataSourceLocation.HYBRID:
                return {
                    "success": False,
                    "message": "Replica configuration only valid for HYBRID location",
                    "details": {"error": "Invalid location type"}
                }
                
            if not data_source.replica_config:
                return {
                    "success": False,
                    "message": "No replica configuration found",
                    "details": {"error": "Replica configuration is required"}
                }
                
            # Check required fields based on source type
            required_fields = ["replica_host", "replica_port"]
            if data_source.source_type == DataSourceType.MONGODB:
                required_fields.extend(["replica_set", "replica_members"])
                
            missing_fields = [
                field for field in required_fields
                if field not in data_source.replica_config
            ]
            
            if missing_fields:
                return {
                    "success": False,
                    "message": "Missing required replica configuration fields",
                    "details": {"missing_fields": missing_fields}
                }
                
            # Test replica connection
            connector = self._get_connector(data_source)
            if not hasattr(connector, '_initialize_secondary'):
                return {
                    "success": False,
                    "message": "Data source type does not support replica configuration",
                    "details": {"error": "Unsupported operation"}
                }
                
            try:
                replica_conn = await connector._initialize_secondary()
                if hasattr(replica_conn, 'close'):
                    await replica_conn.close()
                    
                return {
                    "success": True,
                    "message": "Replica configuration is valid",
                    "details": {
                        "replica_host": data_source.replica_config["replica_host"],
                        "replica_port": data_source.replica_config["replica_port"],
                        "replica_set": data_source.replica_config.get("replica_set"),
                        "replica_members": data_source.replica_config.get("replica_members", [])
                    }
                }
                
            except Exception as e:
                return {
                    "success": False,
                    "message": "Failed to connect to replica",
                    "details": {"error": str(e)}
                }
                
        except Exception as e:
            logger.error(f"Error validating replica config: {str(e)}")
            return {
                "success": False,
                "message": f"Validation failed: {str(e)}",
                "error": str(e)
            }

    async def validate_ssl_config(self, data_source: DataSource) -> Dict[str, Any]:
        """Validate SSL configuration."""
        try:
            if not data_source.ssl_config:
                return {
                    "success": False,
                    "message": "No SSL configuration found",
                    "details": {"error": "SSL configuration is required"}
                }
                
            required_fields = ["ssl_ca"]
            if data_source.location in [DataSourceLocation.CLOUD, DataSourceLocation.HYBRID]:
                required_fields.extend(["ssl_cert", "ssl_key"])
                
            missing_fields = [
                field for field in required_fields
                if field not in data_source.ssl_config
            ]
            
            if missing_fields:
                return {
                    "success": False,
                    "message": "Missing required SSL configuration fields",
                    "details": {"missing_fields": missing_fields}
                }
                
            # Verify SSL files exist
            for field in ["ssl_ca", "ssl_cert", "ssl_key"]:
                if path := data_source.ssl_config.get(field):
                    if not os.path.isfile(path):
                        return {
                            "success": False,
                            "message": f"SSL file not found: {field}",
                            "details": {"error": f"File does not exist: {path}"}
                        }
                        
            return {
                "success": True,
                "message": "SSL configuration is valid",
                "details": {
                    "ssl_ca": data_source.ssl_config["ssl_ca"],
                    "ssl_cert": data_source.ssl_config.get("ssl_cert"),
                    "ssl_key": data_source.ssl_config.get("ssl_key"),
                    "verify_cert": bool(data_source.ssl_config.get("ssl_cert") and 
                                      data_source.ssl_config.get("ssl_key"))
                }
            }
            
        except Exception as e:
            logger.error(f"Error validating SSL config: {str(e)}")
            return {
                "success": False,
                "message": f"Validation failed: {str(e)}",
                "error": str(e)
            }

    async def get_connection_status(self, data_source: DataSource) -> Dict[str, Any]:
        """Get detailed connection status including pool stats."""
        try:
            # Get basic connection test
            test_result = await self.test_connection(data_source)
            
            # Get pool stats if available
            pool_stats = self.connection_stats.get(data_source.id, {})
            
            # Get connector instance
            connector = self.connection_cache.get(data_source.id)
            
            return {
                "success": test_result["success"],
                "message": test_result["message"],
                "connection_details": {
                    "host": data_source.host,
                    "port": data_source.port,
                    "database": data_source.database_name,
                    "source_type": data_source.source_type,
                    "location": data_source.location,
                    "cloud_provider": data_source.cloud_provider,
                    "is_hybrid": data_source.location == DataSourceLocation.HYBRID,
                    "using_ssl": bool(data_source.ssl_config),
                    "pool_enabled": bool(pool_stats),
                    "failover_ready": bool(connector and hasattr(connector, 'failover_connection')),
                },
                "pool_stats": pool_stats if pool_stats else None,
                "test_results": test_result.get("details", {}),
                "recommendations": test_result.get("recommendations", [])
            }
            
        except Exception as e:
            logger.error(f"Error getting connection status: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to get status: {str(e)}",
                "error": str(e)
            }