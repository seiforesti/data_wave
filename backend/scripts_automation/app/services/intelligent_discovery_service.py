"""
🔍 INTELLIGENT DISCOVERY SERVICE
AI-powered data discovery engine with automated asset identification, semantic analysis,
pattern recognition, and intelligent cataloging for comprehensive data governance.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple, Set
from uuid import UUID, uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_, case, desc, asc
from sqlalchemy.orm import selectinload, joinedload
import json
import aiohttp
from concurrent.futures import ThreadPoolExecutor, as_completed
import numpy as np
from dataclasses import dataclass, field
from enum import Enum
import re
import hashlib
from collections import defaultdict, Counter, deque
import threading
import queue
import time
from urllib.parse import urlparse
import mimetypes
from pathlib import Path
import pickle
from sklearn.cluster import DBSCAN, KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import networkx as nx

# Import models
from ..models.catalog_intelligence_models import (
    IntelligentDiscoveryOperation, DiscoveryPattern, DiscoveryAnalytics,
    DiscoveryMethod, IntelligenceLevel, DiscoveryStatus, PatternType,
    ConfidenceLevel, ValidationMethod
)
from ..models.advanced_catalog_models import (
    AdvancedCatalogEntry, CatalogEntryType, CatalogStatus, DataQualityLevel,
    AccessLevel, BusinessCriticality, StewardshipRole
)
from ..models.data_lineage_models import (
    DataLineagePath, LineageSegment, LineageDirection, LineageType,
    LineageGranularity, DiscoveryMethod as LineageDiscoveryMethod
)

logger = logging.getLogger(__name__)

@dataclass
class DiscoveryConfiguration:
    """Configuration for discovery operations"""
    discovery_methods: List[DiscoveryMethod]
    scope_filters: Dict[str, Any]
    quality_thresholds: Dict[str, float]
    confidence_threshold: float = 0.7
    max_depth: int = 5
    sampling_rate: float = 0.1
    enable_ml_classification: bool = True
    enable_semantic_analysis: bool = True
    enable_relationship_detection: bool = True
    enable_quality_profiling: bool = True

@dataclass
class DiscoveryContext:
    """Context for discovery operations"""
    discovery_id: str
    user_id: str
    organization_id: str
    target_systems: List[str]
    business_context: Dict[str, Any]
    compliance_requirements: List[str]
    stewardship_assignments: Dict[str, str]

@dataclass
class AssetProfile:
    """Comprehensive profile of a discovered asset"""
    asset_id: str
    asset_name: str
    asset_type: str
    source_system: str
    schema_info: Dict[str, Any]
    content_sample: List[Dict[str, Any]]
    quality_metrics: Dict[str, float]
    semantic_tags: List[str]
    relationships: List[Dict[str, Any]]
    business_value_score: float
    confidence_score: float
    discovery_metadata: Dict[str, Any]

class DiscoveryAssetType(str, Enum):
    """Types of discoverable assets"""
    DATABASE_TABLE = "database_table"
    FILE_DATASET = "file_dataset"
    API_ENDPOINT = "api_endpoint"
    STREAM_TOPIC = "stream_topic"
    VIEW = "view"
    STORED_PROCEDURE = "stored_procedure"
    REPORT = "report"
    DASHBOARD = "dashboard"
    MODEL = "model"
    PIPELINE = "pipeline"

class QualityDimension(str, Enum):
    """Data quality dimensions for profiling"""
    COMPLETENESS = "completeness"
    ACCURACY = "accuracy"
    CONSISTENCY = "consistency"
    VALIDITY = "validity"
    UNIQUENESS = "uniqueness"
    TIMELINESS = "timeliness"

class SemanticCategory(str, Enum):
    """Semantic categories for asset classification"""
    CUSTOMER_DATA = "customer_data"
    FINANCIAL_DATA = "financial_data"
    OPERATIONAL_DATA = "operational_data"
    PRODUCT_DATA = "product_data"
    EMPLOYEE_DATA = "employee_data"
    TRANSACTION_DATA = "transaction_data"
    REFERENCE_DATA = "reference_data"
    METADATA = "metadata"
    LOG_DATA = "log_data"
    SENSITIVE_DATA = "sensitive_data"

class IntelligentDiscoveryService:
    """
    Enterprise-grade intelligent discovery service that automatically identifies,
    profiles, and catalogs data assets across the organization with AI-powered
    analysis and comprehensive quality assessment.
    """
    
    def __init__(
        self,
        db_session: AsyncSession,
        ml_models_path: str = "/app/models/discovery",
        cache_size: int = 10000,
        thread_pool_size: int = 15,
        max_concurrent_discoveries: int = 10
    ):
        self.db = db_session
        self.ml_models_path = ml_models_path
        self.thread_pool = ThreadPoolExecutor(max_workers=thread_pool_size)
        self.discovery_semaphore = asyncio.Semaphore(max_concurrent_discoveries)
        
        # Advanced caching and state management
        self.asset_cache: Dict[str, AssetProfile] = {}
        self.pattern_cache: Dict[str, Dict[str, Any]] = {}
        self.discovery_history: deque = deque(maxlen=10000)
        self.active_discoveries: Dict[str, DiscoveryContext] = {}
        
        # ML models for intelligent discovery
        self.ml_models = {
            "asset_classifier": None,
            "quality_predictor": None,
            "relationship_detector": None,
            "semantic_tagger": None,
            "anomaly_detector": None,
            "business_value_estimator": None
        }
        
        # Semantic analysis components
        self.text_vectorizer = None
        self.clustering_model = None
        self.relationship_graph = nx.Graph()
        
        # Pattern recognition and learning
        self.discovered_patterns: Dict[str, Dict[str, Any]] = {}
        self.learning_buffer: deque = deque(maxlen=50000)
        self.feature_extractors: Dict[str, Any] = {}
        
        # Performance tracking
        self.performance_metrics = {
            "discovery_times": defaultdict(list),
            "accuracy_scores": defaultdict(list),
            "quality_assessments": defaultdict(list),
            "relationship_discoveries": defaultdict(int)
        }
        
        # Event handling
        self.event_handlers: Dict[str, List] = defaultdict(list)
        self.audit_trail: List[Dict[str, Any]] = []
        
        # Initialize the service
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize the intelligent discovery service"""
        logger.info("Initializing Intelligent Discovery Service...")
        
        # Load ML models
        self._load_ml_models()
        
        # Initialize semantic analysis
        self._initialize_semantic_analysis()
        
        # Initialize pattern recognition
        self._initialize_pattern_recognition()
        
        # Initialize feature extractors
        self._initialize_feature_extractors()
        
        logger.info("Intelligent Discovery Service initialized successfully")

    def _load_ml_models(self):
        """Load pre-trained ML models for discovery operations"""
        try:
            # Asset classification model
            self.ml_models["asset_classifier"] = self._create_asset_classifier()
            
            # Quality prediction model  
            self.ml_models["quality_predictor"] = self._create_quality_predictor()
            
            # Relationship detection model
            self.ml_models["relationship_detector"] = self._create_relationship_detector()
            
            # Semantic tagging model
            self.ml_models["semantic_tagger"] = self._create_semantic_tagger()
            
            # Business value estimation model
            self.ml_models["business_value_estimator"] = self._create_business_value_estimator()
            
            logger.info("ML models loaded successfully")
        except Exception as e:
            logger.warning(f"Failed to load some ML models: {str(e)}")

    def _create_asset_classifier(self):
        """Create asset classification model"""
        from sklearn.ensemble import RandomForestClassifier
        return RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )

    def _initialize_semantic_analysis(self):
        """Initialize semantic analysis components"""
        try:
            # Text vectorization for semantic analysis
            self.text_vectorizer = TfidfVectorizer(
                max_features=5000,
                stop_words='english',
                ngram_range=(1, 2),
                lowercase=True,
                max_df=0.8,
                min_df=2
            )
            
            # Clustering for pattern discovery
            self.clustering_model = DBSCAN(
                eps=0.3,
                min_samples=5,
                metric='cosine'
            )
            
            logger.info("Semantic analysis components initialized")
        except Exception as e:
            logger.error(f"Failed to initialize semantic analysis: {str(e)}")

    # ================================================================
    # CORE DISCOVERY METHODS
    # ================================================================

    async def discover_assets(
        self,
        config: DiscoveryConfiguration,
        context: DiscoveryContext
    ) -> Dict[str, Any]:
        """
        Perform comprehensive asset discovery across specified systems
        with AI-powered analysis and intelligent cataloging.
        """
        async with self.discovery_semaphore:
            try:
                discovery_id = context.discovery_id
                start_time = datetime.utcnow()
                
                logger.info(f"Starting intelligent asset discovery {discovery_id}")
                
                # Initialize discovery tracking
                discovery_results = {
                    "discovery_id": discovery_id,
                    "start_time": start_time,
                    "status": "running",
                    "assets_discovered": [],
                    "relationships_found": [],
                    "quality_assessments": [],
                    "patterns_identified": [],
                    "semantic_classifications": [],
                    "business_value_estimates": [],
                    "errors": [],
                    "metrics": {
                        "total_assets": 0,
                        "high_quality_assets": 0,
                        "relationships_discovered": 0,
                        "patterns_found": 0,
                        "processing_time_seconds": 0.0
                    }
                }
                
                # Add to active discoveries
                self.active_discoveries[discovery_id] = context
                
                try:
                    # Execute discovery methods in parallel
                    discovery_tasks = []
                    
                    for method in config.discovery_methods:
                        if method == DiscoveryMethod.SCHEMA_CRAWLING:
                            task = self._discover_via_schema_crawling(config, context, discovery_results)
                        elif method == DiscoveryMethod.CONTENT_PROFILING:
                            task = self._discover_via_content_profiling(config, context, discovery_results)
                        elif method == DiscoveryMethod.METADATA_ANALYSIS:
                            task = self._discover_via_metadata_analysis(config, context, discovery_results)
                        elif method == DiscoveryMethod.SEMANTIC_ANALYSIS:
                            task = self._discover_via_semantic_analysis(config, context, discovery_results)
                        elif method == DiscoveryMethod.PATTERN_RECOGNITION:
                            task = self._discover_via_pattern_recognition(config, context, discovery_results)
                        elif method == DiscoveryMethod.RELATIONSHIP_MINING:
                            task = self._discover_via_relationship_mining(config, context, discovery_results)
                        else:
                            continue
                        
                        discovery_tasks.append(task)
                    
                    # Execute all discovery tasks
                    task_results = await asyncio.gather(*discovery_tasks, return_exceptions=True)
                    
                    # Process task results
                    for i, result in enumerate(task_results):
                        if isinstance(result, Exception):
                            logger.error(f"Discovery method {config.discovery_methods[i]} failed: {str(result)}")
                            discovery_results["errors"].append({
                                "method": config.discovery_methods[i].value,
                                "error": str(result)
                            })
                    
                    # Post-processing and analysis
                    await self._post_process_discoveries(discovery_results, config, context)
                    
                    # Generate comprehensive insights
                    insights = await self._generate_discovery_insights(discovery_results, config, context)
                    discovery_results["insights"] = insights
                    
                    # Update metrics
                    discovery_results["metrics"]["total_assets"] = len(discovery_results["assets_discovered"])
                    discovery_results["metrics"]["high_quality_assets"] = len([
                        asset for asset in discovery_results["assets_discovered"]
                        if asset.get("quality_score", 0) > 0.8
                    ])
                    discovery_results["metrics"]["relationships_discovered"] = len(discovery_results["relationships_found"])
                    discovery_results["metrics"]["patterns_found"] = len(discovery_results["patterns_identified"])
                    
                    # Finalize discovery
                    discovery_results["status"] = "completed"
                    discovery_results["end_time"] = datetime.utcnow()
                    discovery_results["metrics"]["processing_time_seconds"] = (
                        discovery_results["end_time"] - start_time
                    ).total_seconds()
                    
                    # Store discovery operation
                    await self._store_discovery_operation(discovery_results, config, context)
                    
                    # Emit discovery event
                    await self._emit_discovery_event(
                        "discovery_completed",
                        {
                            "discovery_id": discovery_id,
                            "assets_found": discovery_results["metrics"]["total_assets"],
                            "processing_time": discovery_results["metrics"]["processing_time_seconds"],
                            "quality_score": np.mean([
                                asset.get("quality_score", 0) 
                                for asset in discovery_results["assets_discovered"]
                            ]) if discovery_results["assets_discovered"] else 0
                        },
                        context
                    )
                    
                    logger.info(f"Discovery {discovery_id} completed successfully")
                    return discovery_results
                    
                finally:
                    # Clean up active discovery
                    if discovery_id in self.active_discoveries:
                        del self.active_discoveries[discovery_id]
                        
            except Exception as e:
                logger.error(f"Discovery {discovery_id} failed: {str(e)}")
                discovery_results["status"] = "failed"
                discovery_results["error"] = str(e)
                discovery_results["end_time"] = datetime.utcnow()
                raise

    async def _discover_via_schema_crawling(
        self,
        config: DiscoveryConfiguration,
        context: DiscoveryContext,
        discovery_results: Dict[str, Any]
    ):
        """Discover assets through comprehensive schema crawling"""
        
        try:
            logger.info("Starting schema crawling discovery")
            
            for system in context.target_systems:
                # Get system connection info
                system_info = await self._get_system_connection_info(system)
                if not system_info:
                    continue
                
                # Crawl schema based on system type
                if system_info["type"] == "database":
                    assets = await self._crawl_database_schema(system_info, config, context)
                elif system_info["type"] == "file_system":
                    assets = await self._crawl_file_system(system_info, config, context)
                elif system_info["type"] == "api":
                    assets = await self._crawl_api_endpoints(system_info, config, context)
                elif system_info["type"] == "cloud_storage":
                    assets = await self._crawl_cloud_storage(system_info, config, context)
                else:
                    assets = await self._crawl_generic_system(system_info, config, context)
                
                # Process discovered assets
                for asset_data in assets:
                    asset_profile = await self._create_asset_profile(asset_data, system, context)
                    if asset_profile.confidence_score >= config.confidence_threshold:
                        discovery_results["assets_discovered"].append(asset_profile.__dict__)
                        
                        # Cache the asset
                        self.asset_cache[asset_profile.asset_id] = asset_profile
            
        except Exception as e:
            logger.error(f"Schema crawling discovery failed: {str(e)}")
            discovery_results["errors"].append({
                "method": "schema_crawling",
                "error": str(e)
            })

    async def _crawl_database_schema(
        self,
        system_info: Dict[str, Any],
        config: DiscoveryConfiguration,
        context: DiscoveryContext
    ) -> List[Dict[str, Any]]:
        """Crawl database schema to discover tables, views, and procedures"""
        
        assets = []
        
        try:
            # This would connect to the actual database
            # For demo purposes, we'll simulate the discovery
            
            # Simulate database metadata
            simulated_tables = [
                {
                    "name": "customers",
                    "type": "table",
                    "schema": "public",
                    "columns": [
                        {"name": "customer_id", "type": "integer", "nullable": False},
                        {"name": "first_name", "type": "varchar", "nullable": False},
                        {"name": "last_name", "type": "varchar", "nullable": False},
                        {"name": "email", "type": "varchar", "nullable": True},
                        {"name": "created_at", "type": "timestamp", "nullable": False}
                    ],
                    "row_count": 150000,
                    "data_size_mb": 45.2
                },
                {
                    "name": "orders",
                    "type": "table",
                    "schema": "public", 
                    "columns": [
                        {"name": "order_id", "type": "integer", "nullable": False},
                        {"name": "customer_id", "type": "integer", "nullable": False},
                        {"name": "order_date", "type": "date", "nullable": False},
                        {"name": "total_amount", "type": "decimal", "nullable": False},
                        {"name": "status", "type": "varchar", "nullable": False}
                    ],
                    "row_count": 450000,
                    "data_size_mb": 120.8
                },
                {
                    "name": "customer_metrics_view",
                    "type": "view",
                    "schema": "analytics",
                    "definition": "SELECT c.customer_id, COUNT(o.order_id) as order_count...",
                    "base_tables": ["customers", "orders"]
                }
            ]
            
            for table_info in simulated_tables:
                asset_data = {
                    "asset_id": f"{system_info['system_id']}_{table_info['schema']}_{table_info['name']}",
                    "name": f"{table_info['schema']}.{table_info['name']}",
                    "type": DiscoveryAssetType.DATABASE_TABLE if table_info["type"] == "table" else DiscoveryAssetType.VIEW,
                    "source_system": system_info["system_id"],
                    "schema_info": table_info,
                    "discovery_method": DiscoveryMethod.SCHEMA_CRAWLING
                }
                
                # Sample data for content analysis
                if table_info["type"] == "table":
                    asset_data["content_sample"] = await self._sample_table_data(
                        system_info, table_info, config.sampling_rate
                    )
                
                assets.append(asset_data)
            
            return assets
            
        except Exception as e:
            logger.error(f"Database schema crawling failed: {str(e)}")
            return assets

    async def _discover_via_content_profiling(
        self,
        config: DiscoveryConfiguration,
        context: DiscoveryContext,
        discovery_results: Dict[str, Any]
    ):
        """Discover assets through content profiling and analysis"""
        
        try:
            logger.info("Starting content profiling discovery")
            
            # Get assets from cache or previous discoveries
            assets_to_profile = []
            
            # Add assets from current discovery
            for asset_dict in discovery_results["assets_discovered"]:
                if "content_sample" in asset_dict:
                    assets_to_profile.append(asset_dict)
            
            # Add cached assets
            for asset_profile in self.asset_cache.values():
                if asset_profile.content_sample:
                    assets_to_profile.append(asset_profile.__dict__)
            
            # Profile each asset's content
            for asset_data in assets_to_profile:
                content_profile = await self._profile_asset_content(
                    asset_data, config, context
                )
                
                if content_profile:
                    # Update quality assessments
                    discovery_results["quality_assessments"].append({
                        "asset_id": asset_data["asset_id"],
                        "quality_profile": content_profile,
                        "profiling_method": "content_analysis",
                        "confidence": content_profile.get("confidence", 0.0)
                    })
                    
                    # Update asset with content insights
                    await self._update_asset_with_content_insights(
                        asset_data["asset_id"], content_profile
                    )
            
        except Exception as e:
            logger.error(f"Content profiling discovery failed: {str(e)}")
            discovery_results["errors"].append({
                "method": "content_profiling",
                "error": str(e)
            })

    async def _profile_asset_content(
        self,
        asset_data: Dict[str, Any],
        config: DiscoveryConfiguration,
        context: DiscoveryContext
    ) -> Dict[str, Any]:
        """Perform comprehensive content profiling of an asset"""
        
        content_profile = {
            "quality_dimensions": {},
            "data_types": {},
            "patterns": [],
            "anomalies": [],
            "semantic_insights": {},
            "business_context": {},
            "confidence": 0.0
        }
        
        try:
            content_sample = asset_data.get("content_sample", [])
            if not content_sample:
                return content_profile
            
            # Quality dimension analysis
            content_profile["quality_dimensions"] = await self._analyze_quality_dimensions(
                content_sample
            )
            
            # Data type analysis
            content_profile["data_types"] = await self._analyze_data_types(content_sample)
            
            # Pattern detection
            content_profile["patterns"] = await self._detect_content_patterns(content_sample)
            
            # Anomaly detection
            if config.enable_ml_classification and self.ml_models["anomaly_detector"]:
                content_profile["anomalies"] = await self._detect_content_anomalies(
                    content_sample
                )
            
            # Semantic analysis
            if config.enable_semantic_analysis:
                content_profile["semantic_insights"] = await self._analyze_semantic_content(
                    content_sample, asset_data
                )
            
            # Business context analysis
            content_profile["business_context"] = await self._analyze_business_context(
                content_sample, asset_data, context
            )
            
            # Calculate overall confidence
            confidence_factors = [
                len(content_sample) / 1000,  # Sample size factor
                len(content_profile["patterns"]) / 10,  # Pattern richness
                content_profile["quality_dimensions"].get("completeness", 0),
                content_profile["semantic_insights"].get("confidence", 0)
            ]
            content_profile["confidence"] = min(1.0, np.mean(confidence_factors))
            
            return content_profile
            
        except Exception as e:
            logger.error(f"Content profiling failed for asset {asset_data.get('asset_id')}: {str(e)}")
            return content_profile

    async def _analyze_quality_dimensions(self, content_sample: List[Dict[str, Any]]) -> Dict[str, float]:
        """Analyze data quality dimensions"""
        
        quality_scores = {}
        
        try:
            if not content_sample:
                return quality_scores
            
            total_records = len(content_sample)
            
            # Get all field names
            all_fields = set()
            for record in content_sample:
                all_fields.update(record.keys())
            
            field_quality = {}
            
            for field in all_fields:
                field_values = [record.get(field) for record in content_sample]
                
                # Completeness
                non_null_count = sum(1 for v in field_values if v is not None and v != "")
                completeness = non_null_count / total_records if total_records > 0 else 0
                
                # Consistency (data type consistency)
                value_types = [type(v).__name__ for v in field_values if v is not None]
                type_counts = Counter(value_types)
                most_common_type_count = type_counts.most_common(1)[0][1] if type_counts else 0
                consistency = most_common_type_count / len(value_types) if value_types else 0
                
                # Uniqueness
                unique_values = set(str(v) for v in field_values if v is not None)
                uniqueness = len(unique_values) / non_null_count if non_null_count > 0 else 0
                
                # Validity (basic format validation)
                validity = 1.0  # Simplified - would need field-specific validation
                
                field_quality[field] = {
                    "completeness": completeness,
                    "consistency": consistency,
                    "uniqueness": uniqueness,
                    "validity": validity
                }
            
            # Calculate overall quality scores
            if field_quality:
                quality_scores[QualityDimension.COMPLETENESS.value] = np.mean([
                    fq["completeness"] for fq in field_quality.values()
                ])
                quality_scores[QualityDimension.CONSISTENCY.value] = np.mean([
                    fq["consistency"] for fq in field_quality.values()
                ])
                quality_scores[QualityDimension.UNIQUENESS.value] = np.mean([
                    fq["uniqueness"] for fq in field_quality.values()
                ])
                quality_scores[QualityDimension.VALIDITY.value] = np.mean([
                    fq["validity"] for fq in field_quality.values()
                ])
                
                # Timeliness - simplified assessment
                quality_scores[QualityDimension.TIMELINESS.value] = 0.8
                
                # Accuracy - would need reference data
                quality_scores[QualityDimension.ACCURACY.value] = 0.75
            
            return quality_scores
            
        except Exception as e:
            logger.error(f"Quality dimension analysis failed: {str(e)}")
            return quality_scores

    # ================================================================
    # SEMANTIC ANALYSIS AND CLASSIFICATION
    # ================================================================

    async def _discover_via_semantic_analysis(
        self,
        config: DiscoveryConfiguration,
        context: DiscoveryContext,
        discovery_results: Dict[str, Any]
    ):
        """Discover assets through semantic analysis and NLP"""
        
        try:
            logger.info("Starting semantic analysis discovery")
            
            # Collect text content from all discovered assets
            text_corpus = []
            asset_text_map = {}
            
            for asset_dict in discovery_results["assets_discovered"]:
                asset_id = asset_dict["asset_id"]
                asset_texts = await self._extract_text_features(asset_dict)
                
                if asset_texts:
                    text_corpus.extend(asset_texts)
                    asset_text_map[asset_id] = asset_texts
            
            if not text_corpus:
                return
            
            # Vectorize text content
            if self.text_vectorizer:
                try:
                    text_vectors = self.text_vectorizer.fit_transform(text_corpus)
                    
                    # Perform clustering to identify semantic groups
                    if self.clustering_model:
                        clusters = self.clustering_model.fit_predict(text_vectors.toarray())
                        
                        # Analyze clusters for semantic patterns
                        cluster_analysis = await self._analyze_semantic_clusters(
                            clusters, text_corpus, asset_text_map
                        )
                        
                        discovery_results["semantic_classifications"].extend(cluster_analysis)
                    
                    # Perform similarity analysis
                    similarity_matrix = cosine_similarity(text_vectors)
                    similarity_relationships = await self._extract_similarity_relationships(
                        similarity_matrix, list(asset_text_map.keys()), threshold=0.7
                    )
                    
                    discovery_results["relationships_found"].extend(similarity_relationships)
                    
                except Exception as e:
                    logger.error(f"Text vectorization failed: {str(e)}")
            
            # Apply semantic tagging using ML models
            if config.enable_ml_classification and self.ml_models["semantic_tagger"]:
                for asset_id, texts in asset_text_map.items():
                    semantic_tags = await self._generate_semantic_tags(texts, asset_id)
                    if semantic_tags:
                        discovery_results["semantic_classifications"].append({
                            "asset_id": asset_id,
                            "semantic_tags": semantic_tags,
                            "method": "ml_tagging",
                            "confidence": np.mean([tag["confidence"] for tag in semantic_tags])
                        })
            
        except Exception as e:
            logger.error(f"Semantic analysis discovery failed: {str(e)}")
            discovery_results["errors"].append({
                "method": "semantic_analysis", 
                "error": str(e)
            })

    async def _extract_text_features(self, asset_dict: Dict[str, Any]) -> List[str]:
        """Extract text features from asset for semantic analysis"""
        
        text_features = []
        
        try:
            # Asset name and description
            if "name" in asset_dict:
                text_features.append(asset_dict["name"])
            
            if "description" in asset_dict:
                text_features.append(asset_dict["description"])
            
            # Schema information
            schema_info = asset_dict.get("schema_info", {})
            if "columns" in schema_info:
                column_names = [col.get("name", "") for col in schema_info["columns"]]
                text_features.extend(column_names)
                
                # Column comments if available
                column_comments = [
                    col.get("comment", "") for col in schema_info["columns"] 
                    if col.get("comment")
                ]
                text_features.extend(column_comments)
            
            # Content sample text
            content_sample = asset_dict.get("content_sample", [])
            if content_sample:
                # Extract string values from sample data
                for record in content_sample[:10]:  # Limit to first 10 records
                    for value in record.values():
                        if isinstance(value, str) and len(value) > 3:
                            text_features.append(value)
            
            # Filter and clean text features
            cleaned_features = []
            for text in text_features:
                if isinstance(text, str) and len(text.strip()) > 2:
                    cleaned_text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.strip())
                    if cleaned_text:
                        cleaned_features.append(cleaned_text)
            
            return cleaned_features
            
        except Exception as e:
            logger.error(f"Text feature extraction failed: {str(e)}")
            return text_features

    async def _generate_semantic_tags(self, texts: List[str], asset_id: str) -> List[Dict[str, Any]]:
        """Generate semantic tags for asset using ML models"""
        
        semantic_tags = []
        
        try:
            # Combine texts for analysis
            combined_text = " ".join(texts)
            
            # Rule-based semantic tagging
            rule_based_tags = await self._apply_rule_based_semantic_tagging(combined_text)
            semantic_tags.extend(rule_based_tags)
            
            # ML-based semantic tagging (simplified)
            if self.ml_models["semantic_tagger"]:
                # This would use a trained model to predict semantic categories
                # For demo, we'll use keyword-based classification
                ml_tags = await self._apply_ml_semantic_tagging(combined_text)
                semantic_tags.extend(ml_tags)
            
            return semantic_tags
            
        except Exception as e:
            logger.error(f"Semantic tag generation failed for asset {asset_id}: {str(e)}")
            return semantic_tags

    async def _apply_rule_based_semantic_tagging(self, text: str) -> List[Dict[str, Any]]:
        """Apply rule-based semantic tagging"""
        
        tags = []
        text_lower = text.lower()
        
        # Customer data patterns
        customer_keywords = ["customer", "client", "user", "account", "person", "individual"]
        if any(keyword in text_lower for keyword in customer_keywords):
            tags.append({
                "category": SemanticCategory.CUSTOMER_DATA.value,
                "confidence": 0.8,
                "method": "rule_based"
            })
        
        # Financial data patterns
        financial_keywords = ["payment", "transaction", "invoice", "billing", "price", "amount", "cost", "revenue"]
        if any(keyword in text_lower for keyword in financial_keywords):
            tags.append({
                "category": SemanticCategory.FINANCIAL_DATA.value,
                "confidence": 0.8,
                "method": "rule_based"
            })
        
        # Product data patterns
        product_keywords = ["product", "item", "inventory", "catalog", "sku", "merchandise"]
        if any(keyword in text_lower for keyword in product_keywords):
            tags.append({
                "category": SemanticCategory.PRODUCT_DATA.value,
                "confidence": 0.8,
                "method": "rule_based"
            })
        
        # Operational data patterns
        operational_keywords = ["operation", "process", "workflow", "task", "activity", "event"]
        if any(keyword in text_lower for keyword in operational_keywords):
            tags.append({
                "category": SemanticCategory.OPERATIONAL_DATA.value,
                "confidence": 0.7,
                "method": "rule_based"
            })
        
        # Sensitive data patterns
        sensitive_keywords = ["ssn", "social", "credit_card", "password", "secret", "confidential"]
        if any(keyword in text_lower for keyword in sensitive_keywords):
            tags.append({
                "category": SemanticCategory.SENSITIVE_DATA.value,
                "confidence": 0.9,
                "method": "rule_based"
            })
        
        return tags

    # ================================================================
    # RELATIONSHIP DISCOVERY
    # ================================================================

    async def _discover_via_relationship_mining(
        self,
        config: DiscoveryConfiguration,
        context: DiscoveryContext,
        discovery_results: Dict[str, Any]
    ):
        """Discover relationships between assets through mining techniques"""
        
        try:
            logger.info("Starting relationship mining discovery")
            
            discovered_assets = discovery_results["assets_discovered"]
            if len(discovered_assets) < 2:
                return
            
            # Discover schema-based relationships
            schema_relationships = await self._discover_schema_relationships(discovered_assets)
            discovery_results["relationships_found"].extend(schema_relationships)
            
            # Discover content-based relationships
            content_relationships = await self._discover_content_relationships(discovered_assets)
            discovery_results["relationships_found"].extend(content_relationships)
            
            # Discover usage-based relationships
            usage_relationships = await self._discover_usage_relationships(discovered_assets, context)
            discovery_results["relationships_found"].extend(usage_relationships)
            
            # Build relationship graph
            await self._build_relationship_graph(discovery_results["relationships_found"])
            
            # Analyze relationship patterns
            relationship_patterns = await self._analyze_relationship_patterns()
            discovery_results["patterns_identified"].extend(relationship_patterns)
            
        except Exception as e:
            logger.error(f"Relationship mining discovery failed: {str(e)}")
            discovery_results["errors"].append({
                "method": "relationship_mining",
                "error": str(e)
            })

    async def _discover_schema_relationships(self, assets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Discover relationships based on schema analysis"""
        
        relationships = []
        
        try:
            # Group assets by type
            database_assets = [a for a in assets if a.get("type") == DiscoveryAssetType.DATABASE_TABLE.value]
            
            # Look for foreign key relationships
            for asset1 in database_assets:
                schema1 = asset1.get("schema_info", {})
                columns1 = schema1.get("columns", [])
                
                for asset2 in database_assets:
                    if asset1["asset_id"] == asset2["asset_id"]:
                        continue
                    
                    schema2 = asset2.get("schema_info", {})
                    columns2 = schema2.get("columns", [])
                    
                    # Check for matching column names and types
                    for col1 in columns1:
                        for col2 in columns2:
                            if (col1.get("name") == col2.get("name") and 
                                col1.get("type") == col2.get("type")):
                                
                                # Potential foreign key relationship
                                relationship = {
                                    "relationship_id": f"rel_{uuid4().hex[:8]}",
                                    "source_asset_id": asset1["asset_id"],
                                    "target_asset_id": asset2["asset_id"],
                                    "relationship_type": "foreign_key",
                                    "relationship_details": {
                                        "source_column": col1.get("name"),
                                        "target_column": col2.get("name"),
                                        "data_type": col1.get("type")
                                    },
                                    "confidence": 0.9 if "_id" in col1.get("name", "") else 0.7,
                                    "discovery_method": "schema_analysis"
                                }
                                relationships.append(relationship)
            
            return relationships
            
        except Exception as e:
            logger.error(f"Schema relationship discovery failed: {str(e)}")
            return relationships

    async def _build_relationship_graph(self, relationships: List[Dict[str, Any]]):
        """Build a graph representation of asset relationships"""
        
        try:
            # Clear existing graph
            self.relationship_graph.clear()
            
            # Add relationships to graph
            for rel in relationships:
                source_id = rel["source_asset_id"]
                target_id = rel["target_asset_id"]
                
                # Add nodes if they don't exist
                if not self.relationship_graph.has_node(source_id):
                    self.relationship_graph.add_node(source_id)
                if not self.relationship_graph.has_node(target_id):
                    self.relationship_graph.add_node(target_id)
                
                # Add edge with relationship metadata
                self.relationship_graph.add_edge(
                    source_id, 
                    target_id,
                    relationship_type=rel["relationship_type"],
                    confidence=rel["confidence"],
                    details=rel.get("relationship_details", {})
                )
            
            logger.info(f"Relationship graph built with {self.relationship_graph.number_of_nodes()} nodes and {self.relationship_graph.number_of_edges()} edges")
            
        except Exception as e:
            logger.error(f"Failed to build relationship graph: {str(e)}")

    # ================================================================
    # BUSINESS VALUE ESTIMATION
    # ================================================================

    async def _estimate_business_value(
        self,
        asset_profile: AssetProfile,
        context: DiscoveryContext
    ) -> float:
        """Estimate business value of discovered asset"""
        
        try:
            value_factors = {}
            
            # Data volume factor
            schema_info = asset_profile.schema_info
            row_count = schema_info.get("row_count", 0)
            data_size = schema_info.get("data_size_mb", 0)
            
            volume_score = min(1.0, (row_count / 1000000) * 0.3 + (data_size / 1000) * 0.2)
            value_factors["volume"] = volume_score
            
            # Quality factor
            quality_score = np.mean(list(asset_profile.quality_metrics.values())) if asset_profile.quality_metrics else 0.5
            value_factors["quality"] = quality_score
            
            # Semantic relevance factor
            semantic_score = 0.5
            for tag in asset_profile.semantic_tags:
                if tag in ["customer_data", "financial_data", "product_data"]:
                    semantic_score += 0.2
            value_factors["semantic"] = min(1.0, semantic_score)
            
            # Relationship factor (connectivity in graph)
            relationship_score = 0.5
            if asset_profile.asset_id in self.relationship_graph:
                degree = self.relationship_graph.degree(asset_profile.asset_id)
                relationship_score = min(1.0, degree / 10)
            value_factors["relationships"] = relationship_score
            
            # Business context factor
            business_context = context.business_context
            context_score = 0.5
            
            critical_domains = business_context.get("critical_domains", [])
            if any(domain.lower() in asset_profile.asset_name.lower() for domain in critical_domains):
                context_score += 0.3
            
            value_factors["context"] = min(1.0, context_score)
            
            # Calculate weighted business value
            weights = {
                "volume": 0.15,
                "quality": 0.25,
                "semantic": 0.25,
                "relationships": 0.20,
                "context": 0.15
            }
            
            business_value = sum(
                value_factors[factor] * weights[factor]
                for factor in weights
            )
            
            return min(1.0, business_value)
            
        except Exception as e:
            logger.error(f"Business value estimation failed: {str(e)}")
            return 0.5

    # ================================================================
    # ASSET PROFILING AND CREATION
    # ================================================================

    async def _create_asset_profile(
        self,
        asset_data: Dict[str, Any],
        system: str,
        context: DiscoveryContext
    ) -> AssetProfile:
        """Create comprehensive asset profile"""
        
        try:
            # Extract basic information
            asset_id = asset_data["asset_id"]
            asset_name = asset_data["name"]
            asset_type = asset_data["type"]
            
            # Create asset profile
            asset_profile = AssetProfile(
                asset_id=asset_id,
                asset_name=asset_name,
                asset_type=asset_type,
                source_system=system,
                schema_info=asset_data.get("schema_info", {}),
                content_sample=asset_data.get("content_sample", []),
                quality_metrics={},
                semantic_tags=[],
                relationships=[],
                business_value_score=0.0,
                confidence_score=0.0,
                discovery_metadata={
                    "discovery_method": asset_data.get("discovery_method"),
                    "discovered_at": datetime.utcnow().isoformat(),
                    "discovery_context": context.discovery_id
                }
            )
            
            # Analyze quality metrics
            if asset_profile.content_sample:
                asset_profile.quality_metrics = await self._analyze_quality_dimensions(
                    asset_profile.content_sample
                )
            
            # Generate semantic tags
            asset_texts = await self._extract_text_features(asset_data)
            if asset_texts:
                semantic_tags = await self._generate_semantic_tags(asset_texts, asset_id)
                asset_profile.semantic_tags = [tag["category"] for tag in semantic_tags]
            
            # Estimate business value
            asset_profile.business_value_score = await self._estimate_business_value(
                asset_profile, context
            )
            
            # Calculate confidence score
            confidence_factors = [
                1.0 if asset_profile.schema_info else 0.0,
                1.0 if asset_profile.content_sample else 0.0,
                len(asset_profile.quality_metrics) / 6,  # Max 6 quality dimensions
                len(asset_profile.semantic_tags) / 5,  # Reasonable number of tags
                asset_profile.business_value_score
            ]
            asset_profile.confidence_score = np.mean(confidence_factors)
            
            return asset_profile
            
        except Exception as e:
            logger.error(f"Asset profile creation failed: {str(e)}")
            raise

    # ================================================================
    # UTILITY METHODS
    # ================================================================

    async def _emit_discovery_event(
        self,
        event_type: str,
        event_data: Dict[str, Any],
        context: DiscoveryContext
    ):
        """Emit discovery-related events"""
        try:
            event = {
                "event_id": f"evt_{uuid4().hex[:8]}",
                "event_type": event_type,
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": context.user_id,
                "organization_id": context.organization_id,
                "discovery_id": context.discovery_id,
                "data": event_data
            }
            
            # Add to audit trail
            self.audit_trail.append(event)
            
            # Execute registered event handlers
            handlers = self.event_handlers.get(event_type, [])
            for handler in handlers:
                try:
                    await handler(event, context)
                except Exception as e:
                    logger.warning(f"Event handler failed: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Failed to emit discovery event: {str(e)}")

    def register_event_handler(self, event_type: str, handler):
        """Register an event handler for discovery events"""
        self.event_handlers[event_type].append(handler)

    async def get_discovery_status(self, discovery_id: str) -> Dict[str, Any]:
        """Get status of a discovery operation"""
        try:
            if discovery_id in self.active_discoveries:
                return {
                    "discovery_id": discovery_id,
                    "status": "running",
                    "context": self.active_discoveries[discovery_id].__dict__
                }
            else:
                # Check discovery history or database
                return {
                    "discovery_id": discovery_id,
                    "status": "completed_or_not_found"
                }
                
        except Exception as e:
            logger.error(f"Failed to get discovery status: {str(e)}")
            return {"error": str(e)}

    def __del__(self):
        """Cleanup when service is destroyed"""
        try:
            if hasattr(self, 'thread_pool'):
                self.thread_pool.shutdown(wait=False)
        except Exception:
            pass