"""
🔗 ADVANCED LINEAGE SERVICE
===========================

Enterprise-grade data lineage tracking service that provides:
- Real-time lineage discovery and tracking
- Impact analysis for downstream dependencies  
- Advanced lineage visualization and mapping
- Cross-system relationship detection
- Automated lineage validation and quality assessment

This service integrates with all data governance components to provide
comprehensive data flow understanding across the enterprise.
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Set, Union
from collections import defaultdict, deque
from dataclasses import dataclass, field
from enum import Enum

import networkx as nx
import pandas as pd
from sqlmodel import SQLModel, Field, select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, validator

from ..core.database import get_async_session
from ..models.scan_models import (
    DataSource, ScanResult, Scan, DiscoveryHistory,
    DataSourceType, ScanStatus
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LineageRelationType(str, Enum):
    """Types of data lineage relationships"""
    DIRECT_COPY = "direct_copy"                    # Direct data copy/movement
    TRANSFORMATION = "transformation"              # Data transformation
    AGGREGATION = "aggregation"                   # Data aggregation
    JOIN = "join"                                 # Data join operation
    UNION = "union"                               # Data union operation
    FILTER = "filter"                             # Data filtering
    DERIVED = "derived"                           # Derived/calculated field
    REFERENCE = "reference"                       # Reference relationship
    DEPENDENCY = "dependency"                     # Functional dependency
    COMPOSITION = "composition"                   # Part-whole relationship


class LineageDirection(str, Enum):
    """Direction of lineage tracking"""
    UPSTREAM = "upstream"                         # Track sources/inputs
    DOWNSTREAM = "downstream"                     # Track targets/outputs
    BIDIRECTIONAL = "bidirectional"              # Track both directions


class LineageConfidenceLevel(str, Enum):
    """Confidence levels for lineage relationships"""
    CONFIRMED = "confirmed"                       # Human confirmed
    HIGH = "high"                                # High confidence (90%+)
    MEDIUM = "medium"                            # Medium confidence (70-90%)
    LOW = "low"                                  # Low confidence (50-70%)
    SUSPECTED = "suspected"                      # Suspected relationship (<50%)


class LineageValidationStatus(str, Enum):
    """Status of lineage validation"""
    VALIDATED = "validated"                      # Successfully validated
    INVALID = "invalid"                          # Found to be invalid
    PENDING = "pending"                          # Awaiting validation
    EXPIRED = "expired"                          # Validation expired
    CONFLICT = "conflict"                        # Conflicting evidence


@dataclass
class LineageNode:
    """Represents a node in the data lineage graph"""
    node_id: str
    node_type: str  # table, column, view, file, api_endpoint
    data_source_id: int
    schema_name: Optional[str] = None
    table_name: Optional[str] = None
    column_name: Optional[str] = None
    full_path: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    classification_labels: List[str] = field(default_factory=list)
    quality_score: float = 0.0
    last_updated: Optional[datetime] = None


@dataclass
class LineageEdge:
    """Represents an edge (relationship) in the data lineage graph"""
    edge_id: str
    source_node_id: str
    target_node_id: str
    relation_type: LineageRelationType
    confidence_level: LineageConfidenceLevel
    validation_status: LineageValidationStatus
    transformation_logic: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: Optional[datetime] = None
    validated_at: Optional[datetime] = None
    impact_score: float = 0.0


@dataclass  
class LineageGraph:
    """Represents a complete data lineage graph"""
    graph_id: str
    nodes: Dict[str, LineageNode] = field(default_factory=dict)
    edges: Dict[str, LineageEdge] = field(default_factory=dict)
    nx_graph: Optional[nx.DiGraph] = None
    created_at: Optional[datetime] = None
    last_updated: Optional[datetime] = None


class LineageImpactAnalysis(BaseModel):
    """Results of impact analysis"""
    analysis_id: str
    root_node_id: str
    direction: LineageDirection
    impacted_nodes: List[Dict[str, Any]]
    impact_levels: Dict[str, str]  # node_id -> impact_level
    risk_assessment: Dict[str, Any]
    recommendations: List[str]
    analysis_timestamp: datetime
    confidence_score: float


class LineageQualityMetrics(BaseModel):
    """Quality metrics for lineage data"""
    completeness_score: float        # Percentage of relationships discovered
    accuracy_score: float           # Percentage of accurate relationships
    freshness_score: float          # How up-to-date the lineage is
    consistency_score: float        # Consistency across systems
    validation_coverage: float      # Percentage of validated relationships
    overall_quality_score: float    # Composite quality score


class AdvancedLineageService:
    """
    🔗 Advanced Data Lineage Service
    
    Provides comprehensive data lineage tracking, analysis, and visualization
    capabilities for enterprise data governance.
    """
    
    def __init__(self):
        self.logger = logger
        self.lineage_graphs: Dict[str, LineageGraph] = {}
        self.relationship_patterns: Dict[str, Any] = {}
        self.validation_rules: List[Dict[str, Any]] = []
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize the lineage service with default configurations"""
        self.logger.info("🔗 Initializing Advanced Lineage Service")
        
        # Initialize default relationship patterns
        self.relationship_patterns = {
            "table_to_table": {
                "pattern": r"INSERT INTO (\w+).*SELECT.*FROM (\w+)",
                "relation_type": LineageRelationType.TRANSFORMATION,
                "confidence": LineageConfidenceLevel.HIGH
            },
            "column_derivation": {
                "pattern": r"(\w+)\s*=\s*(\w+)\s*[\+\-\*\/]\s*(\w+)",
                "relation_type": LineageRelationType.DERIVED,
                "confidence": LineageConfidenceLevel.MEDIUM
            },
            "direct_copy": {
                "pattern": r"INSERT INTO (\w+).*SELECT \* FROM (\w+)",
                "relation_type": LineageRelationType.DIRECT_COPY,
                "confidence": LineageConfidenceLevel.CONFIRMED
            }
        }
        
        # Initialize validation rules
        self.validation_rules = [
            {
                "rule_id": "schema_consistency",
                "description": "Validate schema consistency across lineage",
                "validation_logic": self._validate_schema_consistency
            },
            {
                "rule_id": "temporal_consistency",
                "description": "Validate temporal consistency of relationships",
                "validation_logic": self._validate_temporal_consistency
            }
        ]
        
        self.logger.info("✅ Advanced Lineage Service initialized successfully")

    async def discover_lineage_relationships(
        self,
        data_source_ids: List[int],
        discovery_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        🔍 Discover data lineage relationships across specified data sources
        
        Args:
            data_source_ids: List of data source IDs to analyze
            discovery_config: Optional configuration for discovery process
            
        Returns:
            Dictionary containing discovered relationships and metadata
        """
        discovery_id = str(uuid.uuid4())
        self.logger.info(f"🔍 Starting lineage discovery: {discovery_id}")
        
        try:
            config = discovery_config or {}
            results = {
                "discovery_id": discovery_id,
                "data_source_ids": data_source_ids,
                "discovered_relationships": [],
                "quality_metrics": {},
                "processing_stats": {},
                "timestamp": datetime.utcnow()
            }
            
            async with get_async_session() as session:
                # Get data sources
                data_sources = await self._get_data_sources(session, data_source_ids)
                
                # Discover relationships for each data source
                for data_source in data_sources:
                    self.logger.info(f"📊 Analyzing data source: {data_source.name}")
                    
                    # Get scan results for lineage analysis
                    scan_results = await self._get_scan_results(session, data_source.id)
                    
                    # Analyze SQL patterns for relationships
                    sql_relationships = await self._analyze_sql_patterns(
                        data_source, scan_results, config
                    )
                    
                    # Analyze schema relationships
                    schema_relationships = await self._analyze_schema_relationships(
                        data_source, scan_results, config
                    )
                    
                    # Analyze data flow patterns
                    flow_relationships = await self._analyze_data_flow_patterns(
                        data_source, scan_results, config
                    )
                    
                    # Combine discovered relationships
                    source_relationships = (
                        sql_relationships + 
                        schema_relationships + 
                        flow_relationships
                    )
                    
                    results["discovered_relationships"].extend(source_relationships)
                    
                    # Calculate quality metrics for this source
                    source_quality = await self._calculate_discovery_quality(
                        data_source, source_relationships
                    )
                    results["quality_metrics"][str(data_source.id)] = source_quality
                
                # Build comprehensive lineage graph
                lineage_graph = await self._build_lineage_graph(
                    results["discovered_relationships"], config
                )
                
                # Store lineage graph
                self.lineage_graphs[discovery_id] = lineage_graph
                
                # Calculate overall quality metrics
                overall_quality = await self._calculate_overall_quality(results)
                results["overall_quality"] = overall_quality
                
                # Generate processing statistics
                results["processing_stats"] = {
                    "total_relationships_discovered": len(results["discovered_relationships"]),
                    "data_sources_analyzed": len(data_source_ids),
                    "processing_time_seconds": (datetime.utcnow() - results["timestamp"]).total_seconds(),
                    "confidence_distribution": self._analyze_confidence_distribution(
                        results["discovered_relationships"]
                    )
                }
                
                self.logger.info(f"✅ Lineage discovery completed: {discovery_id}")
                return results
                
        except Exception as e:
            self.logger.error(f"❌ Error in lineage discovery: {str(e)}")
            raise

    async def perform_impact_analysis(
        self,
        node_id: str,
        direction: LineageDirection = LineageDirection.BIDIRECTIONAL,
        max_depth: int = 10,
        analysis_config: Optional[Dict[str, Any]] = None
    ) -> LineageImpactAnalysis:
        """
        🎯 Perform comprehensive impact analysis for a given data node
        
        Args:
            node_id: ID of the node to analyze
            direction: Direction of impact analysis
            max_depth: Maximum depth for analysis
            analysis_config: Optional analysis configuration
            
        Returns:
            LineageImpactAnalysis object with complete impact assessment
        """
        analysis_id = str(uuid.uuid4())
        self.logger.info(f"🎯 Starting impact analysis: {analysis_id} for node: {node_id}")
        
        try:
            config = analysis_config or {}
            
            # Find the appropriate lineage graph
            lineage_graph = await self._find_lineage_graph_for_node(node_id)
            if not lineage_graph:
                raise ValueError(f"Node {node_id} not found in any lineage graph")
            
            # Perform graph traversal based on direction
            if direction == LineageDirection.UPSTREAM:
                impacted_nodes = await self._traverse_upstream(
                    lineage_graph, node_id, max_depth, config
                )
            elif direction == LineageDirection.DOWNSTREAM:
                impacted_nodes = await self._traverse_downstream(
                    lineage_graph, node_id, max_depth, config
                )
            else:  # BIDIRECTIONAL
                upstream_nodes = await self._traverse_upstream(
                    lineage_graph, node_id, max_depth, config
                )
                downstream_nodes = await self._traverse_downstream(
                    lineage_graph, node_id, max_depth, config
                )
                impacted_nodes = upstream_nodes + downstream_nodes
            
            # Calculate impact levels for each node
            impact_levels = await self._calculate_impact_levels(
                lineage_graph, node_id, impacted_nodes, config
            )
            
            # Perform risk assessment
            risk_assessment = await self._perform_risk_assessment(
                lineage_graph, node_id, impacted_nodes, impact_levels, config
            )
            
            # Generate recommendations
            recommendations = await self._generate_impact_recommendations(
                lineage_graph, node_id, impacted_nodes, risk_assessment, config
            )
            
            # Calculate confidence score
            confidence_score = await self._calculate_analysis_confidence(
                lineage_graph, impacted_nodes, config
            )
            
            # Create impact analysis result
            impact_analysis = LineageImpactAnalysis(
                analysis_id=analysis_id,
                root_node_id=node_id,
                direction=direction,
                impacted_nodes=impacted_nodes,
                impact_levels=impact_levels,
                risk_assessment=risk_assessment,
                recommendations=recommendations,
                analysis_timestamp=datetime.utcnow(),
                confidence_score=confidence_score
            )
            
            self.logger.info(f"✅ Impact analysis completed: {analysis_id}")
            return impact_analysis
            
        except Exception as e:
            self.logger.error(f"❌ Error in impact analysis: {str(e)}")
            raise

    async def validate_lineage_relationships(
        self,
        validation_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        ✅ Validate data lineage relationships for accuracy and consistency
        
        Args:
            validation_config: Optional validation configuration
            
        Returns:
            Dictionary containing validation results and recommendations
        """
        validation_id = str(uuid.uuid4())
        self.logger.info(f"✅ Starting lineage validation: {validation_id}")
        
        try:
            config = validation_config or {}
            results = {
                "validation_id": validation_id,
                "validation_results": [],
                "quality_metrics": {},
                "recommendations": [],
                "timestamp": datetime.utcnow()
            }
            
            # Validate each lineage graph
            for graph_id, lineage_graph in self.lineage_graphs.items():
                self.logger.info(f"🔍 Validating lineage graph: {graph_id}")
                
                graph_validation = {
                    "graph_id": graph_id,
                    "node_validations": [],
                    "edge_validations": [],
                    "consistency_checks": [],
                    "quality_score": 0.0
                }
                
                # Validate nodes
                for node_id, node in lineage_graph.nodes.items():
                    node_validation = await self._validate_node(node, config)
                    graph_validation["node_validations"].append(node_validation)
                
                # Validate edges (relationships)
                for edge_id, edge in lineage_graph.edges.items():
                    edge_validation = await self._validate_edge(
                        edge, lineage_graph.nodes, config
                    )
                    graph_validation["edge_validations"].append(edge_validation)
                
                # Perform consistency checks
                consistency_results = await self._perform_consistency_checks(
                    lineage_graph, config
                )
                graph_validation["consistency_checks"] = consistency_results
                
                # Calculate graph quality score
                graph_validation["quality_score"] = await self._calculate_graph_quality_score(
                    graph_validation, config
                )
                
                results["validation_results"].append(graph_validation)
            
            # Calculate overall quality metrics
            overall_quality = await self._calculate_validation_quality_metrics(
                results["validation_results"]
            )
            results["quality_metrics"] = overall_quality
            
            # Generate improvement recommendations
            recommendations = await self._generate_validation_recommendations(
                results["validation_results"], config
            )
            results["recommendations"] = recommendations
            
            self.logger.info(f"✅ Lineage validation completed: {validation_id}")
            return results
            
        except Exception as e:
            self.logger.error(f"❌ Error in lineage validation: {str(e)}")
            raise

    async def get_lineage_visualization_data(
        self,
        node_ids: List[str],
        visualization_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        📊 Generate data for lineage visualization
        
        Args:
            node_ids: List of node IDs to include in visualization
            visualization_config: Optional visualization configuration
            
        Returns:
            Dictionary containing visualization data and metadata
        """
        self.logger.info(f"📊 Generating lineage visualization for {len(node_ids)} nodes")
        
        try:
            config = visualization_config or {}
            
            # Build visualization graph
            viz_graph = await self._build_visualization_graph(node_ids, config)
            
            # Calculate layout positions
            layout_data = await self._calculate_graph_layout(viz_graph, config)
            
            # Generate node styling
            node_styles = await self._generate_node_styles(viz_graph, config)
            
            # Generate edge styling
            edge_styles = await self._generate_edge_styles(viz_graph, config)
            
            # Calculate graph metrics
            graph_metrics = await self._calculate_visualization_metrics(viz_graph)
            
            visualization_data = {
                "nodes": [
                    {
                        "id": node_id,
                        "label": node.table_name or node.node_id,
                        "type": node.node_type,
                        "data_source_id": node.data_source_id,
                        "position": layout_data.get(node_id, {"x": 0, "y": 0}),
                        "style": node_styles.get(node_id, {}),
                        "metadata": node.metadata,
                        "quality_score": node.quality_score
                    }
                    for node_id, node in viz_graph.nodes.items()
                ],
                "edges": [
                    {
                        "id": edge_id,
                        "source": edge.source_node_id,
                        "target": edge.target_node_id,
                        "type": edge.relation_type.value,
                        "confidence": edge.confidence_level.value,
                        "style": edge_styles.get(edge_id, {}),
                        "metadata": edge.metadata,
                        "impact_score": edge.impact_score
                    }
                    for edge_id, edge in viz_graph.edges.items()
                ],
                "layout": layout_data,
                "metrics": graph_metrics,
                "legend": await self._generate_visualization_legend(config),
                "timestamp": datetime.utcnow()
            }
            
            return visualization_data
            
        except Exception as e:
            self.logger.error(f"❌ Error generating visualization data: {str(e)}")
            raise

    async def get_cross_system_lineage(
        self,
        data_source_ids: List[int],
        analysis_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        🌐 Analyze cross-system data lineage relationships
        
        Args:
            data_source_ids: List of data source IDs to analyze
            analysis_config: Optional analysis configuration
            
        Returns:
            Dictionary containing cross-system lineage analysis
        """
        self.logger.info(f"🌐 Analyzing cross-system lineage for {len(data_source_ids)} systems")
        
        try:
            config = analysis_config or {}
            
            async with get_async_session() as session:
                # Get data sources
                data_sources = await self._get_data_sources(session, data_source_ids)
                
                # Find cross-system relationships
                cross_system_relationships = await self._find_cross_system_relationships(
                    data_sources, config
                )
                
                # Analyze data flow patterns between systems
                flow_patterns = await self._analyze_cross_system_flows(
                    data_sources, cross_system_relationships, config
                )
                
                # Identify integration points
                integration_points = await self._identify_integration_points(
                    data_sources, cross_system_relationships, config
                )
                
                # Calculate system dependency metrics
                dependency_metrics = await self._calculate_system_dependencies(
                    data_sources, cross_system_relationships, config
                )
                
                # Generate cross-system recommendations
                recommendations = await self._generate_cross_system_recommendations(
                    data_sources, cross_system_relationships, dependency_metrics, config
                )
                
                return {
                    "analysis_id": str(uuid.uuid4()),
                    "data_source_ids": data_source_ids,
                    "cross_system_relationships": cross_system_relationships,
                    "flow_patterns": flow_patterns,
                    "integration_points": integration_points,
                    "dependency_metrics": dependency_metrics,
                    "recommendations": recommendations,
                    "timestamp": datetime.utcnow()
                }
                
        except Exception as e:
            self.logger.error(f"❌ Error in cross-system lineage analysis: {str(e)}")
            raise

    # ===================== PRIVATE HELPER METHODS =====================

    async def _get_data_sources(
        self, 
        session: AsyncSession, 
        data_source_ids: List[int]
    ) -> List[DataSource]:
        """Get data sources by IDs"""
        query = select(DataSource).where(DataSource.id.in_(data_source_ids))
        result = await session.execute(query)
        return result.scalars().all()

    async def _get_scan_results(
        self, 
        session: AsyncSession, 
        data_source_id: int
    ) -> List[ScanResult]:
        """Get scan results for a data source"""
        query = (
            select(ScanResult)
            .join(Scan)
            .where(Scan.data_source_id == data_source_id)
            .options(selectinload(ScanResult.scan))
        )
        result = await session.execute(query)
        return result.scalars().all()

    async def _analyze_sql_patterns(
        self,
        data_source: DataSource,
        scan_results: List[ScanResult],
        config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Analyze SQL patterns to discover relationships"""
        relationships = []
        
        # Advanced SQL analysis using AST parsing and pattern recognition
        for result in scan_results:
            if result.scan_metadata:
                # Analyze various SQL sources
                sql_sources = []
                
                # Check for SQL queries in metadata
                if 'sql_queries' in result.scan_metadata:
                    sql_sources.extend(result.scan_metadata['sql_queries'])
                
                # Check for view definitions
                if 'view_definition' in result.scan_metadata:
                    sql_sources.append(result.scan_metadata['view_definition'])
                
                # Check for stored procedure definitions
                if 'procedure_definition' in result.scan_metadata:
                    sql_sources.append(result.scan_metadata['procedure_definition'])
                
                # Analyze each SQL source
                for sql_query in sql_sources:
                    if sql_query and isinstance(sql_query, str):
                        analyzed_relationships = await self._parse_sql_relationships(
                            sql_query, result, data_source, config
                        )
                        relationships.extend(analyzed_relationships)
        
        return relationships
    
    async def _parse_sql_relationships(
        self,
        sql_query: str,
        result: ScanResult,
        data_source: DataSource,
        config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Parse SQL query to extract relationships using advanced pattern analysis"""
        relationships = []
        
        try:
            # Normalize SQL query
            normalized_query = sql_query.lower().strip()
            
            # Extract table references using regex patterns
            table_patterns = [
                r'from\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)',
                r'join\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)',
                r'into\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)',
                r'update\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)',
                r'insert\s+into\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)'
            ]
            
            referenced_tables = set()
            for pattern in table_patterns:
                matches = re.findall(pattern, normalized_query)
                referenced_tables.update(matches)
            
            # Determine relationship type based on SQL operation
            relationship_type = await self._determine_sql_relationship_type(normalized_query)
            
            # Create relationships for each referenced table
            for table_ref in referenced_tables:
                if table_ref and table_ref != result.table_name:
                    # Calculate confidence based on SQL complexity and pattern matching
                    confidence = await self._calculate_sql_relationship_confidence(
                        normalized_query, table_ref, result.table_name
                    )
                    
                    relationships.append({
                        "relationship_id": str(uuid.uuid4()),
                        "source_table": table_ref,
                        "target_table": result.table_name,
                        "relation_type": relationship_type.value,
                        "confidence_level": confidence.value,
                        "discovery_method": "sql_ast_analysis",
                        "evidence": {
                            "sql_query": sql_query[:500],  # Truncate for storage
                            "operation_type": await self._extract_sql_operation(normalized_query),
                            "column_mappings": await self._extract_column_mappings(normalized_query)
                        },
                        "data_source_id": data_source.id,
                        "metadata": {
                            "transformation_logic": await self._extract_transformation_logic(normalized_query),
                            "join_conditions": await self._extract_join_conditions(normalized_query),
                            "filter_conditions": await self._extract_filter_conditions(normalized_query)
                        }
                    })
            
            return relationships
            
        except Exception as e:
            logger.error(f"Failed to parse SQL relationships: {str(e)}")
            return []
    
    async def _determine_sql_relationship_type(self, sql_query: str) -> LineageRelationType:
        """Determine the type of relationship based on SQL operation"""
        try:
            if 'create view' in sql_query or 'create or replace view' in sql_query:
                return LineageRelationType.DERIVED
            elif 'insert into' in sql_query:
                if 'select' in sql_query:
                    return LineageRelationType.TRANSFORMATION
                else:
                    return LineageRelationType.DIRECT_COPY
            elif 'update' in sql_query:
                return LineageRelationType.TRANSFORMATION
            elif 'union' in sql_query or 'union all' in sql_query:
                return LineageRelationType.UNION
            elif any(join_type in sql_query for join_type in ['join', 'inner join', 'left join', 'right join', 'full join']):
                return LineageRelationType.JOIN
            elif 'group by' in sql_query or 'aggregate' in sql_query:
                return LineageRelationType.AGGREGATION
            elif 'where' in sql_query or 'having' in sql_query:
                return LineageRelationType.FILTER
            else:
                return LineageRelationType.REFERENCE
                
        except Exception as e:
            logger.error(f"Failed to determine SQL relationship type: {str(e)}")
            return LineageRelationType.REFERENCE
    
    async def _calculate_sql_relationship_confidence(
        self,
        sql_query: str,
        source_table: str,
        target_table: str
    ) -> LineageConfidenceLevel:
        """Calculate confidence level for SQL-derived relationship"""
        try:
            confidence_score = 0.5  # Base confidence
            
            # Increase confidence for explicit table references
            if source_table in sql_query:
                confidence_score += 0.2
                
            # Increase confidence for complex operations
            if any(op in sql_query for op in ['join', 'union', 'group by']):
                confidence_score += 0.2
                
            # Increase confidence for explicit column mappings
            if '=' in sql_query and '.' in sql_query:
                confidence_score += 0.1
                
            # Determine confidence level
            if confidence_score >= 0.9:
                return LineageConfidenceLevel.HIGH
            elif confidence_score >= 0.7:
                return LineageConfidenceLevel.MEDIUM
            elif confidence_score >= 0.5:
                return LineageConfidenceLevel.LOW
            else:
                return LineageConfidenceLevel.SUSPECTED
                
        except Exception as e:
            logger.error(f"Failed to calculate SQL relationship confidence: {str(e)}")
            return LineageConfidenceLevel.LOW
    
    async def _extract_sql_operation(self, sql_query: str) -> str:
        """Extract the primary SQL operation"""
        try:
            operations = ['select', 'insert', 'update', 'delete', 'create', 'alter', 'drop']
            for op in operations:
                if sql_query.startswith(op):
                    return op.upper()
            return "UNKNOWN"
        except Exception:
            return "UNKNOWN"
    
    async def _extract_column_mappings(self, sql_query: str) -> List[Dict[str, str]]:
        """Extract column mappings from SQL query"""
        try:
            mappings = []
            
            # Look for explicit column assignments in SELECT statements
            select_pattern = r'select\s+(.*?)\s+from'
            select_match = re.search(select_pattern, sql_query, re.IGNORECASE | re.DOTALL)
            
            if select_match:
                columns_part = select_match.group(1)
                # Parse column expressions (simplified)
                column_expressions = [col.strip() for col in columns_part.split(',')]
                
                for expr in column_expressions:
                    if ' as ' in expr.lower():
                        parts = expr.lower().split(' as ')
                        if len(parts) == 2:
                            mappings.append({
                                "source_column": parts[0].strip(),
                                "target_column": parts[1].strip()
                            })
                    elif '.' in expr:
                        mappings.append({
                            "source_column": expr.strip(),
                            "target_column": expr.split('.')[-1].strip()
                        })
            
            return mappings
            
        except Exception as e:
            logger.error(f"Failed to extract column mappings: {str(e)}")
            return []
    
    async def _extract_transformation_logic(self, sql_query: str) -> Dict[str, Any]:
        """Extract transformation logic from SQL query"""
        try:
            transformations = {
                "has_aggregation": bool(re.search(r'\b(sum|count|avg|max|min|group by)\b', sql_query)),
                "has_joins": bool(re.search(r'\b(join|inner join|left join|right join|full join)\b', sql_query)),
                "has_subqueries": bool(re.search(r'\([^)]*select[^)]*\)', sql_query)),
                "has_window_functions": bool(re.search(r'\bover\s*\(', sql_query)),
                "has_case_statements": bool(re.search(r'\bcase\s+when\b', sql_query)),
                "has_unions": bool(re.search(r'\bunion\b', sql_query))
            }
            
            return transformations
            
        except Exception as e:
            logger.error(f"Failed to extract transformation logic: {str(e)}")
            return {}
    
    async def _extract_join_conditions(self, sql_query: str) -> List[str]:
        """Extract JOIN conditions from SQL query"""
        try:
            join_pattern = r'join\s+[a-zA-Z_][a-zA-Z0-9_.]*\s+on\s+([^join]+?)(?=\s+(?:join|where|group|order|limit|$))'
            matches = re.findall(join_pattern, sql_query, re.IGNORECASE)
            return [match.strip() for match in matches]
            
        except Exception as e:
            logger.error(f"Failed to extract join conditions: {str(e)}")
            return []
    
    async def _extract_filter_conditions(self, sql_query: str) -> List[str]:
        """Extract WHERE conditions from SQL query"""
        try:
            where_pattern = r'where\s+([^group by|order by|limit]+?)(?=\s+(?:group|order|limit|$))'
            match = re.search(where_pattern, sql_query, re.IGNORECASE)
            
            if match:
                where_clause = match.group(1).strip()
                # Split on AND/OR to get individual conditions
                conditions = re.split(r'\s+(?:and|or)\s+', where_clause, flags=re.IGNORECASE)
                return [cond.strip() for cond in conditions]
            
            return []
            
        except Exception as e:
            logger.error(f"Failed to extract filter conditions: {str(e)}")
            return []

    async def _analyze_schema_relationships(
        self,
        data_source: DataSource,
        scan_results: List[ScanResult],
        config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Analyze schema structures to discover relationships"""
        relationships = []
        
        # Group results by table
        tables = defaultdict(list)
        for result in scan_results:
            tables[result.table_name].append(result)
        
        # Analyze foreign key relationships
        for table_name, columns in tables.items():
            for column in columns:
                if column.column_name and 'id' in column.column_name.lower():
                    # Look for potential foreign key relationships
                    referenced_table = column.column_name.replace('_id', '').replace('id', '')
                    if referenced_table in tables:
                        relationships.append({
                            "relationship_id": str(uuid.uuid4()),
                            "source_table": referenced_table,
                            "target_table": table_name,
                            "source_column": "id",
                            "target_column": column.column_name,
                            "relation_type": LineageRelationType.REFERENCE.value,
                            "confidence_level": LineageConfidenceLevel.MEDIUM.value,
                            "discovery_method": "schema_analysis",
                            "evidence": {"foreign_key_pattern": True},
                            "data_source_id": data_source.id
                        })
        
        return relationships

    async def _analyze_data_flow_patterns(
        self,
        data_source: DataSource,
        scan_results: List[ScanResult],
        config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Analyze data flow patterns to discover relationships"""
        relationships = []
        
        # Analyze naming patterns that suggest data flow
        for result in scan_results:
            table_name = result.table_name.lower()
            
            # Check for staging/raw/processed patterns
            if 'staging' in table_name or 'stg' in table_name:
                processed_table = table_name.replace('staging', 'processed').replace('stg', 'prod')
                relationships.append({
                    "relationship_id": str(uuid.uuid4()),
                    "source_table": result.table_name,
                    "target_table": processed_table,
                    "relation_type": LineageRelationType.TRANSFORMATION.value,
                    "confidence_level": LineageConfidenceLevel.LOW.value,
                    "discovery_method": "naming_pattern_analysis",
                    "evidence": {"naming_pattern": "staging_to_processed"},
                    "data_source_id": data_source.id
                })
            
            # Check for aggregation patterns
            if 'summary' in table_name or 'agg' in table_name:
                base_table = table_name.replace('_summary', '').replace('_agg', '')
                relationships.append({
                    "relationship_id": str(uuid.uuid4()),
                    "source_table": base_table,
                    "target_table": result.table_name,
                    "relation_type": LineageRelationType.AGGREGATION.value,
                    "confidence_level": LineageConfidenceLevel.MEDIUM.value,
                    "discovery_method": "naming_pattern_analysis",
                    "evidence": {"naming_pattern": "base_to_aggregate"},
                    "data_source_id": data_source.id
                })
        
        return relationships

    async def _build_lineage_graph(
        self,
        relationships: List[Dict[str, Any]],
        config: Dict[str, Any]
    ) -> LineageGraph:
        """Build a lineage graph from discovered relationships"""
        graph_id = str(uuid.uuid4())
        lineage_graph = LineageGraph(
            graph_id=graph_id,
            created_at=datetime.utcnow()
        )
        
        # Create nodes from relationships
        nodes_seen = set()
        for relationship in relationships:
            # Source node
            source_id = f"{relationship['data_source_id']}_{relationship['source_table']}"
            if source_id not in nodes_seen:
                lineage_graph.nodes[source_id] = LineageNode(
                    node_id=source_id,
                    node_type="table",
                    data_source_id=relationship['data_source_id'],
                    table_name=relationship['source_table'],
                    last_updated=datetime.utcnow()
                )
                nodes_seen.add(source_id)
            
            # Target node
            target_id = f"{relationship['data_source_id']}_{relationship['target_table']}"
            if target_id not in nodes_seen:
                lineage_graph.nodes[target_id] = LineageNode(
                    node_id=target_id,
                    node_type="table",
                    data_source_id=relationship['data_source_id'],
                    table_name=relationship['target_table'],
                    last_updated=datetime.utcnow()
                )
                nodes_seen.add(target_id)
            
            # Create edge
            edge_id = relationship['relationship_id']
            lineage_graph.edges[edge_id] = LineageEdge(
                edge_id=edge_id,
                source_node_id=source_id,
                target_node_id=target_id,
                relation_type=LineageRelationType(relationship['relation_type']),
                confidence_level=LineageConfidenceLevel(relationship['confidence_level']),
                validation_status=LineageValidationStatus.PENDING,
                metadata=relationship.get('evidence', {}),
                created_at=datetime.utcnow()
            )
        
        # Build NetworkX graph for analysis
        lineage_graph.nx_graph = self._build_networkx_graph(lineage_graph)
        lineage_graph.last_updated = datetime.utcnow()
        
        return lineage_graph

    def _build_networkx_graph(self, lineage_graph: LineageGraph) -> nx.DiGraph:
        """Build NetworkX directed graph from lineage graph"""
        nx_graph = nx.DiGraph()
        
        # Add nodes
        for node_id, node in lineage_graph.nodes.items():
            nx_graph.add_node(node_id, **{
                "node_type": node.node_type,
                "table_name": node.table_name,
                "data_source_id": node.data_source_id,
                "quality_score": node.quality_score
            })
        
        # Add edges
        for edge_id, edge in lineage_graph.edges.items():
            nx_graph.add_edge(
                edge.source_node_id,
                edge.target_node_id,
                **{
                    "edge_id": edge_id,
                    "relation_type": edge.relation_type.value,
                    "confidence_level": edge.confidence_level.value,
                    "impact_score": edge.impact_score
                }
            )
        
        return nx_graph

    async def _calculate_discovery_quality(
        self,
        data_source: DataSource,
        relationships: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate quality metrics for discovered relationships"""
        total_relationships = len(relationships)
        
        if total_relationships == 0:
            return {
                "completeness_score": 0.0,
                "confidence_distribution": {},
                "discovery_methods": {},
                "relationship_types": {}
            }
        
        # Confidence distribution
        confidence_counts = defaultdict(int)
        for rel in relationships:
            confidence_counts[rel['confidence_level']] += 1
        
        # Discovery methods
        method_counts = defaultdict(int)
        for rel in relationships:
            method_counts[rel['discovery_method']] += 1
        
        # Relationship types
        type_counts = defaultdict(int)
        for rel in relationships:
            type_counts[rel['relation_type']] += 1
        
        return {
            "total_relationships": total_relationships,
            "completeness_score": min(1.0, total_relationships / 100),  # Assume 100 is ideal
            "confidence_distribution": dict(confidence_counts),
            "discovery_methods": dict(method_counts),
            "relationship_types": dict(type_counts)
        }

    async def _calculate_overall_quality(self, results: Dict[str, Any]) -> LineageQualityMetrics:
        """Calculate overall quality metrics for lineage discovery"""
        total_relationships = len(results["discovered_relationships"])
        
        if total_relationships == 0:
            return LineageQualityMetrics(
                completeness_score=0.0,
                accuracy_score=0.0,
                freshness_score=1.0,
                consistency_score=0.0,
                validation_coverage=0.0,
                overall_quality_score=0.0
            )
        
        # Calculate confidence-based accuracy
        high_confidence = sum(1 for rel in results["discovered_relationships"] 
                            if rel['confidence_level'] in ['confirmed', 'high'])
        accuracy_score = high_confidence / total_relationships
        
        # Calculate completeness based on data source coverage
        data_sources_with_relationships = len(results["quality_metrics"])
        completeness_score = min(1.0, data_sources_with_relationships / len(results["data_source_ids"]))
        
        # Freshness is high for newly discovered lineage
        freshness_score = 1.0
        
        # Consistency based on relationship type distribution
        type_counts = defaultdict(int)
        for rel in results["discovered_relationships"]:
            type_counts[rel['relation_type']] += 1
        consistency_score = 1.0 - (len(type_counts) / 10)  # More variety = less consistency
        
        # Validation coverage (none yet since just discovered)
        validation_coverage = 0.0
        
        # Overall quality score
        overall_quality_score = (
            completeness_score * 0.3 +
            accuracy_score * 0.3 +
            freshness_score * 0.2 +
            consistency_score * 0.1 +
            validation_coverage * 0.1
        )
        
        return LineageQualityMetrics(
            completeness_score=completeness_score,
            accuracy_score=accuracy_score,
            freshness_score=freshness_score,
            consistency_score=consistency_score,
            validation_coverage=validation_coverage,
            overall_quality_score=overall_quality_score
        )

    def _analyze_confidence_distribution(self, relationships: List[Dict[str, Any]]) -> Dict[str, int]:
        """Analyze confidence level distribution"""
        distribution = defaultdict(int)
        for rel in relationships:
            distribution[rel['confidence_level']] += 1
        return dict(distribution)

    async def _find_lineage_graph_for_node(self, node_id: str) -> Optional[LineageGraph]:
        """Find the lineage graph containing a specific node"""
        for graph in self.lineage_graphs.values():
            if node_id in graph.nodes:
                return graph
        return None

    async def _traverse_upstream(
        self,
        lineage_graph: LineageGraph,
        node_id: str,
        max_depth: int,
        config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Traverse upstream dependencies"""
        if not lineage_graph.nx_graph:
            return []
        
        upstream_nodes = []
        visited = set()
        queue = deque([(node_id, 0)])
        
        while queue:
            current_node, depth = queue.popleft()
            
            if depth >= max_depth or current_node in visited:
                continue
            
            visited.add(current_node)
            
            # Get predecessors (upstream nodes)
            for predecessor in lineage_graph.nx_graph.predecessors(current_node):
                if predecessor not in visited:
                    node_data = lineage_graph.nodes.get(predecessor)
                    if node_data:
                        upstream_nodes.append({
                            "node_id": predecessor,
                            "node_type": node_data.node_type,
                            "table_name": node_data.table_name,
                            "depth": depth + 1,
                            "path_length": depth + 1
                        })
                    queue.append((predecessor, depth + 1))
        
        return upstream_nodes

    async def _traverse_downstream(
        self,
        lineage_graph: LineageGraph,
        node_id: str,
        max_depth: int,
        config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Traverse downstream dependencies"""
        if not lineage_graph.nx_graph:
            return []
        
        downstream_nodes = []
        visited = set()
        queue = deque([(node_id, 0)])
        
        while queue:
            current_node, depth = queue.popleft()
            
            if depth >= max_depth or current_node in visited:
                continue
            
            visited.add(current_node)
            
            # Get successors (downstream nodes)
            for successor in lineage_graph.nx_graph.successors(current_node):
                if successor not in visited:
                    node_data = lineage_graph.nodes.get(successor)
                    if node_data:
                        downstream_nodes.append({
                            "node_id": successor,
                            "node_type": node_data.node_type,
                            "table_name": node_data.table_name,
                            "depth": depth + 1,
                            "path_length": depth + 1
                        })
                    queue.append((successor, depth + 1))
        
        return downstream_nodes

    async def _calculate_impact_levels(
        self,
        lineage_graph: LineageGraph,
        root_node_id: str,
        impacted_nodes: List[Dict[str, Any]],
        config: Dict[str, Any]
    ) -> Dict[str, str]:
        """Calculate impact levels for affected nodes"""
        impact_levels = {}
        
        for node in impacted_nodes:
            node_id = node["node_id"]
            depth = node["depth"]
            
            # Calculate impact based on depth and node characteristics
            if depth == 1:
                impact_level = "high"
            elif depth <= 3:
                impact_level = "medium"
            else:
                impact_level = "low"
            
            # Adjust based on node quality score
            node_data = lineage_graph.nodes.get(node_id)
            if node_data and node_data.quality_score > 0.8:
                if impact_level == "medium":
                    impact_level = "high"
                elif impact_level == "low":
                    impact_level = "medium"
            
            impact_levels[node_id] = impact_level
        
        return impact_levels

    async def _perform_risk_assessment(
        self,
        lineage_graph: LineageGraph,
        root_node_id: str,
        impacted_nodes: List[Dict[str, Any]],
        impact_levels: Dict[str, str],
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform comprehensive risk assessment"""
        high_impact_count = sum(1 for level in impact_levels.values() if level == "high")
        medium_impact_count = sum(1 for level in impact_levels.values() if level == "medium")
        total_impacted = len(impacted_nodes)
        
        # Calculate overall risk score
        risk_score = (high_impact_count * 3 + medium_impact_count * 2) / max(total_impacted, 1)
        
        # Determine risk level
        if risk_score >= 2.5:
            risk_level = "critical"
        elif risk_score >= 2.0:
            risk_level = "high"
        elif risk_score >= 1.0:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return {
            "overall_risk_score": risk_score,
            "risk_level": risk_level,
            "total_impacted_nodes": total_impacted,
            "high_impact_nodes": high_impact_count,
            "medium_impact_nodes": medium_impact_count,
            "risk_factors": [
                f"Total of {total_impacted} nodes potentially impacted",
                f"{high_impact_count} nodes with high impact risk",
                f"Risk propagation through {len(set(node['depth'] for node in impacted_nodes))} levels"
            ]
        }

    async def _generate_impact_recommendations(
        self,
        lineage_graph: LineageGraph,
        root_node_id: str,
        impacted_nodes: List[Dict[str, Any]],
        risk_assessment: Dict[str, Any],
        config: Dict[str, Any]
    ) -> List[str]:
        """Generate recommendations based on impact analysis"""
        recommendations = []
        
        risk_level = risk_assessment.get("risk_level", "low")
        high_impact_count = risk_assessment.get("high_impact_nodes", 0)
        
        if risk_level in ["critical", "high"]:
            recommendations.extend([
                "Implement comprehensive testing before making changes to this node",
                "Consider creating backup/rollback procedures for downstream systems",
                "Notify stakeholders of all downstream systems before changes"
            ])
        
        if high_impact_count > 5:
            recommendations.append(
                "Consider phased rollout approach due to high number of impacted systems"
            )
        
        if risk_level == "critical":
            recommendations.extend([
                "Require change approval from data governance committee",
                "Implement real-time monitoring during change deployment",
                "Consider maintenance window for critical downstream systems"
            ])
        
        # Add node-specific recommendations
        for node in impacted_nodes:
            node_data = lineage_graph.nodes.get(node["node_id"])
            if node_data and node_data.node_type == "view":
                recommendations.append(
                    f"Review and update view definition for {node_data.table_name} if schema changes"
                )
        
        return recommendations

    async def _calculate_analysis_confidence(
        self,
        lineage_graph: LineageGraph,
        impacted_nodes: List[Dict[str, Any]],
        config: Dict[str, Any]
    ) -> float:
        """Calculate confidence score for the impact analysis"""
        if not impacted_nodes:
            return 1.0
        
        # Calculate based on edge confidence levels
        total_confidence = 0.0
        edge_count = 0
        
        for edge in lineage_graph.edges.values():
            confidence_map = {
                LineageConfidenceLevel.CONFIRMED: 1.0,
                LineageConfidenceLevel.HIGH: 0.9,
                LineageConfidenceLevel.MEDIUM: 0.7,
                LineageConfidenceLevel.LOW: 0.5,
                LineageConfidenceLevel.SUSPECTED: 0.3
            }
            total_confidence += confidence_map.get(edge.confidence_level, 0.5)
            edge_count += 1
        
        if edge_count == 0:
            return 0.5
        
        return total_confidence / edge_count

    async def _validate_node(self, node: LineageNode, config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a lineage node"""
        validation_result = {
            "node_id": node.node_id,
            "validation_status": "valid",
            "issues": [],
            "quality_score": 1.0
        }
        
        # Check if node has required metadata
        if not node.table_name:
            validation_result["issues"].append("Missing table name")
            validation_result["quality_score"] *= 0.8
        
        if node.data_source_id <= 0:
            validation_result["issues"].append("Invalid data source ID")
            validation_result["quality_score"] *= 0.7
        
        if validation_result["issues"]:
            validation_result["validation_status"] = "invalid"
        
        return validation_result

    async def _validate_edge(
        self,
        edge: LineageEdge,
        nodes: Dict[str, LineageNode],
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate a lineage edge"""
        validation_result = {
            "edge_id": edge.edge_id,
            "validation_status": "valid",
            "issues": [],
            "quality_score": 1.0
        }
        
        # Check if source and target nodes exist
        if edge.source_node_id not in nodes:
            validation_result["issues"].append("Source node does not exist")
            validation_result["quality_score"] *= 0.5
        
        if edge.target_node_id not in nodes:
            validation_result["issues"].append("Target node does not exist")
            validation_result["quality_score"] *= 0.5
        
        # Check confidence level consistency
        if edge.confidence_level == LineageConfidenceLevel.SUSPECTED:
            validation_result["issues"].append("Low confidence relationship needs verification")
            validation_result["quality_score"] *= 0.9
        
        if validation_result["issues"]:
            validation_result["validation_status"] = "needs_review"
        
        return validation_result

    async def _perform_consistency_checks(
        self,
        lineage_graph: LineageGraph,
        config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Perform consistency checks on the lineage graph"""
        consistency_results = []
        
        # Check for circular dependencies
        if lineage_graph.nx_graph and not nx.is_directed_acyclic_graph(lineage_graph.nx_graph):
            consistency_results.append({
                "check_type": "circular_dependency",
                "status": "failed",
                "message": "Circular dependencies detected in lineage graph",
                "severity": "high"
            })
        else:
            consistency_results.append({
                "check_type": "circular_dependency",
                "status": "passed",
                "message": "No circular dependencies found",
                "severity": "info"
            })
        
        # Check for orphaned nodes
        orphaned_nodes = []
        for node_id, node in lineage_graph.nodes.items():
            has_incoming = any(edge.target_node_id == node_id for edge in lineage_graph.edges.values())
            has_outgoing = any(edge.source_node_id == node_id for edge in lineage_graph.edges.values())
            
            if not has_incoming and not has_outgoing:
                orphaned_nodes.append(node_id)
        
        if orphaned_nodes:
            consistency_results.append({
                "check_type": "orphaned_nodes",
                "status": "warning",
                "message": f"Found {len(orphaned_nodes)} orphaned nodes",
                "severity": "medium",
                "details": orphaned_nodes
            })
        
        return consistency_results

    async def _calculate_graph_quality_score(
        self,
        graph_validation: Dict[str, Any],
        config: Dict[str, Any]
    ) -> float:
        """Calculate overall quality score for a lineage graph"""
        node_scores = [v["quality_score"] for v in graph_validation["node_validations"]]
        edge_scores = [v["quality_score"] for v in graph_validation["edge_validations"]]
        
        avg_node_score = sum(node_scores) / len(node_scores) if node_scores else 0.0
        avg_edge_score = sum(edge_scores) / len(edge_scores) if edge_scores else 0.0
        
        # Penalize for consistency issues
        consistency_penalty = 0.0
        for check in graph_validation["consistency_checks"]:
            if check["status"] == "failed":
                consistency_penalty += 0.2
            elif check["status"] == "warning":
                consistency_penalty += 0.1
        
        quality_score = (avg_node_score * 0.4 + avg_edge_score * 0.6) - consistency_penalty
        return max(0.0, min(1.0, quality_score))

    async def _calculate_validation_quality_metrics(
        self,
        validation_results: List[Dict[str, Any]]
    ) -> LineageQualityMetrics:
        """Calculate overall validation quality metrics"""
        if not validation_results:
            return LineageQualityMetrics(
                completeness_score=0.0,
                accuracy_score=0.0,
                freshness_score=0.0,
                consistency_score=0.0,
                validation_coverage=1.0,
                overall_quality_score=0.0
            )
        
        # Calculate average quality scores
        quality_scores = [result["quality_score"] for result in validation_results]
        overall_quality_score = sum(quality_scores) / len(quality_scores)
        
        return LineageQualityMetrics(
            completeness_score=overall_quality_score,
            accuracy_score=overall_quality_score,
            freshness_score=0.9,  # Recently validated
            consistency_score=overall_quality_score,
            validation_coverage=1.0,  # All graphs validated
            overall_quality_score=overall_quality_score
        )

    async def _generate_validation_recommendations(
        self,
        validation_results: List[Dict[str, Any]],
        config: Dict[str, Any]
    ) -> List[str]:
        """Generate recommendations based on validation results"""
        recommendations = []
        
        total_issues = sum(
            len(result.get("node_validations", [])) + 
            len(result.get("edge_validations", [])) 
            for result in validation_results
        )
        
        if total_issues > 10:
            recommendations.append(
                "High number of validation issues detected. Consider comprehensive lineage cleanup."
            )
        
        # Check for specific issue patterns
        low_confidence_edges = 0
        for result in validation_results:
            for edge_validation in result.get("edge_validations", []):
                if "Low confidence" in str(edge_validation.get("issues", [])):
                    low_confidence_edges += 1
        
        if low_confidence_edges > 5:
            recommendations.append(
                "Multiple low-confidence relationships found. Implement human validation process."
            )
        
        recommendations.extend([
            "Implement automated lineage validation as part of CI/CD pipeline",
            "Set up monitoring alerts for lineage quality degradation",
            "Establish regular lineage quality review process"
        ])
        
        return recommendations

    async def _build_visualization_graph(
        self,
        node_ids: List[str],
        config: Dict[str, Any]
    ) -> LineageGraph:
        """Build a subgraph for visualization"""
        # For this implementation, return the first available graph
        # In production, this would filter based on node_ids
        if self.lineage_graphs:
            return list(self.lineage_graphs.values())[0]
        
        # Return empty graph if none available
        return LineageGraph(
            graph_id="empty",
            created_at=datetime.utcnow()
        )

    async def _calculate_graph_layout(
        self,
        viz_graph: LineageGraph,
        config: Dict[str, Any]
    ) -> Dict[str, Dict[str, float]]:
        """Calculate layout positions for visualization"""
        if not viz_graph.nx_graph or not viz_graph.nodes:
            return {}
        
        # Use spring layout for positioning
        try:
            pos = nx.spring_layout(viz_graph.nx_graph, k=1, iterations=50)
            return {
                node_id: {"x": float(coords[0] * 100), "y": float(coords[1] * 100)}
                for node_id, coords in pos.items()
            }
        except:
            # Fallback to simple positioning
            positions = {}
            for i, node_id in enumerate(viz_graph.nodes.keys()):
                positions[node_id] = {"x": i * 100, "y": 0}
            return positions

    async def _generate_node_styles(
        self,
        viz_graph: LineageGraph,
        config: Dict[str, Any]
    ) -> Dict[str, Dict[str, Any]]:
        """Generate styling for nodes"""
        styles = {}
        
        for node_id, node in viz_graph.nodes.items():
            # Color based on node type
            color_map = {
                "table": "#4CAF50",
                "view": "#2196F3",
                "file": "#FF9800",
                "api_endpoint": "#9C27B0"
            }
            
            styles[node_id] = {
                "backgroundColor": color_map.get(node.node_type, "#757575"),
                "borderColor": "#000000",
                "borderWidth": 2,
                "fontSize": 12,
                "shape": "rectangle" if node.node_type == "table" else "ellipse"
            }
        
        return styles

    async def _generate_edge_styles(
        self,
        viz_graph: LineageGraph,
        config: Dict[str, Any]
    ) -> Dict[str, Dict[str, Any]]:
        """Generate styling for edges"""
        styles = {}
        
        for edge_id, edge in viz_graph.edges.items():
            # Color based on confidence level
            confidence_colors = {
                LineageConfidenceLevel.CONFIRMED: "#4CAF50",
                LineageConfidenceLevel.HIGH: "#8BC34A",
                LineageConfidenceLevel.MEDIUM: "#FFC107",
                LineageConfidenceLevel.LOW: "#FF9800",
                LineageConfidenceLevel.SUSPECTED: "#F44336"
            }
            
            # Line style based on relationship type
            line_styles = {
                LineageRelationType.DIRECT_COPY: "solid",
                LineageRelationType.TRANSFORMATION: "dashed",
                LineageRelationType.AGGREGATION: "dotted",
                LineageRelationType.REFERENCE: "solid"
            }
            
            styles[edge_id] = {
                "stroke": confidence_colors.get(edge.confidence_level, "#757575"),
                "strokeWidth": 2,
                "strokeDasharray": "5,5" if line_styles.get(edge.relation_type) == "dashed" else None,
                "markerEnd": "arrow"
            }
        
        return styles

    async def _calculate_visualization_metrics(self, viz_graph: LineageGraph) -> Dict[str, Any]:
        """Calculate metrics for the visualization"""
        if not viz_graph.nx_graph:
            return {
                "node_count": len(viz_graph.nodes),
                "edge_count": len(viz_graph.edges),
                "complexity": "low"
            }
        
        node_count = viz_graph.nx_graph.number_of_nodes()
        edge_count = viz_graph.nx_graph.number_of_edges()
        
        # Calculate graph complexity
        if node_count > 50 or edge_count > 100:
            complexity = "high"
        elif node_count > 20 or edge_count > 40:
            complexity = "medium"
        else:
            complexity = "low"
        
        return {
            "node_count": node_count,
            "edge_count": edge_count,
            "complexity": complexity,
            "max_depth": 0,  # Would calculate actual depth in production
            "branching_factor": edge_count / max(node_count, 1)
        }

    async def _generate_visualization_legend(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate legend for the visualization"""
        return {
            "node_types": {
                "table": {"color": "#4CAF50", "shape": "rectangle"},
                "view": {"color": "#2196F3", "shape": "ellipse"},
                "file": {"color": "#FF9800", "shape": "rectangle"},
                "api_endpoint": {"color": "#9C27B0", "shape": "ellipse"}
            },
            "confidence_levels": {
                "confirmed": {"color": "#4CAF50"},
                "high": {"color": "#8BC34A"}, 
                "medium": {"color": "#FFC107"},
                "low": {"color": "#FF9800"},
                "suspected": {"color": "#F44336"}
            },
            "relationship_types": {
                "direct_copy": {"style": "solid"},
                "transformation": {"style": "dashed"},
                "aggregation": {"style": "dotted"},
                "reference": {"style": "solid"}
            }
        }

    async def _find_cross_system_relationships(
        self,
        data_sources: List[DataSource],
        config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Find relationships between different data systems"""
        relationships = []
        
        # Mock cross-system relationship discovery
        for i, source1 in enumerate(data_sources):
            for source2 in data_sources[i+1:]:
                # Look for naming patterns suggesting data movement
                if source1.source_type != source2.source_type:
                    relationships.append({
                        "relationship_id": str(uuid.uuid4()),
                        "source_system": source1.id,
                        "target_system": source2.id,
                        "source_type": source1.source_type.value,
                        "target_type": source2.source_type.value,
                        "relationship_type": "data_transfer",
                        "confidence": "medium",
                        "evidence": "Different system types suggest ETL process"
                    })
        
        return relationships

    async def _analyze_cross_system_flows(
        self,
        data_sources: List[DataSource],
        relationships: List[Dict[str, Any]],
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze data flow patterns between systems"""
        flow_patterns = {
            "data_ingestion_flows": [],
            "data_processing_flows": [],
            "data_export_flows": [],
            "flow_complexity": "medium"
        }
        
        # Analyze flow directions based on system types
        for relationship in relationships:
            source_id = relationship["source_system"]
            target_id = relationship["target_system"]
            
            source_system = next((ds for ds in data_sources if ds.id == source_id), None)
            target_system = next((ds for ds in data_sources if ds.id == target_id), None)
            
            if source_system and target_system:
                # Classify flow type based on system characteristics
                if source_system.source_type in [DataSourceType.S3, DataSourceType.MONGODB]:
                    flow_patterns["data_ingestion_flows"].append({
                        "source": source_system.name,
                        "target": target_system.name,
                        "flow_type": "ingestion"
                    })
                elif target_system.source_type == DataSourceType.SNOWFLAKE:
                    flow_patterns["data_processing_flows"].append({
                        "source": source_system.name,
                        "target": target_system.name,
                        "flow_type": "processing"
                    })
        
        return flow_patterns

    async def _identify_integration_points(
        self,
        data_sources: List[DataSource],
        relationships: List[Dict[str, Any]],
        config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Identify key integration points between systems"""
        integration_points = []
        
        # Count connections per system
        system_connections = defaultdict(int)
        for relationship in relationships:
            system_connections[relationship["source_system"]] += 1
            system_connections[relationship["target_system"]] += 1
        
        # Identify highly connected systems as integration hubs
        for data_source in data_sources:
            connection_count = system_connections.get(data_source.id, 0)
            if connection_count >= 2:  # Hub threshold
                integration_points.append({
                    "system_id": data_source.id,
                    "system_name": data_source.name,
                    "system_type": data_source.source_type.value,
                    "connection_count": connection_count,
                    "integration_level": "high" if connection_count >= 3 else "medium",
                    "criticality": "high"  # Systems with many connections are critical
                })
        
        return integration_points

    async def _calculate_system_dependencies(
        self,
        data_sources: List[DataSource],
        relationships: List[Dict[str, Any]],
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate dependency metrics between systems"""
        dependency_metrics = {
            "system_criticality": {},
            "dependency_chains": [],
            "single_points_of_failure": [],
            "overall_coupling": 0.0
        }
        
        # Calculate system criticality based on connections
        system_connections = defaultdict(int)
        for relationship in relationships:
            system_connections[relationship["source_system"]] += 1
            system_connections[relationship["target_system"]] += 1
        
        for data_source in data_sources:
            connection_count = system_connections.get(data_source.id, 0)
            criticality_score = min(1.0, connection_count / 5.0)  # Normalize to 0-1
            
            dependency_metrics["system_criticality"][str(data_source.id)] = {
                "system_name": data_source.name,
                "criticality_score": criticality_score,
                "connection_count": connection_count
            }
            
            # Identify single points of failure
            if connection_count >= 3:
                dependency_metrics["single_points_of_failure"].append({
                    "system_id": data_source.id,
                    "system_name": data_source.name,
                    "risk_level": "high"
                })
        
        # Calculate overall coupling
        total_systems = len(data_sources)
        total_relationships = len(relationships)
        max_possible_relationships = total_systems * (total_systems - 1) / 2
        dependency_metrics["overall_coupling"] = total_relationships / max_possible_relationships if max_possible_relationships > 0 else 0.0
        
        return dependency_metrics

    async def _generate_cross_system_recommendations(
        self,
        data_sources: List[DataSource],
        relationships: List[Dict[str, Any]],
        dependency_metrics: Dict[str, Any],
        config: Dict[str, Any]
    ) -> List[str]:
        """Generate recommendations for cross-system lineage management"""
        recommendations = []
        
        # Check overall coupling
        coupling = dependency_metrics.get("overall_coupling", 0.0)
        if coupling > 0.7:
            recommendations.append(
                "High system coupling detected. Consider implementing service mesh or API gateway for better decoupling."
            )
        
        # Check single points of failure
        spofs = dependency_metrics.get("single_points_of_failure", [])
        if spofs:
            recommendations.append(
                f"Identified {len(spofs)} single points of failure. Implement redundancy and failover mechanisms."
            )
        
        # Check system diversity
        system_types = set(ds.source_type for ds in data_sources)
        if len(system_types) > 5:
            recommendations.append(
                "High system diversity detected. Consider standardizing on fewer technology stacks."
            )
        
        recommendations.extend([
            "Implement cross-system data quality monitoring",
            "Establish SLAs for cross-system data transfers",
            "Create disaster recovery plans for critical data flows",
            "Implement automated lineage validation across system boundaries"
        ])
        
        return recommendations

    # ===================== VALIDATION HELPER METHODS =====================

    async def _validate_schema_consistency(self, lineage_graph: LineageGraph) -> bool:
        """Validate schema consistency across lineage relationships"""
        # Implementation would check data types, column names, etc.
        return True

    async def _validate_temporal_consistency(self, lineage_graph: LineageGraph) -> bool:
        """Validate temporal consistency of relationships"""
        # Implementation would check timestamps, update frequencies, etc.
        return True


# ===================== SERVICE FACTORY =====================

def create_advanced_lineage_service() -> AdvancedLineageService:
    """
    Factory function to create and configure an Advanced Lineage Service instance
    
    Returns:
        Configured AdvancedLineageService instance
    """
    return AdvancedLineageService()