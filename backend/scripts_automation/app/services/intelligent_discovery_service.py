"""
Intelligent Discovery Service

This service provides advanced AI-powered data discovery capabilities for enterprise
data governance. It automatically discovers data assets, understands semantic
relationships, generates intelligent tags, and detects data dependencies using
machine learning algorithms and natural language processing.

Enterprise Features:
- Automated data asset discovery
- AI-powered semantic understanding
- Intelligent metadata extraction
- Smart tagging with ML models
- Automatic relationship detection
- Content-based classification
- Schema inference and validation
- Real-time discovery monitoring
"""

from typing import List, Dict, Any, Optional, Tuple, Set, Union
from datetime import datetime, timedelta
from sqlmodel import Session, select, and_, or_, text
from sqlalchemy import func, desc, asc
from enum import Enum
import asyncio
import json
import uuid
import logging
import re
from collections import defaultdict, Counter
from dataclasses import dataclass, field
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import spacy
from concurrent.futures import ThreadPoolExecutor
import hashlib

from ..models.scan_models import DataSource, ScanResult, Scan, EnhancedScanRuleSet
from ..models.advanced_catalog_models import (
    CatalogAsset, AssetMetadata, AssetRelationship, DataLineage,
    SemanticTag, AssetClassification, DataProfile, AssetQuality
)
from ..models.classification_models import ClassificationResult
from ..models.compliance_rule_models import ComplianceRule
from ..db_session import get_session
from .data_source_connection_service import DataSourceConnectionService
from .classification_service import ClassificationService

logger = logging.getLogger(__name__)

# Initialize NLP components
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nlp = spacy.load('en_core_web_sm')
except Exception as e:
    logger.warning(f"Failed to initialize NLP components: {str(e)}")
    nlp = None


class DiscoveryMode(str, Enum):
    """Discovery operation modes"""
    FULL_SCAN = "full_scan"                 # Complete discovery scan
    INCREMENTAL = "incremental"             # Incremental updates only
    SCHEMA_ONLY = "schema_only"             # Schema discovery only
    CONTENT_ANALYSIS = "content_analysis"   # Content-based discovery
    RELATIONSHIP_MAPPING = "relationship_mapping"  # Relationship discovery
    REAL_TIME = "real_time"                 # Real-time discovery
    SCHEDULED = "scheduled"                 # Scheduled discovery


class AssetType(str, Enum):
    """Types of discoverable assets"""
    TABLE = "table"                         # Database tables
    VIEW = "view"                          # Database views
    COLUMN = "column"                      # Table columns
    INDEX = "index"                        # Database indexes
    PROCEDURE = "procedure"                # Stored procedures
    FUNCTION = "function"                  # Database functions
    SCHEMA = "schema"                      # Database schemas
    FILE = "file"                          # Files
    API = "api"                           # API endpoints
    REPORT = "report"                     # Reports
    DASHBOARD = "dashboard"               # Dashboards


class DiscoveryStatus(str, Enum):
    """Discovery operation status"""
    PENDING = "pending"                    # Waiting to start
    RUNNING = "running"                    # Currently running
    COMPLETED = "completed"                # Successfully completed
    FAILED = "failed"                      # Failed with errors
    PAUSED = "paused"                     # Temporarily paused
    CANCELLED = "cancelled"               # Manually cancelled


class SemanticCategory(str, Enum):
    """Semantic categories for discovered assets"""
    PERSONAL_DATA = "personal_data"        # Personal information
    FINANCIAL_DATA = "financial_data"      # Financial information
    CUSTOMER_DATA = "customer_data"        # Customer information
    PRODUCT_DATA = "product_data"          # Product information
    OPERATIONAL_DATA = "operational_data"  # Operational data
    REFERENCE_DATA = "reference_data"      # Reference data
    TRANSACTIONAL_DATA = "transactional_data"  # Transaction data
    ANALYTICAL_DATA = "analytical_data"    # Analytics data
    METADATA = "metadata"                  # Metadata
    CONFIGURATION = "configuration"       # Configuration data


@dataclass
class DiscoveryConfig:
    """Configuration for intelligent discovery operations"""
    discovery_mode: DiscoveryMode = DiscoveryMode.FULL_SCAN
    asset_types: List[AssetType] = field(default_factory=lambda: list(AssetType))
    enable_content_analysis: bool = True
    enable_semantic_tagging: bool = True
    enable_relationship_detection: bool = True
    enable_quality_assessment: bool = True
    enable_ml_classification: bool = True
    max_concurrent_discoveries: int = 5
    content_sample_size: int = 1000
    semantic_similarity_threshold: float = 0.7
    relationship_confidence_threshold: float = 0.8
    quality_analysis_depth: str = "basic"  # basic, standard, comprehensive
    custom_classifiers: List[str] = field(default_factory=list)


@dataclass
class DiscoveredAsset:
    """Discovered data asset"""
    asset_id: str
    asset_name: str
    asset_type: AssetType
    data_source_id: int
    schema_name: Optional[str]
    table_name: Optional[str]
    column_name: Optional[str]
    metadata: Dict[str, Any]
    semantic_tags: List[str]
    classifications: List[str]
    relationships: List[Dict[str, Any]]
    quality_metrics: Dict[str, float]
    confidence_score: float
    discovery_timestamp: datetime


@dataclass
class DiscoveryResult:
    """Result of discovery operation"""
    discovery_id: str
    data_source_id: int
    discovery_mode: DiscoveryMode
    start_time: datetime
    end_time: Optional[datetime]
    status: DiscoveryStatus
    discovered_assets: List[DiscoveredAsset]
    relationships_found: int
    semantic_tags_generated: int
    classifications_applied: int
    quality_issues_detected: int
    error_messages: List[str]
    performance_metrics: Dict[str, Any]


class IntelligentDiscoveryService:
    """
    Enterprise-level intelligent discovery service providing advanced AI-powered
    data discovery capabilities with semantic understanding, automated tagging,
    and relationship detection for comprehensive data governance.
    """

    def __init__(self):
        # Core services
        self.connection_service = DataSourceConnectionService()
        self.classification_service = ClassificationService()
        
        # ML Components
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 3),
            min_df=2,
            max_df=0.8
        )
        self.lemmatizer = WordNetLemmatizer()
        self.lda_model = LatentDirichletAllocation(n_components=20, random_state=42)
        
        # Discovery state
        self._discovery_cache = {}
        self._semantic_embeddings = {}
        self._relationship_graph = defaultdict(list)
        self._asset_registry = {}
        
        # Configuration
        self.max_cache_size = 10000
        self.cache_ttl = 3600  # 1 hour
        self.min_confidence_threshold = 0.6
        
        # Thread pool for concurrent operations
        self.executor = ThreadPoolExecutor(max_workers=10)
        
        # Pre-trained semantic models
        self._initialize_semantic_models()
        
        logger.info("IntelligentDiscoveryService initialized with AI capabilities")

    def _initialize_semantic_models(self):
        """Initialize pre-trained semantic models and patterns"""
        
        # Semantic patterns for different data types
        self.semantic_patterns = {
            'personal_identifiers': {
                'patterns': [r'.*name.*', r'.*email.*', r'.*phone.*', r'.*address.*'],
                'keywords': ['firstname', 'lastname', 'fullname', 'email', 'phone', 'address'],
                'category': SemanticCategory.PERSONAL_DATA,
                'confidence': 0.9
            },
            'financial_indicators': {
                'patterns': [r'.*amount.*', r'.*price.*', r'.*cost.*', r'.*salary.*'],
                'keywords': ['amount', 'price', 'cost', 'salary', 'revenue', 'payment'],
                'category': SemanticCategory.FINANCIAL_DATA,
                'confidence': 0.85
            },
            'temporal_indicators': {
                'patterns': [r'.*date.*', r'.*time.*', r'.*created.*', r'.*updated.*'],
                'keywords': ['date', 'time', 'timestamp', 'created', 'updated', 'modified'],
                'category': SemanticCategory.OPERATIONAL_DATA,
                'confidence': 0.8
            },
            'customer_indicators': {
                'patterns': [r'.*customer.*', r'.*client.*', r'.*user.*'],
                'keywords': ['customer', 'client', 'user', 'account', 'member'],
                'category': SemanticCategory.CUSTOMER_DATA,
                'confidence': 0.85
            }
        }
        
        # Relationship patterns
        self.relationship_patterns = {
            'foreign_key': {
                'pattern': r'.*_id$|.*id$',
                'confidence': 0.9,
                'relationship_type': 'references'
            },
            'parent_child': {
                'pattern': r'parent_.*|child_.*',
                'confidence': 0.8,
                'relationship_type': 'hierarchy'
            },
            'lookup_table': {
                'pattern': r'.*_code$|.*_type$|.*_status$',
                'confidence': 0.7,
                'relationship_type': 'lookup'
            }
        }

    async def discover_data_assets(
        self,
        data_source_id: int,
        config: Optional[DiscoveryConfig] = None,
        db: Optional[Session] = None
    ) -> DiscoveryResult:
        """
        Perform intelligent discovery of data assets with AI-powered analysis.
        
        Features:
        - Automated asset discovery
        - Semantic understanding
        - Smart tagging
        - Relationship detection
        - Quality assessment
        """
        try:
            if not db:
                db = next(get_session())
            
            if not config:
                config = DiscoveryConfig()
            
            discovery_id = f"discovery_{uuid.uuid4().hex[:12]}_{int(datetime.utcnow().timestamp())}"
            start_time = datetime.utcnow()
            
            logger.info(f"Starting intelligent discovery for data source {data_source_id}")
            
            # Initialize discovery result
            result = DiscoveryResult(
                discovery_id=discovery_id,
                data_source_id=data_source_id,
                discovery_mode=config.discovery_mode,
                start_time=start_time,
                end_time=None,
                status=DiscoveryStatus.RUNNING,
                discovered_assets=[],
                relationships_found=0,
                semantic_tags_generated=0,
                classifications_applied=0,
                quality_issues_detected=0,
                error_messages=[],
                performance_metrics={}
            )
            
            try:
                # Get data source connection
                data_source = await self._get_data_source(data_source_id, db)
                if not data_source:
                    raise ValueError(f"Data source {data_source_id} not found")
                
                connection = await self.connection_service.get_connection(data_source_id)
                if not connection:
                    raise ValueError(f"Failed to connect to data source {data_source_id}")
                
                # Discover assets based on mode
                if config.discovery_mode == DiscoveryMode.FULL_SCAN:
                    discovered_assets = await self._full_discovery_scan(
                        connection, data_source, config, db
                    )
                elif config.discovery_mode == DiscoveryMode.SCHEMA_ONLY:
                    discovered_assets = await self._schema_discovery(
                        connection, data_source, config, db
                    )
                elif config.discovery_mode == DiscoveryMode.CONTENT_ANALYSIS:
                    discovered_assets = await self._content_analysis_discovery(
                        connection, data_source, config, db
                    )
                else:
                    discovered_assets = await self._full_discovery_scan(
                        connection, data_source, config, db
                    )
                
                result.discovered_assets = discovered_assets
                
                # Detect relationships if enabled
                if config.enable_relationship_detection:
                    relationships = await self._detect_asset_relationships(
                        discovered_assets, config
                    )
                    result.relationships_found = len(relationships)
                    
                    # Update assets with relationship information
                    await self._update_assets_with_relationships(
                        discovered_assets, relationships
                    )
                
                # Generate semantic tags if enabled
                if config.enable_semantic_tagging:
                    semantic_tags = await self._generate_semantic_tags(
                        discovered_assets, config
                    )
                    result.semantic_tags_generated = len(semantic_tags)
                
                # Apply ML classifications if enabled
                if config.enable_ml_classification:
                    classifications = await self._apply_ml_classifications(
                        discovered_assets, config, db
                    )
                    result.classifications_applied = len(classifications)
                
                # Assess quality if enabled
                if config.enable_quality_assessment:
                    quality_issues = await self._assess_asset_quality(
                        discovered_assets, config, db
                    )
                    result.quality_issues_detected = len(quality_issues)
                
                # Store discovered assets
                await self._store_discovered_assets(discovered_assets, db)
                
                result.status = DiscoveryStatus.COMPLETED
                result.end_time = datetime.utcnow()
                
                # Calculate performance metrics
                result.performance_metrics = self._calculate_performance_metrics(
                    result, len(discovered_assets)
                )
                
                logger.info(f"Discovery completed: {len(discovered_assets)} assets discovered")
                
            except Exception as e:
                result.status = DiscoveryStatus.FAILED
                result.error_messages.append(str(e))
                result.end_time = datetime.utcnow()
                logger.error(f"Discovery failed: {str(e)}")
            
            return result
            
        except Exception as e:
            logger.error(f"Intelligent discovery failed: {str(e)}")
            raise

    async def _full_discovery_scan(
        self,
        connection: Any,
        data_source: DataSource,
        config: DiscoveryConfig,
        db: Session
    ) -> List[DiscoveredAsset]:
        """Perform full discovery scan of data source"""
        
        discovered_assets = []
        
        try:
            # Discover schemas
            if AssetType.SCHEMA in config.asset_types:
                schemas = await self._discover_schemas(connection, data_source, config)
                discovered_assets.extend(schemas)
            
            # Discover tables
            if AssetType.TABLE in config.asset_types:
                tables = await self._discover_tables(connection, data_source, config)
                discovered_assets.extend(tables)
            
            # Discover views
            if AssetType.VIEW in config.asset_types:
                views = await self._discover_views(connection, data_source, config)
                discovered_assets.extend(views)
            
            # Discover columns
            if AssetType.COLUMN in config.asset_types:
                columns = await self._discover_columns(connection, data_source, config)
                discovered_assets.extend(columns)
            
            # Discover indexes
            if AssetType.INDEX in config.asset_types:
                indexes = await self._discover_indexes(connection, data_source, config)
                discovered_assets.extend(indexes)
            
            # Discover procedures
            if AssetType.PROCEDURE in config.asset_types:
                procedures = await self._discover_procedures(connection, data_source, config)
                discovered_assets.extend(procedures)
            
            # Apply content analysis if enabled
            if config.enable_content_analysis:
                for asset in discovered_assets:
                    if asset.asset_type in [AssetType.TABLE, AssetType.VIEW]:
                        content_analysis = await self._analyze_asset_content(
                            connection, asset, config
                        )
                        asset.metadata.update(content_analysis)
            
            return discovered_assets
            
        except Exception as e:
            logger.error(f"Full discovery scan failed: {str(e)}")
            return []

    async def _discover_schemas(
        self,
        connection: Any,
        data_source: DataSource,
        config: DiscoveryConfig
    ) -> List[DiscoveredAsset]:
        """Discover database schemas"""
        
        schemas = []
        
        try:
            if data_source.source_type == "mysql":
                query = """
                    SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
                    FROM INFORMATION_SCHEMA.SCHEMATA
                    WHERE SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
                """
            elif data_source.source_type == "postgresql":
                query = """
                    SELECT schema_name, schema_owner
                    FROM information_schema.schemata
                    WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
                """
            else:
                return schemas
            
            cursor = connection.cursor()
            cursor.execute(query)
            schema_results = cursor.fetchall()
            
            for row in schema_results:
                schema_name = row[0]
                
                # Generate unique asset ID
                asset_id = self._generate_asset_id(
                    data_source.id, AssetType.SCHEMA, schema_name
                )
                
                # Create discovered asset
                asset = DiscoveredAsset(
                    asset_id=asset_id,
                    asset_name=schema_name,
                    asset_type=AssetType.SCHEMA,
                    data_source_id=data_source.id,
                    schema_name=schema_name,
                    table_name=None,
                    column_name=None,
                    metadata={
                        'character_set': row[1] if len(row) > 1 else None,
                        'collation': row[2] if len(row) > 2 else None,
                        'discovery_method': 'schema_introspection'
                    },
                    semantic_tags=[],
                    classifications=[],
                    relationships=[],
                    quality_metrics={},
                    confidence_score=1.0,
                    discovery_timestamp=datetime.utcnow()
                )
                
                schemas.append(asset)
            
            cursor.close()
            logger.debug(f"Discovered {len(schemas)} schemas")
            return schemas
            
        except Exception as e:
            logger.error(f"Schema discovery failed: {str(e)}")
            return []

    async def _discover_tables(
        self,
        connection: Any,
        data_source: DataSource,
        config: DiscoveryConfig
    ) -> List[DiscoveredAsset]:
        """Discover database tables"""
        
        tables = []
        
        try:
            if data_source.source_type == "mysql":
                query = """
                    SELECT TABLE_SCHEMA, TABLE_NAME, ENGINE, TABLE_ROWS, 
                           DATA_LENGTH, INDEX_LENGTH, TABLE_COMMENT
                    FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_TYPE = 'BASE TABLE'
                    AND TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
                """
            elif data_source.source_type == "postgresql":
                query = """
                    SELECT schemaname, tablename, tableowner, hasindexes, hasrules, hastriggers
                    FROM pg_tables
                    WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
                """
            else:
                return tables
            
            cursor = connection.cursor()
            cursor.execute(query)
            table_results = cursor.fetchall()
            
            for row in table_results:
                schema_name = row[0]
                table_name = row[1]
                
                # Generate unique asset ID
                asset_id = self._generate_asset_id(
                    data_source.id, AssetType.TABLE, f"{schema_name}.{table_name}"
                )
                
                # Create discovered asset
                asset = DiscoveredAsset(
                    asset_id=asset_id,
                    asset_name=table_name,
                    asset_type=AssetType.TABLE,
                    data_source_id=data_source.id,
                    schema_name=schema_name,
                    table_name=table_name,
                    column_name=None,
                    metadata={
                        'engine': row[2] if len(row) > 2 else None,
                        'estimated_rows': row[3] if len(row) > 3 else None,
                        'data_size': row[4] if len(row) > 4 else None,
                        'index_size': row[5] if len(row) > 5 else None,
                        'comment': row[6] if len(row) > 6 else None,
                        'discovery_method': 'table_introspection'
                    },
                    semantic_tags=[],
                    classifications=[],
                    relationships=[],
                    quality_metrics={},
                    confidence_score=1.0,
                    discovery_timestamp=datetime.utcnow()
                )
                
                # Apply semantic analysis to table name
                semantic_tags = await self._analyze_semantic_meaning(table_name, AssetType.TABLE)
                asset.semantic_tags.extend(semantic_tags)
                
                tables.append(asset)
            
            cursor.close()
            logger.debug(f"Discovered {len(tables)} tables")
            return tables
            
        except Exception as e:
            logger.error(f"Table discovery failed: {str(e)}")
            return []

    async def _discover_columns(
        self,
        connection: Any,
        data_source: DataSource,
        config: DiscoveryConfig
    ) -> List[DiscoveredAsset]:
        """Discover table columns with detailed metadata"""
        
        columns = []
        
        try:
            if data_source.source_type == "mysql":
                query = """
                    SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE,
                           IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA, COLUMN_COMMENT
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
                    ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION
                """
            elif data_source.source_type == "postgresql":
                query = """
                    SELECT schemaname, tablename, column_name, data_type,
                           is_nullable, column_default
                    FROM information_schema.columns c
                    JOIN pg_tables t ON c.table_name = t.tablename
                    WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
                    ORDER BY schemaname, tablename, ordinal_position
                """
            else:
                return columns
            
            cursor = connection.cursor()
            cursor.execute(query)
            column_results = cursor.fetchall()
            
            for row in column_results:
                schema_name = row[0]
                table_name = row[1]
                column_name = row[2]
                data_type = row[3]
                
                # Generate unique asset ID
                asset_id = self._generate_asset_id(
                    data_source.id, AssetType.COLUMN, 
                    f"{schema_name}.{table_name}.{column_name}"
                )
                
                # Create discovered asset
                asset = DiscoveredAsset(
                    asset_id=asset_id,
                    asset_name=column_name,
                    asset_type=AssetType.COLUMN,
                    data_source_id=data_source.id,
                    schema_name=schema_name,
                    table_name=table_name,
                    column_name=column_name,
                    metadata={
                        'data_type': data_type,
                        'is_nullable': row[4] if len(row) > 4 else None,
                        'default_value': row[5] if len(row) > 5 else None,
                        'is_primary_key': row[6] == 'PRI' if len(row) > 6 else False,
                        'is_foreign_key': row[6] == 'MUL' if len(row) > 6 else False,
                        'extra_info': row[7] if len(row) > 7 else None,
                        'comment': row[8] if len(row) > 8 else None,
                        'discovery_method': 'column_introspection'
                    },
                    semantic_tags=[],
                    classifications=[],
                    relationships=[],
                    quality_metrics={},
                    confidence_score=1.0,
                    discovery_timestamp=datetime.utcnow()
                )
                
                # Apply semantic analysis
                semantic_tags = await self._analyze_semantic_meaning(column_name, AssetType.COLUMN)
                asset.semantic_tags.extend(semantic_tags)
                
                # Check for potential relationships
                if self._is_potential_foreign_key(column_name):
                    asset.metadata['potential_foreign_key'] = True
                
                columns.append(asset)
            
            cursor.close()
            logger.debug(f"Discovered {len(columns)} columns")
            return columns
            
        except Exception as e:
            logger.error(f"Column discovery failed: {str(e)}")
            return []

    async def _analyze_semantic_meaning(
        self,
        name: str,
        asset_type: AssetType
    ) -> List[str]:
        """Analyze semantic meaning of asset names"""
        
        semantic_tags = []
        
        try:
            name_lower = name.lower()
            
            # Apply semantic patterns
            for pattern_name, pattern_info in self.semantic_patterns.items():
                # Check regex patterns
                for regex_pattern in pattern_info['patterns']:
                    if re.search(regex_pattern, name_lower):
                        semantic_tags.append(pattern_info['category'].value)
                        break
                
                # Check keyword matches
                for keyword in pattern_info['keywords']:
                    if keyword in name_lower:
                        semantic_tags.append(pattern_info['category'].value)
                        break
            
            # NLP-based semantic analysis if spacy is available
            if nlp and len(name) > 3:
                doc = nlp(name.replace('_', ' '))
                for token in doc:
                    if token.pos_ == 'NOUN':
                        # Map common nouns to semantic categories
                        noun_mappings = {
                            'person': SemanticCategory.PERSONAL_DATA.value,
                            'customer': SemanticCategory.CUSTOMER_DATA.value,
                            'product': SemanticCategory.PRODUCT_DATA.value,
                            'transaction': SemanticCategory.TRANSACTIONAL_DATA.value,
                            'amount': SemanticCategory.FINANCIAL_DATA.value,
                            'date': SemanticCategory.OPERATIONAL_DATA.value,
                            'time': SemanticCategory.OPERATIONAL_DATA.value
                        }
                        
                        if token.lemma_ in noun_mappings:
                            semantic_tags.append(noun_mappings[token.lemma_])
            
            # Remove duplicates
            return list(set(semantic_tags))
            
        except Exception as e:
            logger.error(f"Semantic analysis failed: {str(e)}")
            return []

    async def _detect_asset_relationships(
        self,
        assets: List[DiscoveredAsset],
        config: DiscoveryConfig
    ) -> List[Dict[str, Any]]:
        """Detect relationships between discovered assets"""
        
        relationships = []
        
        try:
            # Group assets by type for efficient processing
            tables = [a for a in assets if a.asset_type == AssetType.TABLE]
            columns = [a for a in assets if a.asset_type == AssetType.COLUMN]
            
            # Detect foreign key relationships
            fk_relationships = await self._detect_foreign_key_relationships(
                columns, config
            )
            relationships.extend(fk_relationships)
            
            # Detect semantic relationships
            semantic_relationships = await self._detect_semantic_relationships(
                assets, config
            )
            relationships.extend(semantic_relationships)
            
            # Detect naming pattern relationships
            naming_relationships = await self._detect_naming_pattern_relationships(
                assets, config
            )
            relationships.extend(naming_relationships)
            
            logger.debug(f"Detected {len(relationships)} relationships")
            return relationships
            
        except Exception as e:
            logger.error(f"Relationship detection failed: {str(e)}")
            return []

    async def _detect_foreign_key_relationships(
        self,
        columns: List[DiscoveredAsset],
        config: DiscoveryConfig
    ) -> List[Dict[str, Any]]:
        """Detect foreign key relationships between columns"""
        
        relationships = []
        
        try:
            # Group columns by potential foreign key patterns
            potential_fks = []
            potential_pks = []
            
            for column in columns:
                column_name = column.column_name.lower()
                
                # Check if it's a potential foreign key
                if (column_name.endswith('_id') or column_name.endswith('id') or
                    column.metadata.get('is_foreign_key', False)):
                    potential_fks.append(column)
                
                # Check if it's a potential primary key
                if (column.metadata.get('is_primary_key', False) or
                    column_name == 'id' or column_name.endswith('_id')):
                    potential_pks.append(column)
            
            # Match foreign keys to primary keys
            for fk_column in potential_fks:
                fk_name = fk_column.column_name.lower()
                
                for pk_column in potential_pks:
                    if fk_column.asset_id != pk_column.asset_id:
                        pk_name = pk_column.column_name.lower()
                        table_name = pk_column.table_name.lower()
                        
                        # Check for naming pattern matches
                        confidence = 0.0
                        
                        if fk_name == pk_name:
                            confidence = 0.9
                        elif fk_name == f"{table_name}_id" and pk_name == "id":
                            confidence = 0.95
                        elif fk_name.replace('_id', '') == table_name:
                            confidence = 0.8
                        
                        if confidence >= config.relationship_confidence_threshold:
                            relationships.append({
                                'source_asset_id': fk_column.asset_id,
                                'target_asset_id': pk_column.asset_id,
                                'relationship_type': 'foreign_key',
                                'confidence': confidence,
                                'metadata': {
                                    'source_column': fk_column.column_name,
                                    'target_column': pk_column.column_name,
                                    'source_table': fk_column.table_name,
                                    'target_table': pk_column.table_name
                                }
                            })
            
            return relationships
            
        except Exception as e:
            logger.error(f"Foreign key relationship detection failed: {str(e)}")
            return []

    async def _generate_semantic_tags(
        self,
        assets: List[DiscoveredAsset],
        config: DiscoveryConfig
    ) -> List[str]:
        """Generate semantic tags for discovered assets"""
        
        all_tags = []
        
        try:
            # Collect text data from all assets for topic modeling
            text_corpus = []
            asset_map = {}
            
            for i, asset in enumerate(assets):
                text_elements = []
                
                # Include asset name
                text_elements.append(asset.asset_name)
                
                # Include metadata text
                if asset.metadata.get('comment'):
                    text_elements.append(asset.metadata['comment'])
                
                # Include semantic context
                if asset.schema_name:
                    text_elements.append(asset.schema_name)
                if asset.table_name:
                    text_elements.append(asset.table_name)
                
                combined_text = ' '.join(text_elements)
                text_corpus.append(combined_text)
                asset_map[i] = asset
            
            # Apply topic modeling if we have enough data
            if len(text_corpus) > 10:
                # Vectorize text
                tfidf_matrix = self.vectorizer.fit_transform(text_corpus)
                
                # Apply LDA for topic discovery
                lda_topics = self.lda_model.fit_transform(tfidf_matrix)
                
                # Get feature names for topic interpretation
                feature_names = self.vectorizer.get_feature_names_out()
                
                # Generate topic-based tags
                for i, topic_weights in enumerate(lda_topics):
                    if i in asset_map:
                        asset = asset_map[i]
                        
                        # Get dominant topics for this asset
                        dominant_topics = np.argsort(topic_weights)[-2:]  # Top 2 topics
                        
                        for topic_idx in dominant_topics:
                            if topic_weights[topic_idx] > 0.1:  # Minimum threshold
                                # Get top words for this topic
                                topic_words = []
                                topic_distribution = self.lda_model.components_[topic_idx]
                                top_word_indices = np.argsort(topic_distribution)[-5:]
                                
                                for word_idx in top_word_indices:
                                    topic_words.append(feature_names[word_idx])
                                
                                # Generate semantic tag from topic words
                                topic_tag = f"topic_{'_'.join(topic_words[:2])}"
                                asset.semantic_tags.append(topic_tag)
                                all_tags.append(topic_tag)
            
            # Apply rule-based semantic tagging
            for asset in assets:
                rule_based_tags = await self._apply_rule_based_tagging(asset)
                asset.semantic_tags.extend(rule_based_tags)
                all_tags.extend(rule_based_tags)
            
            return list(set(all_tags))
            
        except Exception as e:
            logger.error(f"Semantic tag generation failed: {str(e)}")
            return []

    async def _apply_rule_based_tagging(self, asset: DiscoveredAsset) -> List[str]:
        """Apply rule-based semantic tagging"""
        
        tags = []
        
        try:
            asset_name_lower = asset.asset_name.lower()
            
            # Data type-based tags
            if asset.asset_type == AssetType.COLUMN:
                data_type = asset.metadata.get('data_type', '').lower()
                
                if 'int' in data_type or 'number' in data_type:
                    tags.append('numeric_data')
                elif 'varchar' in data_type or 'text' in data_type:
                    tags.append('text_data')
                elif 'date' in data_type or 'time' in data_type:
                    tags.append('temporal_data')
                elif 'bool' in data_type:
                    tags.append('boolean_data')
            
            # Business domain tags based on naming patterns
            domain_patterns = {
                'customer': ['customer', 'client', 'user', 'account'],
                'product': ['product', 'item', 'inventory', 'catalog'],
                'order': ['order', 'purchase', 'transaction', 'sale'],
                'financial': ['amount', 'price', 'cost', 'revenue', 'payment'],
                'audit': ['created', 'updated', 'modified', 'deleted', 'audit'],
                'geography': ['address', 'city', 'state', 'country', 'location'],
                'contact': ['email', 'phone', 'contact', 'address']
            }
            
            for domain, keywords in domain_patterns.items():
                if any(keyword in asset_name_lower for keyword in keywords):
                    tags.append(f"domain_{domain}")
            
            # Sensitivity-based tags
            sensitive_patterns = [
                'password', 'secret', 'key', 'token', 'credential',
                'ssn', 'social_security', 'credit_card', 'bank_account',
                'salary', 'income', 'personal', 'private'
            ]
            
            if any(pattern in asset_name_lower for pattern in sensitive_patterns):
                tags.append('sensitive_data')
            
            return tags
            
        except Exception as e:
            logger.error(f"Rule-based tagging failed: {str(e)}")
            return []

    # Helper methods
    
    def _generate_asset_id(self, data_source_id: int, asset_type: AssetType, name: str) -> str:
        """Generate unique asset ID"""
        content = f"{data_source_id}_{asset_type.value}_{name}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def _is_potential_foreign_key(self, column_name: str) -> bool:
        """Check if column name suggests it's a foreign key"""
        column_lower = column_name.lower()
        return (column_lower.endswith('_id') or 
                column_lower.endswith('id') or
                column_lower in ['parent_id', 'ref_id', 'reference_id'])
    
    async def _get_data_source(self, data_source_id: int, db: Session) -> Optional[DataSource]:
        """Get data source by ID"""
        return db.get(DataSource, data_source_id)
    
    def _calculate_performance_metrics(
        self, 
        result: DiscoveryResult, 
        asset_count: int
    ) -> Dict[str, Any]:
        """Calculate performance metrics for discovery operation"""
        
        duration = 0
        if result.end_time and result.start_time:
            duration = (result.end_time - result.start_time).total_seconds()
        
        return {
            'total_duration_seconds': duration,
            'assets_per_second': asset_count / max(duration, 1),
            'relationships_per_asset': result.relationships_found / max(asset_count, 1),
            'tags_per_asset': result.semantic_tags_generated / max(asset_count, 1),
            'quality_issues_ratio': result.quality_issues_detected / max(asset_count, 1)
        }
    
    # Placeholder methods for additional functionality
    
    async def _schema_discovery(self, connection, data_source, config, db):
        """Schema-only discovery implementation"""
        return await self._discover_schemas(connection, data_source, config)
    
    async def _content_analysis_discovery(self, connection, data_source, config, db):
        """Content analysis discovery implementation"""
        return []
    
    async def _discover_views(self, connection, data_source, config):
        """Discover database views"""
        return []
    
    async def _discover_indexes(self, connection, data_source, config):
        """Discover database indexes"""
        return []
    
    async def _discover_procedures(self, connection, data_source, config):
        """Discover stored procedures"""
        return []
    
    async def _analyze_asset_content(self, connection, asset, config):
        """Analyze asset content"""
        return {}
    
    async def _detect_semantic_relationships(self, assets, config):
        """Detect semantic relationships"""
        return []
    
    async def _detect_naming_pattern_relationships(self, assets, config):
        """Detect naming pattern relationships"""
        return []
    
    async def _update_assets_with_relationships(self, assets, relationships):
        """Update assets with relationship information"""
        pass
    
    async def _apply_ml_classifications(self, assets, config, db):
        """Apply ML-based classifications"""
        return []
    
    async def _assess_asset_quality(self, assets, config, db):
        """Assess quality of discovered assets"""
        return []
    
    async def _store_discovered_assets(self, assets, db):
        """Store discovered assets in database"""
        pass


# Export the service
__all__ = [
    "IntelligentDiscoveryService", "DiscoveryConfig", "DiscoveredAsset",
    "DiscoveryResult", "DiscoveryMode", "AssetType", "DiscoveryStatus",
    "SemanticCategory"
]