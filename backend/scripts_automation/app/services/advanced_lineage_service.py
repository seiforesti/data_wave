"""
🌐 ADVANCED LINEAGE SERVICE
Comprehensive data lineage tracking system with AI-powered relationship discovery,
impact analysis, graph analytics, and real-time lineage monitoring for enterprise data governance.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple, Set
from uuid import UUID, uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_, case, desc, asc, text
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
import networkx as nx
from networkx.algorithms import shortest_path, centrality, community
import threading
import queue
import time
import pickle
from sklearn.cluster import SpectralClustering
from sklearn.preprocessing import StandardScaler

# Import models
from ..models.data_lineage_models import (
    DataLineagePath, LineageSegment, LineageImpactAnalysis, LineageEvent,
    LineageValidation, LineageMetrics, LineageDirection, LineageType,
    LineageGranularity, DiscoveryMethod, ValidationStatus, ImpactLevel,
    ConfidenceLevel, LineageStatus, EventType
)
from ..models.advanced_catalog_models import (
    AdvancedCatalogEntry, CatalogEntryType, CatalogStatus
)

logger = logging.getLogger(__name__)

@dataclass
class LineageConfiguration:
    """Configuration for lineage operations"""
    max_depth: int = 10
    granularity: LineageGranularity = LineageGranularity.TABLE_LEVEL
    include_transformations: bool = True
    include_business_logic: bool = True
    confidence_threshold: float = 0.7
    enable_real_time_tracking: bool = True
    enable_impact_analysis: bool = True
    enable_change_propagation: bool = True

@dataclass
class LineageContext:
    """Context for lineage operations"""
    user_id: str
    organization_id: str
    business_domain: str
    analysis_purpose: str
    include_sensitive: bool = False
    access_level: str = "standard"

@dataclass
class LineageNode:
    """Represents a node in the lineage graph"""
    node_id: str
    node_name: str
    node_type: str
    system_id: str
    metadata: Dict[str, Any]
    business_criticality: str
    data_classification: List[str]
    quality_score: float
    last_updated: datetime

@dataclass
class LineageEdge:
    """Represents an edge in the lineage graph"""
    edge_id: str
    source_node_id: str
    target_node_id: str
    lineage_type: LineageType
    transformation_logic: Optional[str]
    confidence_score: float
    discovery_method: DiscoveryMethod
    created_at: datetime
    validated: bool

@dataclass
class ImpactAnalysisResult:
    """Result of impact analysis"""
    analysis_id: str
    root_asset_id: str
    impacted_assets: List[Dict[str, Any]]
    impact_levels: Dict[str, int]
    propagation_paths: List[List[str]]
    risk_assessment: Dict[str, Any]
    mitigation_recommendations: List[str]

class LineageChangeType(str, Enum):
    """Types of lineage changes"""
    ASSET_ADDED = "asset_added"
    ASSET_REMOVED = "asset_removed"
    RELATIONSHIP_ADDED = "relationship_added"
    RELATIONSHIP_REMOVED = "relationship_removed"
    TRANSFORMATION_CHANGED = "transformation_changed"
    METADATA_UPDATED = "metadata_updated"

class GraphAnalysisType(str, Enum):
    """Types of graph analysis"""
    CENTRALITY = "centrality"
    CLUSTERING = "clustering"
    PATH_ANALYSIS = "path_analysis"
    BOTTLENECK_DETECTION = "bottleneck_detection"
    CRITICAL_PATH = "critical_path"
    COMMUNITY_DETECTION = "community_detection"

class AdvancedLineageService:
    """
    Enterprise-grade lineage service that provides comprehensive data lineage tracking,
    impact analysis, graph analytics, and real-time monitoring capabilities.
    """
    
    def __init__(
        self,
        db_session: AsyncSession,
        cache_size: int = 50000,
        thread_pool_size: int = 15,
        enable_real_time: bool = True
    ):
        self.db = db_session
        self.thread_pool = ThreadPoolExecutor(max_workers=thread_pool_size)
        self.enable_real_time = enable_real_time
        
        # Advanced graph management
        self.lineage_graph = nx.MultiDiGraph()
        self.graph_cache: Dict[str, nx.Graph] = {}
        self.node_cache: Dict[str, LineageNode] = {}
        self.edge_cache: Dict[str, LineageEdge] = {}
        
        # Real-time tracking
        self.change_stream: deque = deque(maxlen=10000)
        self.active_tracking_sessions: Dict[str, Dict[str, Any]] = {}
        self.impact_cache: Dict[str, ImpactAnalysisResult] = {}
        
        # Analytics and metrics
        self.graph_metrics: Dict[str, Any] = {}
        self.performance_metrics: Dict[str, List[float]] = defaultdict(list)
        self.analysis_history: deque = deque(maxlen=5000)
        
        # Background processing
        self.background_tasks: List[asyncio.Task] = []
        self.monitoring_enabled = False
        self.shutdown_event = asyncio.Event()
        
        # ML models for lineage intelligence
        self.ml_models = {
            "relationship_predictor": None,
            "impact_estimator": None,
            "anomaly_detector": None,
            "clustering_model": None
        }
        
        # Event handling
        self.event_handlers: Dict[str, List] = defaultdict(list)
        self.audit_trail: List[Dict[str, Any]] = []
        
        # Initialize the service
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize the advanced lineage service"""
        logger.info("Initializing Advanced Lineage Service...")
        
        # Load existing lineage data
        asyncio.create_task(self._load_existing_lineage())
        
        # Initialize ML models
        self._initialize_ml_models()
        
        # Start background monitoring if enabled
        if self.enable_real_time:
            self._start_background_monitoring()
        
        logger.info("Advanced Lineage Service initialized successfully")

    def _initialize_ml_models(self):
        """Initialize ML models for lineage intelligence"""
        try:
            # Clustering model for relationship grouping
            self.ml_models["clustering_model"] = SpectralClustering(
                n_clusters=10,
                random_state=42
            )
            
            logger.info("ML models initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize some ML models: {str(e)}")

    # ================================================================
    # CORE LINEAGE TRACKING
    # ================================================================

    async def build_lineage_graph(
        self,
        root_asset_id: str,
        direction: LineageDirection = LineageDirection.BOTH,
        config: LineageConfiguration = None,
        context: LineageContext = None
    ) -> Dict[str, Any]:
        """
        Build comprehensive lineage graph for an asset with advanced analytics
        and intelligent relationship discovery.
        """
        try:
            if not config:
                config = LineageConfiguration()
            if not context:
                context = LineageContext(
                    user_id="system",
                    organization_id="default",
                    business_domain="general",
                    analysis_purpose="lineage_exploration"
                )
            
            lineage_id = f"lineage_{uuid4().hex[:12]}"
            start_time = datetime.utcnow()
            
            logger.info(f"Building lineage graph {lineage_id} for asset {root_asset_id}")
            
            # Initialize lineage graph
            lineage_result = {
                "lineage_id": lineage_id,
                "root_asset_id": root_asset_id,
                "direction": direction.value,
                "config": config.__dict__,
                "nodes": [],
                "edges": [],
                "graph_metrics": {},
                "critical_paths": [],
                "bottlenecks": [],
                "communities": [],
                "impact_analysis": {},
                "recommendations": []
            }
            
            # Build graph recursively
            visited_nodes = set()
            graph_builder = nx.MultiDiGraph()
            
            await self._build_lineage_recursive(
                root_asset_id, 0, config.max_depth, direction,
                visited_nodes, graph_builder, config, context
            )
            
            # Convert graph to nodes and edges
            lineage_result["nodes"] = await self._convert_nodes_to_dict(
                graph_builder.nodes(data=True), context
            )
            lineage_result["edges"] = await self._convert_edges_to_dict(
                graph_builder.edges(data=True), context
            )
            
            # Perform graph analytics
            if len(graph_builder.nodes()) > 1:
                lineage_result["graph_metrics"] = await self._calculate_graph_metrics(graph_builder)
                lineage_result["critical_paths"] = await self._identify_critical_paths(
                    graph_builder, root_asset_id
                )
                lineage_result["bottlenecks"] = await self._detect_bottlenecks(graph_builder)
                lineage_result["communities"] = await self._detect_communities(graph_builder)
            
            # Perform impact analysis if enabled
            if config.enable_impact_analysis:
                lineage_result["impact_analysis"] = await self._perform_impact_analysis(
                    graph_builder, root_asset_id, context
                )
            
            # Generate recommendations
            lineage_result["recommendations"] = await self._generate_lineage_recommendations(
                graph_builder, lineage_result, context
            )
            
            # Store lineage path
            await self._store_lineage_path(lineage_result, context)
            
            # Emit lineage event
            await self._emit_lineage_event(
                "lineage_built",
                {
                    "lineage_id": lineage_id,
                    "root_asset_id": root_asset_id,
                    "nodes_count": len(lineage_result["nodes"]),
                    "edges_count": len(lineage_result["edges"]),
                    "depth_reached": max([n.get("depth", 0) for n in lineage_result["nodes"]], default=0)
                },
                context
            )
            
            # Calculate processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            lineage_result["processing_time_seconds"] = processing_time
            
            logger.info(f"Lineage graph {lineage_id} built successfully in {processing_time:.2f}s")
            return lineage_result
            
        except Exception as e:
            logger.error(f"Failed to build lineage graph for {root_asset_id}: {str(e)}")
            raise

    async def _build_lineage_recursive(
        self,
        asset_id: str,
        current_depth: int,
        max_depth: int,
        direction: LineageDirection,
        visited_nodes: Set[str],
        graph_builder: nx.MultiDiGraph,
        config: LineageConfiguration,
        context: LineageContext
    ):
        """Recursively build lineage graph"""
        
        try:
            # Check depth limit
            if current_depth >= max_depth:
                return
            
            # Avoid cycles
            if asset_id in visited_nodes:
                return
            
            visited_nodes.add(asset_id)
            
            # Get asset information
            asset_info = await self._get_asset_info(asset_id, context)
            if not asset_info:
                return
            
            # Add node to graph
            graph_builder.add_node(
                asset_id,
                **asset_info,
                depth=current_depth
            )
            
            # Get relationships based on direction
            relationships = []
            
            if direction in [LineageDirection.UPSTREAM, LineageDirection.BOTH]:
                upstream_rels = await self._get_upstream_relationships(asset_id, config, context)
                relationships.extend(upstream_rels)
            
            if direction in [LineageDirection.DOWNSTREAM, LineageDirection.BOTH]:
                downstream_rels = await self._get_downstream_relationships(asset_id, config, context)
                relationships.extend(downstream_rels)
            
            # Process each relationship
            for rel in relationships:
                related_asset_id = rel["related_asset_id"]
                relationship_type = rel["relationship_type"]
                
                # Add edge to graph
                graph_builder.add_edge(
                    asset_id,
                    related_asset_id,
                    lineage_type=relationship_type,
                    **rel
                )
                
                # Recursively process related asset
                await self._build_lineage_recursive(
                    related_asset_id,
                    current_depth + 1,
                    max_depth,
                    direction,
                    visited_nodes,
                    graph_builder,
                    config,
                    context
                )
                
        except Exception as e:
            logger.error(f"Error in recursive lineage building for {asset_id}: {str(e)}")

    async def _get_upstream_relationships(
        self,
        asset_id: str,
        config: LineageConfiguration,
        context: LineageContext
    ) -> List[Dict[str, Any]]:
        """Get upstream relationships for an asset"""
        
        try:
            # Query database for upstream relationships
            stmt = select(LineageSegment).where(
                LineageSegment.target_asset_id == asset_id
            ).options(selectinload(LineageSegment.source_asset))
            
            result = await self.db.execute(stmt)
            segments = result.scalars().all()
            
            relationships = []
            for segment in segments:
                if segment.confidence_level.value >= config.confidence_threshold:
                    rel_data = {
                        "related_asset_id": segment.source_asset_id,
                        "relationship_type": segment.lineage_type,
                        "transformation_logic": segment.transformation_logic,
                        "confidence_score": segment.confidence_level.value,
                        "discovery_method": segment.discovery_method,
                        "segment_id": segment.segment_id
                    }
                    relationships.append(rel_data)
            
            return relationships
            
        except Exception as e:
            logger.error(f"Error getting upstream relationships for {asset_id}: {str(e)}")
            return []

    async def _get_downstream_relationships(
        self,
        asset_id: str,
        config: LineageConfiguration,
        context: LineageContext
    ) -> List[Dict[str, Any]]:
        """Get downstream relationships for an asset"""
        
        try:
            # Query database for downstream relationships
            stmt = select(LineageSegment).where(
                LineageSegment.source_asset_id == asset_id
            ).options(selectinload(LineageSegment.target_asset))
            
            result = await self.db.execute(stmt)
            segments = result.scalars().all()
            
            relationships = []
            for segment in segments:
                if segment.confidence_level.value >= config.confidence_threshold:
                    rel_data = {
                        "related_asset_id": segment.target_asset_id,
                        "relationship_type": segment.lineage_type,
                        "transformation_logic": segment.transformation_logic,
                        "confidence_score": segment.confidence_level.value,
                        "discovery_method": segment.discovery_method,
                        "segment_id": segment.segment_id
                    }
                    relationships.append(rel_data)
            
            return relationships
            
        except Exception as e:
            logger.error(f"Error getting downstream relationships for {asset_id}: {str(e)}")
            return []

    # ================================================================
    # IMPACT ANALYSIS
    # ================================================================

    async def analyze_impact(
        self,
        asset_id: str,
        change_type: str,
        change_details: Dict[str, Any],
        context: LineageContext = None
    ) -> ImpactAnalysisResult:
        """
        Perform comprehensive impact analysis for potential changes to an asset.
        """
        try:
            if not context:
                context = LineageContext(
                    user_id="system",
                    organization_id="default",
                    business_domain="general",
                    analysis_purpose="impact_analysis"
                )
            
            analysis_id = f"impact_{uuid4().hex[:12]}"
            start_time = datetime.utcnow()
            
            logger.info(f"Starting impact analysis {analysis_id} for asset {asset_id}")
            
            # Build downstream lineage for impact analysis
            lineage_config = LineageConfiguration(
                max_depth=15,  # Deeper analysis for impact
                enable_impact_analysis=True
            )
            
            downstream_graph = await self._build_targeted_lineage(
                asset_id, LineageDirection.DOWNSTREAM, lineage_config, context
            )
            
            # Analyze impact levels
            impacted_assets = []
            impact_levels = {"high": 0, "medium": 0, "low": 0}
            propagation_paths = []
            
            for node_id, node_data in downstream_graph.nodes(data=True):
                if node_id == asset_id:
                    continue
                
                # Calculate impact level
                impact_level = await self._calculate_impact_level(
                    asset_id, node_id, change_type, change_details, downstream_graph
                )
                
                impacted_asset = {
                    "asset_id": node_id,
                    "asset_name": node_data.get("name", node_id),
                    "asset_type": node_data.get("type", "unknown"),
                    "impact_level": impact_level,
                    "business_criticality": node_data.get("business_criticality", "medium"),
                    "estimated_effort": await self._estimate_remediation_effort(
                        node_id, impact_level, change_type
                    ),
                    "dependencies": list(downstream_graph.predecessors(node_id))
                }
                
                impacted_assets.append(impacted_asset)
                impact_levels[impact_level] += 1
            
            # Find propagation paths
            propagation_paths = await self._find_propagation_paths(
                downstream_graph, asset_id, impacted_assets
            )
            
            # Perform risk assessment
            risk_assessment = await self._assess_change_risks(
                asset_id, impacted_assets, change_type, change_details
            )
            
            # Generate mitigation recommendations
            mitigation_recommendations = await self._generate_mitigation_recommendations(
                asset_id, impacted_assets, risk_assessment, change_type
            )
            
            # Create impact analysis result
            impact_result = ImpactAnalysisResult(
                analysis_id=analysis_id,
                root_asset_id=asset_id,
                impacted_assets=impacted_assets,
                impact_levels=impact_levels,
                propagation_paths=propagation_paths,
                risk_assessment=risk_assessment,
                mitigation_recommendations=mitigation_recommendations
            )
            
            # Cache the result
            self.impact_cache[analysis_id] = impact_result
            
            # Store impact analysis
            await self._store_impact_analysis(impact_result, change_type, change_details, context)
            
            # Emit impact analysis event
            await self._emit_lineage_event(
                "impact_analyzed",
                {
                    "analysis_id": analysis_id,
                    "root_asset_id": asset_id,
                    "change_type": change_type,
                    "total_impacted": len(impacted_assets),
                    "high_impact_count": impact_levels["high"],
                    "processing_time": (datetime.utcnow() - start_time).total_seconds()
                },
                context
            )
            
            logger.info(f"Impact analysis {analysis_id} completed successfully")
            return impact_result
            
        except Exception as e:
            logger.error(f"Failed to analyze impact for {asset_id}: {str(e)}")
            raise

    async def _calculate_impact_level(
        self,
        source_asset_id: str,
        target_asset_id: str,
        change_type: str,
        change_details: Dict[str, Any],
        graph: nx.MultiDiGraph
    ) -> str:
        """Calculate impact level between source and target assets"""
        
        try:
            # Get path between assets
            try:
                path = shortest_path(graph, source_asset_id, target_asset_id)
                path_length = len(path) - 1
            except nx.NetworkXNoPath:
                return "low"
            
            # Base impact calculation
            base_impact = 1.0
            
            # Factor 1: Path distance (closer = higher impact)
            distance_factor = max(0.1, 1.0 - (path_length - 1) * 0.2)
            
            # Factor 2: Asset criticality
            target_data = graph.nodes[target_asset_id]
            criticality = target_data.get("business_criticality", "medium")
            criticality_factor = {
                "critical": 1.0,
                "high": 0.8,
                "medium": 0.6,
                "low": 0.4
            }.get(criticality, 0.6)
            
            # Factor 3: Change type severity
            change_severity = {
                "schema_change": 0.9,
                "data_deletion": 1.0,
                "system_migration": 0.8,
                "access_change": 0.5,
                "metadata_update": 0.3
            }.get(change_type, 0.6)
            
            # Factor 4: Relationship strength
            edge_data = graph.get_edge_data(source_asset_id, target_asset_id)
            if edge_data:
                # Get the first edge (in case of multi-edges)
                first_edge = list(edge_data.values())[0]
                confidence = first_edge.get("confidence_score", 0.7)
            else:
                # Find indirect connection strength
                confidence = 0.5
            
            # Calculate final impact score
            impact_score = (
                base_impact * 
                distance_factor * 
                criticality_factor * 
                change_severity * 
                confidence
            )
            
            # Classify impact level
            if impact_score >= 0.7:
                return "high"
            elif impact_score >= 0.4:
                return "medium"
            else:
                return "low"
                
        except Exception as e:
            logger.error(f"Error calculating impact level: {str(e)}")
            return "medium"  # Default to medium on error

    # ================================================================
    # GRAPH ANALYTICS
    # ================================================================

    async def perform_graph_analysis(
        self,
        analysis_types: List[GraphAnalysisType],
        asset_filter: Dict[str, Any] = None,
        context: LineageContext = None
    ) -> Dict[str, Any]:
        """Perform comprehensive graph analysis on the lineage graph"""
        
        try:
            if not context:
                context = LineageContext(
                    user_id="system",
                    organization_id="default",
                    business_domain="general",
                    analysis_purpose="graph_analysis"
                )
            
            analysis_id = f"graph_analysis_{uuid4().hex[:12]}"
            start_time = datetime.utcnow()
            
            logger.info(f"Starting graph analysis {analysis_id}")
            
            # Get working graph (filtered if specified)
            working_graph = await self._get_filtered_graph(asset_filter, context)
            
            analysis_results = {
                "analysis_id": analysis_id,
                "analysis_types": [at.value for at in analysis_types],
                "graph_summary": {
                    "total_nodes": working_graph.number_of_nodes(),
                    "total_edges": working_graph.number_of_edges(),
                    "is_connected": nx.is_connected(working_graph.to_undirected())
                },
                "results": {}
            }
            
            # Perform requested analyses
            for analysis_type in analysis_types:
                try:
                    if analysis_type == GraphAnalysisType.CENTRALITY:
                        analysis_results["results"]["centrality"] = await self._analyze_centrality(working_graph)
                    
                    elif analysis_type == GraphAnalysisType.CLUSTERING:
                        analysis_results["results"]["clustering"] = await self._analyze_clustering(working_graph)
                    
                    elif analysis_type == GraphAnalysisType.PATH_ANALYSIS:
                        analysis_results["results"]["path_analysis"] = await self._analyze_paths(working_graph)
                    
                    elif analysis_type == GraphAnalysisType.BOTTLENECK_DETECTION:
                        analysis_results["results"]["bottlenecks"] = await self._detect_bottlenecks(working_graph)
                    
                    elif analysis_type == GraphAnalysisType.CRITICAL_PATH:
                        analysis_results["results"]["critical_paths"] = await self._find_critical_paths(working_graph)
                    
                    elif analysis_type == GraphAnalysisType.COMMUNITY_DETECTION:
                        analysis_results["results"]["communities"] = await self._detect_communities(working_graph)
                
                except Exception as e:
                    logger.error(f"Error in {analysis_type.value} analysis: {str(e)}")
                    analysis_results["results"][analysis_type.value] = {"error": str(e)}
            
            # Generate insights and recommendations
            analysis_results["insights"] = await self._generate_graph_insights(
                analysis_results["results"], working_graph
            )
            
            # Calculate processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            analysis_results["processing_time_seconds"] = processing_time
            
            # Store analysis results
            await self._store_graph_analysis(analysis_results, context)
            
            logger.info(f"Graph analysis {analysis_id} completed in {processing_time:.2f}s")
            return analysis_results
            
        except Exception as e:
            logger.error(f"Failed to perform graph analysis: {str(e)}")
            raise

    async def _analyze_centrality(self, graph: nx.MultiDiGraph) -> Dict[str, Any]:
        """Analyze centrality measures in the graph"""
        
        try:
            # Convert to simple graph for centrality calculations
            simple_graph = nx.Graph()
            simple_graph.add_nodes_from(graph.nodes(data=True))
            simple_graph.add_edges_from(graph.edges())
            
            centrality_results = {}
            
            # Degree centrality
            degree_centrality = centrality.degree_centrality(simple_graph)
            centrality_results["degree_centrality"] = {
                "top_10": sorted(degree_centrality.items(), key=lambda x: x[1], reverse=True)[:10],
                "average": np.mean(list(degree_centrality.values())),
                "max": max(degree_centrality.values()) if degree_centrality else 0
            }
            
            # Betweenness centrality (for connected components)
            if nx.is_connected(simple_graph):
                betweenness = centrality.betweenness_centrality(simple_graph)
                centrality_results["betweenness_centrality"] = {
                    "top_10": sorted(betweenness.items(), key=lambda x: x[1], reverse=True)[:10],
                    "average": np.mean(list(betweenness.values())),
                    "max": max(betweenness.values()) if betweenness else 0
                }
            
            # Closeness centrality
            if nx.is_connected(simple_graph):
                closeness = centrality.closeness_centrality(simple_graph)
                centrality_results["closeness_centrality"] = {
                    "top_10": sorted(closeness.items(), key=lambda x: x[1], reverse=True)[:10],
                    "average": np.mean(list(closeness.values())),
                    "max": max(closeness.values()) if closeness else 0
                }
            
            # PageRank (for directed graph)
            if graph.number_of_nodes() > 0:
                pagerank = nx.pagerank(graph)
                centrality_results["pagerank"] = {
                    "top_10": sorted(pagerank.items(), key=lambda x: x[1], reverse=True)[:10],
                    "average": np.mean(list(pagerank.values())),
                    "max": max(pagerank.values()) if pagerank else 0
                }
            
            return centrality_results
            
        except Exception as e:
            logger.error(f"Error in centrality analysis: {str(e)}")
            return {"error": str(e)}

    async def _detect_communities(self, graph: nx.MultiDiGraph) -> Dict[str, Any]:
        """Detect communities in the graph"""
        
        try:
            # Convert to undirected graph for community detection
            undirected_graph = graph.to_undirected()
            
            if undirected_graph.number_of_nodes() < 2:
                return {"communities": [], "modularity": 0.0}
            
            # Use Louvain method for community detection
            communities_generator = community.greedy_modularity_communities(undirected_graph)
            communities_list = list(communities_generator)
            
            # Calculate modularity
            try:
                modularity_score = community.modularity(undirected_graph, communities_list)
            except:
                modularity_score = 0.0
            
            # Format communities
            formatted_communities = []
            for i, comm in enumerate(communities_list):
                community_data = {
                    "community_id": i,
                    "size": len(comm),
                    "nodes": list(comm),
                    "internal_edges": undirected_graph.subgraph(comm).number_of_edges(),
                    "representative_nodes": await self._get_community_representatives(comm, undirected_graph)
                }
                formatted_communities.append(community_data)
            
            return {
                "communities": formatted_communities,
                "total_communities": len(communities_list),
                "modularity": modularity_score,
                "largest_community_size": max([len(c) for c in communities_list]) if communities_list else 0
            }
            
        except Exception as e:
            logger.error(f"Error in community detection: {str(e)}")
            return {"error": str(e)}

    # ================================================================
    # REAL-TIME MONITORING
    # ================================================================

    async def start_real_time_tracking(
        self,
        asset_ids: List[str],
        tracking_config: Dict[str, Any],
        context: LineageContext
    ) -> str:
        """Start real-time lineage tracking for specified assets"""
        
        try:
            tracking_id = f"track_{uuid4().hex[:12]}"
            
            tracking_session = {
                "tracking_id": tracking_id,
                "asset_ids": asset_ids,
                "config": tracking_config,
                "context": context,
                "start_time": datetime.utcnow(),
                "status": "active",
                "events_captured": 0,
                "last_activity": datetime.utcnow()
            }
            
            self.active_tracking_sessions[tracking_id] = tracking_session
            
            # Start monitoring task
            monitoring_task = asyncio.create_task(
                self._monitor_assets_real_time(tracking_id, asset_ids, tracking_config)
            )
            self.background_tasks.append(monitoring_task)
            
            logger.info(f"Started real-time tracking {tracking_id} for {len(asset_ids)} assets")
            return tracking_id
            
        except Exception as e:
            logger.error(f"Failed to start real-time tracking: {str(e)}")
            raise

    async def _monitor_assets_real_time(
        self,
        tracking_id: str,
        asset_ids: List[str],
        config: Dict[str, Any]
    ):
        """Monitor assets for real-time lineage changes"""
        
        try:
            monitoring_interval = config.get("monitoring_interval", 30)  # seconds
            
            while tracking_id in self.active_tracking_sessions:
                try:
                    # Check for changes in each asset
                    for asset_id in asset_ids:
                        changes = await self._detect_asset_changes(asset_id, config)
                        
                        if changes:
                            # Process detected changes
                            await self._process_lineage_changes(tracking_id, asset_id, changes)
                            
                            # Update tracking session
                            session = self.active_tracking_sessions[tracking_id]
                            session["events_captured"] += len(changes)
                            session["last_activity"] = datetime.utcnow()
                    
                    # Wait for next monitoring cycle
                    await asyncio.sleep(monitoring_interval)
                    
                except Exception as e:
                    logger.error(f"Error in real-time monitoring for {tracking_id}: {str(e)}")
                    await asyncio.sleep(monitoring_interval)
        
        except asyncio.CancelledError:
            logger.info(f"Real-time monitoring for {tracking_id} cancelled")
        except Exception as e:
            logger.error(f"Real-time monitoring failed for {tracking_id}: {str(e)}")

    async def _detect_asset_changes(
        self,
        asset_id: str,
        config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Detect changes in an asset"""
        
        changes = []
        
        try:
            # This would integrate with actual data systems to detect changes
            # For demo purposes, we'll simulate change detection
            
            # Check for schema changes
            if config.get("detect_schema_changes", True):
                schema_changes = await self._check_schema_changes(asset_id)
                changes.extend(schema_changes)
            
            # Check for data changes
            if config.get("detect_data_changes", True):
                data_changes = await self._check_data_changes(asset_id)
                changes.extend(data_changes)
            
            # Check for relationship changes
            if config.get("detect_relationship_changes", True):
                relationship_changes = await self._check_relationship_changes(asset_id)
                changes.extend(relationship_changes)
            
            return changes
            
        except Exception as e:
            logger.error(f"Error detecting changes for asset {asset_id}: {str(e)}")
            return changes

    # ================================================================
    # UTILITY AND HELPER METHODS
    # ================================================================

    async def _get_asset_info(self, asset_id: str, context: LineageContext) -> Dict[str, Any]:
        """Get comprehensive asset information"""
        
        try:
            # Query catalog for asset information
            stmt = select(AdvancedCatalogEntry).where(
                AdvancedCatalogEntry.catalog_entry_id == asset_id
            )
            
            result = await self.db.execute(stmt)
            catalog_entry = result.scalar_one_or_none()
            
            if catalog_entry:
                return {
                    "name": catalog_entry.name,
                    "type": catalog_entry.entry_type.value,
                    "status": catalog_entry.status.value,
                    "business_criticality": catalog_entry.business_criticality.value if catalog_entry.business_criticality else "medium",
                    "quality_score": catalog_entry.quality_score or 0.0,
                    "last_updated": catalog_entry.updated_at or catalog_entry.created_at,
                    "data_classification": catalog_entry.data_classification or [],
                    "stewardship_info": catalog_entry.stewardship_info or {}
                }
            else:
                # Return basic info if not in catalog
                return {
                    "name": asset_id,
                    "type": "unknown",
                    "status": "active",
                    "business_criticality": "medium",
                    "quality_score": 0.5,
                    "last_updated": datetime.utcnow(),
                    "data_classification": [],
                    "stewardship_info": {}
                }
                
        except Exception as e:
            logger.error(f"Error getting asset info for {asset_id}: {str(e)}")
            return {
                "name": asset_id,
                "type": "unknown",
                "status": "active", 
                "business_criticality": "medium",
                "quality_score": 0.5,
                "last_updated": datetime.utcnow(),
                "data_classification": [],
                "stewardship_info": {}
            }

    async def _emit_lineage_event(
        self,
        event_type: str,
        event_data: Dict[str, Any],
        context: LineageContext
    ):
        """Emit lineage-related events"""
        try:
            event = {
                "event_id": f"evt_{uuid4().hex[:8]}",
                "event_type": event_type,
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": context.user_id,
                "organization_id": context.organization_id,
                "business_domain": context.business_domain,
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
            logger.error(f"Failed to emit lineage event: {str(e)}")

    def register_event_handler(self, event_type: str, handler):
        """Register an event handler for lineage events"""
        self.event_handlers[event_type].append(handler)

    async def get_lineage_metrics(self, time_range: Tuple[datetime, datetime] = None) -> Dict[str, Any]:
        """Get comprehensive lineage metrics"""
        try:
            if not time_range:
                end_time = datetime.utcnow()
                start_time = end_time - timedelta(days=7)
                time_range = (start_time, end_time)
            
            # Query lineage segments within time range
            stmt = select(LineageSegment).where(
                and_(
                    LineageSegment.created_at >= time_range[0],
                    LineageSegment.created_at <= time_range[1]
                )
            )
            
            result = await self.db.execute(stmt)
            segments = result.scalars().all()
            
            # Calculate metrics
            metrics = {
                "time_range": {
                    "start": time_range[0].isoformat(),
                    "end": time_range[1].isoformat()
                },
                "lineage_segments": {
                    "total": len(segments),
                    "by_type": Counter([s.lineage_type.value for s in segments]),
                    "by_discovery_method": Counter([s.discovery_method.value for s in segments]),
                    "by_confidence": Counter([s.confidence_level.value for s in segments])
                },
                "graph_metrics": {
                    "total_nodes": self.lineage_graph.number_of_nodes(),
                    "total_edges": self.lineage_graph.number_of_edges(),
                    "average_degree": (2 * self.lineage_graph.number_of_edges()) / max(1, self.lineage_graph.number_of_nodes())
                },
                "performance_metrics": {
                    "average_analysis_time": np.mean(self.performance_metrics.get("analysis_times", [5.0])),
                    "cache_hit_rate": len(self.graph_cache) / max(1, len(self.analysis_history)),
                    "active_tracking_sessions": len(self.active_tracking_sessions)
                }
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Failed to get lineage metrics: {str(e)}")
            return {"error": str(e)}

    def _start_background_monitoring(self):
        """Start background monitoring tasks"""
        try:
            self.monitoring_enabled = True
            
            # Start cache cleanup task
            cleanup_task = asyncio.create_task(self._cache_cleanup_loop())
            self.background_tasks.append(cleanup_task)
            
            # Start metrics collection task
            metrics_task = asyncio.create_task(self._metrics_collection_loop())
            self.background_tasks.append(metrics_task)
            
            logger.info("Background monitoring started")
        except Exception as e:
            logger.error(f"Failed to start background monitoring: {str(e)}")

    async def _cache_cleanup_loop(self):
        """Periodic cache cleanup"""
        while self.monitoring_enabled:
            try:
                # Clean up old cache entries
                current_time = datetime.utcnow()
                
                # Clean graph cache (keep last 100 entries)
                if len(self.graph_cache) > 100:
                    # Remove oldest entries
                    sorted_keys = sorted(self.graph_cache.keys())
                    for key in sorted_keys[:-100]:
                        del self.graph_cache[key]
                
                # Clean impact cache (keep last 50 entries)
                if len(self.impact_cache) > 50:
                    sorted_keys = sorted(self.impact_cache.keys())
                    for key in sorted_keys[:-50]:
                        del self.impact_cache[key]
                
                # Wait for next cleanup cycle (1 hour)
                await asyncio.sleep(3600)
                
            except Exception as e:
                logger.error(f"Error in cache cleanup: {str(e)}")
                await asyncio.sleep(3600)

    async def shutdown(self):
        """Gracefully shutdown the lineage service"""
        try:
            logger.info("Shutting down Advanced Lineage Service")
            
            # Stop monitoring
            self.monitoring_enabled = False
            self.shutdown_event.set()
            
            # Cancel background tasks
            for task in self.background_tasks:
                task.cancel()
            
            # Wait for tasks to complete
            if self.background_tasks:
                await asyncio.gather(*self.background_tasks, return_exceptions=True)
            
            # Shutdown thread pool
            if hasattr(self, 'thread_pool'):
                self.thread_pool.shutdown(wait=False)
            
            logger.info("Advanced Lineage Service shutdown completed")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {str(e)}")

    def __del__(self):
        """Cleanup when service is destroyed"""
        try:
            if hasattr(self, 'thread_pool'):
                self.thread_pool.shutdown(wait=False)
        except Exception:
            pass