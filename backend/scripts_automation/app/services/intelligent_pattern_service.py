"""
Intelligent Pattern Service

This service provides advanced AI-powered pattern recognition and analysis
capabilities for enterprise scan rule sets. It uses machine learning algorithms
to automatically detect data patterns, classify content, and generate intelligent
scan rules based on discovered patterns.

Enterprise Features:
- AI-powered pattern detection
- Semantic pattern analysis
- Automated rule generation
- Pattern optimization
- Real-time pattern learning
- Cross-system pattern correlation
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
import numpy as np
from collections import defaultdict, Counter
from dataclasses import dataclass, field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer

from ..models.scan_models import (
    DataSource, ScanResult, Scan, EnhancedScanRuleSet
)
from ..models.advanced_scan_rule_models import (
    IntelligentScanRule, ScanPattern, PatternMatchResult,
    RuleOptimizationMetric, PatternAnalysisResult, PatternCategory,
    PatternConfidenceLevel, SemanticPattern, PatternCluster
)
from ..models.classification_models import ClassificationResult
from ..db_session import get_session

logger = logging.getLogger(__name__)

# Initialize NLTK components
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
except:
    logger.warning("Failed to download NLTK data")


class PatternType(str, Enum):
    """Types of patterns that can be detected"""
    DATA_FORMAT = "data_format"           # Email, phone, SSN formats
    NAMING_CONVENTION = "naming_convention"  # Column/table naming patterns
    DATA_RELATIONSHIP = "data_relationship"  # Foreign key relationships
    SEMANTIC_CONTENT = "semantic_content"    # Content-based patterns
    STRUCTURAL = "structural"             # Database structure patterns
    TEMPORAL = "temporal"                 # Time-based patterns
    STATISTICAL = "statistical"          # Statistical distributions
    BUSINESS_RULE = "business_rule"       # Business logic patterns
    COMPLIANCE = "compliance"             # Regulatory compliance patterns
    QUALITY = "quality"                   # Data quality patterns


class LearningMode(str, Enum):
    """Learning modes for pattern detection"""
    SUPERVISED = "supervised"         # Learning from labeled examples
    UNSUPERVISED = "unsupervised"    # Discovering patterns without labels
    SEMI_SUPERVISED = "semi_supervised"  # Hybrid approach
    REINFORCEMENT = "reinforcement"   # Learning from feedback
    TRANSFER = "transfer"            # Using knowledge from other domains


class PatternComplexity(str, Enum):
    """Complexity levels of detected patterns"""
    SIMPLE = "simple"               # Basic regex patterns
    MODERATE = "moderate"           # Multi-field patterns
    COMPLEX = "complex"             # Cross-table patterns
    ADVANCED = "advanced"           # AI-generated patterns
    EXPERT = "expert"               # Human-verified patterns


@dataclass
class PatternDiscoveryConfig:
    """Configuration for pattern discovery operations"""
    pattern_types: List[PatternType] = field(default_factory=lambda: list(PatternType))
    learning_mode: LearningMode = LearningMode.UNSUPERVISED
    confidence_threshold: float = 0.7
    min_support: int = 3
    max_patterns: int = 100
    enable_semantic_analysis: bool = True
    enable_statistical_analysis: bool = True
    enable_ml_clustering: bool = True
    cross_source_analysis: bool = False
    historical_analysis: bool = True
    real_time_learning: bool = False


@dataclass
class PatternAnalysisResult:
    """Result of pattern analysis operation"""
    pattern_id: str
    pattern_type: PatternType
    pattern_expression: str
    confidence_score: float
    support_count: int
    complexity: PatternComplexity
    semantic_meaning: Optional[str]
    business_relevance: float
    applicable_contexts: List[str]
    generated_rules: List[Dict[str, Any]]
    optimization_suggestions: List[str]
    validation_results: Dict[str, Any]


class IntelligentPatternService:
    """
    Enterprise-level intelligent pattern service providing advanced AI-powered
    pattern recognition and analysis for data governance scanning operations.
    """

    def __init__(self):
        # ML Components
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 3)
        )
        self.stemmer = PorterStemmer()
        
        # Pattern Cache
        self._pattern_cache = {}
        self._learned_patterns = {}
        self._pattern_performance = {}
        
        # Configuration
        self.max_cache_size = 10000
        self.cache_ttl = 3600  # 1 hour
        self.learning_batch_size = 100
        self.min_confidence_score = 0.6
        
        # Pre-defined pattern libraries
        self._initialize_pattern_libraries()
        
        logger.info("IntelligentPatternService initialized with AI capabilities")

    def _initialize_pattern_libraries(self):
        """Initialize pre-defined pattern libraries"""
        
        # Data format patterns
        self.format_patterns = {
            "email": {
                "regex": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                "confidence": 0.95,
                "category": PatternCategory.PII,
                "description": "Email address format"
            },
            "phone_us": {
                "regex": r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
                "confidence": 0.90,
                "category": PatternCategory.PII,
                "description": "US phone number format"
            },
            "ssn": {
                "regex": r'\b\d{3}-\d{2}-\d{4}\b',
                "confidence": 0.98,
                "category": PatternCategory.PII,
                "description": "Social Security Number format"
            },
            "credit_card": {
                "regex": r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
                "confidence": 0.85,
                "category": PatternCategory.FINANCIAL,
                "description": "Credit card number format"
            },
            "ip_address": {
                "regex": r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b',
                "confidence": 0.80,
                "category": PatternCategory.TECHNICAL,
                "description": "IP address format"
            }
        }
        
        # Naming convention patterns
        self.naming_patterns = {
            "snake_case": {
                "regex": r'^[a-z]+(_[a-z]+)*$',
                "confidence": 0.75,
                "category": PatternCategory.STRUCTURAL,
                "description": "Snake case naming convention"
            },
            "camel_case": {
                "regex": r'^[a-z]+([A-Z][a-z]*)*$',
                "confidence": 0.75,
                "category": PatternCategory.STRUCTURAL,
                "description": "Camel case naming convention"
            },
            "primary_key": {
                "regex": r'.*(_id|Id|ID)$',
                "confidence": 0.70,
                "category": PatternCategory.STRUCTURAL,
                "description": "Primary key naming pattern"
            }
        }
        
        # Semantic patterns
        self.semantic_patterns = {
            "personal_data": {
                "keywords": ["name", "firstname", "lastname", "address", "personal"],
                "confidence": 0.80,
                "category": PatternCategory.PII,
                "description": "Personal data indicators"
            },
            "financial_data": {
                "keywords": ["amount", "price", "cost", "salary", "income", "payment"],
                "confidence": 0.75,
                "category": PatternCategory.FINANCIAL,
                "description": "Financial data indicators"
            },
            "temporal_data": {
                "keywords": ["date", "time", "created", "updated", "timestamp"],
                "confidence": 0.70,
                "category": PatternCategory.TEMPORAL,
                "description": "Temporal data indicators"
            }
        }

    async def discover_patterns(
        self,
        data_sources: List[int],
        config: Optional[PatternDiscoveryConfig] = None,
        db: Optional[Session] = None
    ) -> List[PatternAnalysisResult]:
        """
        Discover patterns across multiple data sources using AI algorithms.
        
        Features:
        - Multi-source pattern analysis
        - AI-powered clustering
        - Semantic pattern recognition
        - Statistical pattern analysis
        - Cross-domain pattern correlation
        """
        try:
            if not db:
                db = next(get_session())
            
            if not config:
                config = PatternDiscoveryConfig()
            
            logger.info(f"Starting pattern discovery for {len(data_sources)} data sources")
            
            # Collect data from sources
            source_data = await self._collect_source_data(data_sources, db)
            
            # Initialize results container
            discovered_patterns = []
            
            # Execute different pattern discovery approaches
            for pattern_type in config.pattern_types:
                if pattern_type == PatternType.DATA_FORMAT:
                    format_patterns = await self._discover_data_format_patterns(
                        source_data, config
                    )
                    discovered_patterns.extend(format_patterns)
                
                elif pattern_type == PatternType.NAMING_CONVENTION:
                    naming_patterns = await self._discover_naming_patterns(
                        source_data, config
                    )
                    discovered_patterns.extend(naming_patterns)
                
                elif pattern_type == PatternType.SEMANTIC_CONTENT:
                    semantic_patterns = await self._discover_semantic_patterns(
                        source_data, config, db
                    )
                    discovered_patterns.extend(semantic_patterns)
                
                elif pattern_type == PatternType.STRUCTURAL:
                    structural_patterns = await self._discover_structural_patterns(
                        source_data, config
                    )
                    discovered_patterns.extend(structural_patterns)
                
                elif pattern_type == PatternType.STATISTICAL:
                    statistical_patterns = await self._discover_statistical_patterns(
                        source_data, config
                    )
                    discovered_patterns.extend(statistical_patterns)
            
            # Apply ML clustering for pattern grouping
            if config.enable_ml_clustering and len(discovered_patterns) > 5:
                clustered_patterns = await self._cluster_patterns(
                    discovered_patterns, config
                )
                discovered_patterns = clustered_patterns
            
            # Filter and rank patterns
            filtered_patterns = await self._filter_and_rank_patterns(
                discovered_patterns, config
            )
            
            # Generate intelligent rules from patterns
            for pattern in filtered_patterns:
                pattern.generated_rules = await self._generate_rules_from_pattern(
                    pattern, db
                )
            
            # Cache discovered patterns
            await self._cache_discovered_patterns(filtered_patterns)
            
            logger.info(f"Discovered {len(filtered_patterns)} patterns")
            return filtered_patterns
            
        except Exception as e:
            logger.error(f"Pattern discovery failed: {str(e)}")
            raise

    async def _collect_source_data(
        self,
        data_source_ids: List[int],
        db: Session
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Collect data from specified data sources for pattern analysis"""
        
        source_data = {}
        
        try:
            # Get scan results from data sources
            for ds_id in data_source_ids:
                query = select(ScanResult).join(Scan).join(DataSource).where(
                    DataSource.id == ds_id
                ).limit(1000)  # Limit for performance
                
                scan_results = db.exec(query).all()
                
                # Extract structured data
                structured_data = []
                for result in scan_results:
                    data_entry = {
                        "data_source_id": ds_id,
                        "schema_name": result.schema_name,
                        "table_name": result.table_name,
                        "column_name": result.column_name,
                        "data_type": result.data_type,
                        "object_type": result.object_type,
                        "classification_labels": result.classification_labels or [],
                        "sensitivity_level": result.sensitivity_level,
                        "scan_metadata": result.scan_metadata or {}
                    }
                    
                    # Extract sample data if available
                    if result.scan_metadata and "sample_data" in result.scan_metadata:
                        data_entry["sample_values"] = result.scan_metadata["sample_data"]
                    
                    structured_data.append(data_entry)
                
                source_data[str(ds_id)] = structured_data
            
            logger.info(f"Collected data from {len(source_data)} sources")
            return source_data
            
        except Exception as e:
            logger.error(f"Failed to collect source data: {str(e)}")
            return {}

    async def _discover_data_format_patterns(
        self,
        source_data: Dict[str, List[Dict[str, Any]]],
        config: PatternDiscoveryConfig
    ) -> List[PatternAnalysisResult]:
        """Discover data format patterns using regex analysis and ML"""
        
        patterns = []
        
        try:
            # Collect all sample values
            all_values = []
            value_contexts = []
            
            for source_id, data_entries in source_data.items():
                for entry in data_entries:
                    if "sample_values" in entry and entry["sample_values"]:
                        for value in entry["sample_values"][:5]:  # Limit samples
                            if isinstance(value, (str, int, float)) and str(value).strip():
                                all_values.append(str(value).strip())
                                value_contexts.append({
                                    "source_id": source_id,
                                    "column_name": entry.get("column_name", ""),
                                    "data_type": entry.get("data_type", ""),
                                    "table_name": entry.get("table_name", "")
                                })
            
            if not all_values:
                return patterns
            
            # Apply pre-defined format patterns
            for pattern_name, pattern_info in self.format_patterns.items():
                matches = []
                match_contexts = []
                
                regex = re.compile(pattern_info["regex"])
                for i, value in enumerate(all_values):
                    if regex.search(value):
                        matches.append(value)
                        match_contexts.append(value_contexts[i])
                
                if len(matches) >= config.min_support:
                    # Calculate support and confidence
                    support = len(matches)
                    confidence = min(pattern_info["confidence"], support / len(all_values))
                    
                    # Determine applicable contexts
                    applicable_contexts = list(set([
                        f"{ctx['table_name']}.{ctx['column_name']}" 
                        for ctx in match_contexts 
                        if ctx['column_name']
                    ]))
                    
                    pattern_result = PatternAnalysisResult(
                        pattern_id=f"format_{pattern_name}_{uuid.uuid4().hex[:8]}",
                        pattern_type=PatternType.DATA_FORMAT,
                        pattern_expression=pattern_info["regex"],
                        confidence_score=confidence,
                        support_count=support,
                        complexity=PatternComplexity.SIMPLE,
                        semantic_meaning=pattern_info["description"],
                        business_relevance=self._calculate_business_relevance(
                            pattern_info["category"], matches
                        ),
                        applicable_contexts=applicable_contexts,
                        generated_rules=[],
                        optimization_suggestions=[],
                        validation_results={"matches": len(matches), "total": len(all_values)}
                    )
                    
                    patterns.append(pattern_result)
            
            # Discover new format patterns using ML
            ml_patterns = await self._ml_format_pattern_discovery(
                all_values, value_contexts, config
            )
            patterns.extend(ml_patterns)
            
            logger.info(f"Discovered {len(patterns)} data format patterns")
            return patterns
            
        except Exception as e:
            logger.error(f"Data format pattern discovery failed: {str(e)}")
            return patterns

    async def _discover_naming_patterns(
        self,
        source_data: Dict[str, List[Dict[str, Any]]],
        config: PatternDiscoveryConfig
    ) -> List[PatternAnalysisResult]:
        """Discover naming convention patterns across schemas and tables"""
        
        patterns = []
        
        try:
            # Collect naming data
            table_names = []
            column_names = []
            naming_contexts = []
            
            for source_id, data_entries in source_data.items():
                for entry in data_entries:
                    # Table names
                    if entry.get("table_name"):
                        table_names.append(entry["table_name"])
                        naming_contexts.append({
                            "type": "table",
                            "name": entry["table_name"],
                            "source_id": source_id,
                            "schema": entry.get("schema_name", "")
                        })
                    
                    # Column names
                    if entry.get("column_name"):
                        column_names.append(entry["column_name"])
                        naming_contexts.append({
                            "type": "column",
                            "name": entry["column_name"],
                            "source_id": source_id,
                            "table": entry.get("table_name", ""),
                            "data_type": entry.get("data_type", "")
                        })
            
            # Analyze naming patterns
            all_names = table_names + column_names
            
            # Apply pre-defined naming patterns
            for pattern_name, pattern_info in self.naming_patterns.items():
                matches = []
                regex = re.compile(pattern_info["regex"])
                
                for name in all_names:
                    if regex.match(name):
                        matches.append(name)
                
                if len(matches) >= config.min_support:
                    confidence = min(pattern_info["confidence"], len(matches) / len(all_names))
                    
                    pattern_result = PatternAnalysisResult(
                        pattern_id=f"naming_{pattern_name}_{uuid.uuid4().hex[:8]}",
                        pattern_type=PatternType.NAMING_CONVENTION,
                        pattern_expression=pattern_info["regex"],
                        confidence_score=confidence,
                        support_count=len(matches),
                        complexity=PatternComplexity.SIMPLE,
                        semantic_meaning=pattern_info["description"],
                        business_relevance=0.6,  # Naming patterns have moderate business relevance
                        applicable_contexts=[ctx["name"] for ctx in naming_contexts if ctx["name"] in matches],
                        generated_rules=[],
                        optimization_suggestions=[],
                        validation_results={"matches": len(matches), "total": len(all_names)}
                    )
                    
                    patterns.append(pattern_result)
            
            # Discover custom naming patterns
            custom_patterns = await self._discover_custom_naming_patterns(
                all_names, naming_contexts, config
            )
            patterns.extend(custom_patterns)
            
            logger.info(f"Discovered {len(patterns)} naming patterns")
            return patterns
            
        except Exception as e:
            logger.error(f"Naming pattern discovery failed: {str(e)}")
            return patterns

    async def _discover_semantic_patterns(
        self,
        source_data: Dict[str, List[Dict[str, Any]]],
        config: PatternDiscoveryConfig,
        db: Session
    ) -> List[PatternAnalysisResult]:
        """Discover semantic content patterns using NLP and ML"""
        
        patterns = []
        
        try:
            # Collect textual data for semantic analysis
            text_corpus = []
            text_contexts = []
            
            for source_id, data_entries in source_data.items():
                for entry in data_entries:
                    # Column names and table names as semantic indicators
                    text_elements = []
                    
                    if entry.get("column_name"):
                        text_elements.append(entry["column_name"])
                    if entry.get("table_name"):
                        text_elements.append(entry["table_name"])
                    
                    # Sample values for content analysis
                    if "sample_values" in entry and entry["sample_values"]:
                        for value in entry["sample_values"][:3]:
                            if isinstance(value, str) and len(value.strip()) > 0:
                                text_elements.append(value.strip())
                    
                    if text_elements:
                        combined_text = " ".join(text_elements)
                        text_corpus.append(combined_text)
                        text_contexts.append(entry)
            
            if not text_corpus:
                return patterns
            
            # Apply pre-defined semantic patterns
            for pattern_name, pattern_info in self.semantic_patterns.items():
                semantic_matches = []
                match_contexts = []
                
                keywords = pattern_info["keywords"]
                for i, text in enumerate(text_corpus):
                    text_lower = text.lower()
                    if any(keyword in text_lower for keyword in keywords):
                        semantic_matches.append(text)
                        match_contexts.append(text_contexts[i])
                
                if len(semantic_matches) >= config.min_support:
                    confidence = min(pattern_info["confidence"], len(semantic_matches) / len(text_corpus))
                    
                    # Create keyword-based pattern expression
                    pattern_expr = f"contains_any({', '.join(keywords)})"
                    
                    pattern_result = PatternAnalysisResult(
                        pattern_id=f"semantic_{pattern_name}_{uuid.uuid4().hex[:8]}",
                        pattern_type=PatternType.SEMANTIC_CONTENT,
                        pattern_expression=pattern_expr,
                        confidence_score=confidence,
                        support_count=len(semantic_matches),
                        complexity=PatternComplexity.MODERATE,
                        semantic_meaning=pattern_info["description"],
                        business_relevance=self._calculate_business_relevance(
                            pattern_info["category"], semantic_matches
                        ),
                        applicable_contexts=[
                            f"{ctx.get('table_name', '')}.{ctx.get('column_name', '')}"
                            for ctx in match_contexts
                            if ctx.get('column_name')
                        ],
                        generated_rules=[],
                        optimization_suggestions=[],
                        validation_results={"matches": len(semantic_matches), "total": len(text_corpus)}
                    )
                    
                    patterns.append(pattern_result)
            
            # Advanced semantic analysis using NLP
            if config.enable_semantic_analysis and len(text_corpus) > 10:
                nlp_patterns = await self._nlp_semantic_analysis(
                    text_corpus, text_contexts, config
                )
                patterns.extend(nlp_patterns)
            
            logger.info(f"Discovered {len(patterns)} semantic patterns")
            return patterns
            
        except Exception as e:
            logger.error(f"Semantic pattern discovery failed: {str(e)}")
            return patterns

    async def _discover_structural_patterns(
        self,
        source_data: Dict[str, List[Dict[str, Any]]],
        config: PatternDiscoveryConfig
    ) -> List[PatternAnalysisResult]:
        """Discover structural patterns in database schemas"""
        
        patterns = []
        
        try:
            # Analyze table structures
            table_structures = defaultdict(list)
            schema_patterns = defaultdict(int)
            
            for source_id, data_entries in source_data.items():
                for entry in data_entries:
                    table_key = f"{entry.get('schema_name', '')}.{entry.get('table_name', '')}"
                    table_structures[table_key].append({
                        "column": entry.get("column_name", ""),
                        "type": entry.get("data_type", ""),
                        "source": source_id
                    })
                    
                    # Track schema-level patterns
                    if entry.get("data_type"):
                        schema_patterns[entry["data_type"]] += 1
            
            # Detect common table structures
            structure_patterns = await self._analyze_table_structures(
                table_structures, config
            )
            patterns.extend(structure_patterns)
            
            # Detect data type distribution patterns
            type_patterns = await self._analyze_data_type_patterns(
                schema_patterns, config
            )
            patterns.extend(type_patterns)
            
            logger.info(f"Discovered {len(patterns)} structural patterns")
            return patterns
            
        except Exception as e:
            logger.error(f"Structural pattern discovery failed: {str(e)}")
            return patterns

    async def _discover_statistical_patterns(
        self,
        source_data: Dict[str, List[Dict[str, Any]]],
        config: PatternDiscoveryConfig
    ) -> List[PatternAnalysisResult]:
        """Discover statistical patterns in data distributions"""
        
        patterns = []
        
        try:
            # Collect numerical data for statistical analysis
            numerical_data = []
            data_contexts = []
            
            for source_id, data_entries in source_data.items():
                for entry in data_entries:
                    if "sample_values" in entry and entry["sample_values"]:
                        for value in entry["sample_values"]:
                            try:
                                # Try to convert to numerical value
                                if isinstance(value, (int, float)):
                                    numerical_data.append(float(value))
                                    data_contexts.append(entry)
                                elif isinstance(value, str) and value.replace('.', '').replace('-', '').isdigit():
                                    numerical_data.append(float(value))
                                    data_contexts.append(entry)
                            except (ValueError, TypeError):
                                continue
            
            if len(numerical_data) >= config.min_support:
                # Statistical analysis
                stats_patterns = await self._statistical_analysis(
                    numerical_data, data_contexts, config
                )
                patterns.extend(stats_patterns)
            
            logger.info(f"Discovered {len(patterns)} statistical patterns")
            return patterns
            
        except Exception as e:
            logger.error(f"Statistical pattern discovery failed: {str(e)}")
            return patterns

    async def _ml_format_pattern_discovery(
        self,
        values: List[str],
        contexts: List[Dict[str, Any]],
        config: PatternDiscoveryConfig
    ) -> List[PatternAnalysisResult]:
        """Use ML to discover new format patterns"""
        
        patterns = []
        
        try:
            # Cluster similar values
            if len(values) < 10:
                return patterns
            
            # Extract features from values
            features = []
            for value in values:
                feature_vector = self._extract_value_features(value)
                features.append(feature_vector)
            
            # Apply clustering
            features_array = np.array(features)
            
            # Try different cluster numbers
            best_clusters = None
            best_score = -1
            
            for n_clusters in range(2, min(10, len(values) // 3)):
                try:
                    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
                    cluster_labels = kmeans.fit_predict(features_array)
                    score = silhouette_score(features_array, cluster_labels)
                    
                    if score > best_score:
                        best_score = score
                        best_clusters = cluster_labels
                except:
                    continue
            
            if best_clusters is not None:
                # Analyze each cluster for patterns
                clusters = defaultdict(list)
                for i, label in enumerate(best_clusters):
                    clusters[label].append((values[i], contexts[i]))
                
                for cluster_id, cluster_values in clusters.items():
                    if len(cluster_values) >= config.min_support:
                        # Try to generate regex pattern for cluster
                        cluster_pattern = self._generate_cluster_pattern(
                            [v[0] for v in cluster_values]
                        )
                        
                        if cluster_pattern:
                            pattern_result = PatternAnalysisResult(
                                pattern_id=f"ml_format_cluster_{cluster_id}_{uuid.uuid4().hex[:8]}",
                                pattern_type=PatternType.DATA_FORMAT,
                                pattern_expression=cluster_pattern,
                                confidence_score=min(0.8, best_score),
                                support_count=len(cluster_values),
                                complexity=PatternComplexity.MODERATE,
                                semantic_meaning=f"ML-discovered format pattern cluster {cluster_id}",
                                business_relevance=0.7,
                                applicable_contexts=[
                                    f"{ctx['table_name']}.{ctx['column_name']}"
                                    for _, ctx in cluster_values
                                    if ctx.get('column_name')
                                ],
                                generated_rules=[],
                                optimization_suggestions=["Validate pattern with domain expert"],
                                validation_results={"cluster_score": best_score, "cluster_size": len(cluster_values)}
                            )
                            
                            patterns.append(pattern_result)
            
            return patterns
            
        except Exception as e:
            logger.error(f"ML format pattern discovery failed: {str(e)}")
            return patterns

    def _extract_value_features(self, value: str) -> List[float]:
        """Extract numerical features from string values for ML analysis"""
        
        features = []
        
        # Length features
        features.append(len(value))
        features.append(len(value.split()))
        
        # Character type ratios
        total_chars = len(value) if len(value) > 0 else 1
        features.append(sum(1 for c in value if c.isdigit()) / total_chars)
        features.append(sum(1 for c in value if c.isalpha()) / total_chars)
        features.append(sum(1 for c in value if c.isspace()) / total_chars)
        features.append(sum(1 for c in value if not c.isalnum() and not c.isspace()) / total_chars)
        
        # Pattern features
        features.append(1.0 if re.search(r'\d', value) else 0.0)  # Contains digits
        features.append(1.0 if re.search(r'[A-Z]', value) else 0.0)  # Contains uppercase
        features.append(1.0 if re.search(r'[a-z]', value) else 0.0)  # Contains lowercase
        features.append(1.0 if re.search(r'[^\w\s]', value) else 0.0)  # Contains special chars
        
        # Format-specific features
        features.append(1.0 if '@' in value else 0.0)  # Potential email
        features.append(1.0 if re.search(r'\d{3}[-.]?\d{3}[-.]?\d{4}', value) else 0.0)  # Potential phone
        features.append(1.0 if re.search(r'\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}', value) else 0.0)  # Potential card
        
        return features

    def _generate_cluster_pattern(self, values: List[str]) -> Optional[str]:
        """Generate a regex pattern that matches values in a cluster"""
        
        try:
            if len(values) < 2:
                return None
            
            # Find common structure
            min_length = min(len(v) for v in values)
            max_length = max(len(v) for v in values)
            
            # If lengths are very different, hard to create pattern
            if max_length > min_length * 2:
                return None
            
            # Simple pattern generation - can be enhanced with more sophisticated algorithms
            pattern_parts = []
            
            # Analyze character by character for common positions
            for pos in range(min_length):
                chars_at_pos = [v[pos] for v in values if pos < len(v)]
                unique_chars = set(chars_at_pos)
                
                if len(unique_chars) == 1:
                    # All values have same character at this position
                    char = list(unique_chars)[0]
                    if char in r'\.^$*+?{}[]|()':
                        pattern_parts.append(f'\\{char}')
                    else:
                        pattern_parts.append(char)
                elif all(c.isdigit() for c in unique_chars):
                    pattern_parts.append(r'\d')
                elif all(c.isalpha() for c in unique_chars):
                    pattern_parts.append(r'[a-zA-Z]')
                else:
                    pattern_parts.append(r'.')
            
            # Handle variable length
            if max_length > min_length:
                pattern_parts.append(r'.*')
            
            return ''.join(pattern_parts)
            
        except Exception as e:
            logger.warning(f"Failed to generate cluster pattern: {str(e)}")
            return None

    def _calculate_business_relevance(
        self,
        category: PatternCategory,
        matches: List[str]
    ) -> float:
        """Calculate business relevance score for a pattern"""
        
        # Base relevance by category
        category_scores = {
            PatternCategory.PII: 0.9,
            PatternCategory.FINANCIAL: 0.85,
            PatternCategory.COMPLIANCE: 0.8,
            PatternCategory.TECHNICAL: 0.6,
            PatternCategory.STRUCTURAL: 0.5,
            PatternCategory.TEMPORAL: 0.7
        }
        
        base_score = category_scores.get(category, 0.5)
        
        # Adjust based on match count
        match_factor = min(1.0, len(matches) / 100)  # More matches = higher relevance
        
        return min(1.0, base_score * (0.5 + 0.5 * match_factor))

    async def analyze_pattern_performance(
        self,
        pattern_id: str,
        performance_data: Dict[str, Any],
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """Analyze and track pattern performance over time"""
        
        try:
            if not db:
                db = next(get_session())
            
            # Update performance tracking
            if pattern_id not in self._pattern_performance:
                self._pattern_performance[pattern_id] = {
                    "total_matches": 0,
                    "true_positives": 0,
                    "false_positives": 0,
                    "accuracy": 0.0,
                    "usage_count": 0,
                    "last_updated": datetime.utcnow(),
                    "performance_history": []
                }
            
            pattern_perf = self._pattern_performance[pattern_id]
            
            # Update statistics
            pattern_perf["total_matches"] += performance_data.get("matches", 0)
            pattern_perf["true_positives"] += performance_data.get("true_positives", 0)
            pattern_perf["false_positives"] += performance_data.get("false_positives", 0)
            pattern_perf["usage_count"] += 1
            
            # Calculate accuracy
            total_predictions = pattern_perf["true_positives"] + pattern_perf["false_positives"]
            if total_predictions > 0:
                pattern_perf["accuracy"] = pattern_perf["true_positives"] / total_predictions
            
            # Store performance snapshot
            pattern_perf["performance_history"].append({
                "timestamp": datetime.utcnow(),
                "accuracy": pattern_perf["accuracy"],
                "matches": performance_data.get("matches", 0),
                "context": performance_data.get("context", {})
            })
            
            # Limit history size
            if len(pattern_perf["performance_history"]) > 100:
                pattern_perf["performance_history"] = pattern_perf["performance_history"][-100:]
            
            pattern_perf["last_updated"] = datetime.utcnow()
            
            return {
                "pattern_id": pattern_id,
                "current_accuracy": pattern_perf["accuracy"],
                "total_usage": pattern_perf["usage_count"],
                "performance_trend": self._calculate_performance_trend(pattern_perf),
                "recommendations": self._generate_performance_recommendations(pattern_perf)
            }
            
        except Exception as e:
            logger.error(f"Pattern performance analysis failed: {str(e)}")
            return {"error": str(e)}

    def _calculate_performance_trend(self, pattern_perf: Dict[str, Any]) -> str:
        """Calculate performance trend for a pattern"""
        
        history = pattern_perf["performance_history"]
        if len(history) < 5:
            return "insufficient_data"
        
        # Look at recent accuracy trend
        recent_accuracies = [h["accuracy"] for h in history[-5:]]
        
        if len(recent_accuracies) >= 2:
            trend = recent_accuracies[-1] - recent_accuracies[0]
            if trend > 0.05:
                return "improving"
            elif trend < -0.05:
                return "declining"
            else:
                return "stable"
        
        return "stable"

    def _generate_performance_recommendations(
        self,
        pattern_perf: Dict[str, Any]
    ) -> List[str]:
        """Generate recommendations based on pattern performance"""
        
        recommendations = []
        accuracy = pattern_perf["accuracy"]
        usage_count = pattern_perf["usage_count"]
        
        if accuracy < 0.7:
            recommendations.append("Pattern accuracy is low - consider refinement or additional training data")
        
        if usage_count > 100 and accuracy > 0.9:
            recommendations.append("High-performing pattern - consider promoting to production rule set")
        
        if len(pattern_perf["performance_history"]) > 10:
            trend = self._calculate_performance_trend(pattern_perf)
            if trend == "declining":
                recommendations.append("Pattern performance is declining - investigate data drift or rule conflicts")
        
        return recommendations

    async def generate_intelligent_rules(
        self,
        patterns: List[PatternAnalysisResult],
        rule_template: Optional[Dict[str, Any]] = None,
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """Generate intelligent scan rules from discovered patterns"""
        
        generated_rules = []
        
        try:
            for pattern in patterns:
                # Skip low-confidence patterns
                if pattern.confidence_score < self.min_confidence_score:
                    continue
                
                # Generate rule based on pattern type
                rule_config = await self._generate_rule_config(pattern, rule_template)
                
                if rule_config:
                    generated_rules.append(rule_config)
            
            logger.info(f"Generated {len(generated_rules)} intelligent rules from patterns")
            return generated_rules
            
        except Exception as e:
            logger.error(f"Rule generation failed: {str(e)}")
            return []

    async def _generate_rule_config(
        self,
        pattern: PatternAnalysisResult,
        template: Optional[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Generate rule configuration from a pattern"""
        
        try:
            rule_config = {
                "rule_id": f"generated_{pattern.pattern_id}",
                "name": f"Auto-Generated Rule: {pattern.semantic_meaning or pattern.pattern_type}",
                "description": f"Automatically generated from pattern analysis: {pattern.semantic_meaning}",
                "pattern_expression": pattern.pattern_expression,
                "pattern_type": pattern.pattern_type,
                "confidence_score": pattern.confidence_score,
                "business_relevance": pattern.business_relevance,
                "applicable_contexts": pattern.applicable_contexts,
                "rule_conditions": self._create_rule_conditions(pattern),
                "rule_actions": self._create_rule_actions(pattern),
                "metadata": {
                    "generated_from_pattern": pattern.pattern_id,
                    "generation_timestamp": datetime.utcnow().isoformat(),
                    "support_count": pattern.support_count,
                    "complexity": pattern.complexity
                }
            }
            
            # Apply template if provided
            if template:
                rule_config.update(template)
            
            return rule_config
            
        except Exception as e:
            logger.error(f"Failed to generate rule config: {str(e)}")
            return None

    def _create_rule_conditions(self, pattern: PatternAnalysisResult) -> List[Dict[str, Any]]:
        """Create rule conditions from pattern"""
        
        conditions = []
        
        if pattern.pattern_type == PatternType.DATA_FORMAT:
            conditions.append({
                "type": "regex_match",
                "field": "column_value",
                "pattern": pattern.pattern_expression,
                "confidence_threshold": pattern.confidence_score
            })
        
        elif pattern.pattern_type == PatternType.NAMING_CONVENTION:
            conditions.append({
                "type": "name_pattern",
                "field": "column_name",
                "pattern": pattern.pattern_expression,
                "scope": pattern.applicable_contexts
            })
        
        elif pattern.pattern_type == PatternType.SEMANTIC_CONTENT:
            conditions.append({
                "type": "semantic_analysis",
                "field": "column_metadata",
                "semantic_indicators": pattern.pattern_expression,
                "business_relevance_threshold": pattern.business_relevance
            })
        
        return conditions

    def _create_rule_actions(self, pattern: PatternAnalysisResult) -> List[Dict[str, Any]]:
        """Create rule actions from pattern"""
        
        actions = []
        
        # Standard classification action
        if pattern.business_relevance > 0.7:
            actions.append({
                "type": "classify",
                "classification": self._infer_classification_from_pattern(pattern),
                "confidence": pattern.confidence_score
            })
        
        # Tagging action
        actions.append({
            "type": "tag",
            "tags": [f"pattern_{pattern.pattern_type}", f"ai_generated"],
            "metadata": {
                "pattern_id": pattern.pattern_id,
                "discovery_method": "intelligent_pattern_analysis"
            }
        })
        
        # Quality check action for high-confidence patterns
        if pattern.confidence_score > 0.8:
            actions.append({
                "type": "quality_check",
                "checks": ["completeness", "validity"],
                "pattern_validation": pattern.pattern_expression
            })
        
        return actions

    def _infer_classification_from_pattern(self, pattern: PatternAnalysisResult) -> str:
        """Infer data classification from pattern characteristics"""
        
        # Map pattern types to classifications
        if pattern.pattern_type == PatternType.DATA_FORMAT:
            if "email" in pattern.semantic_meaning.lower():
                return "PII_Email"
            elif "phone" in pattern.semantic_meaning.lower():
                return "PII_Phone"
            elif "ssn" in pattern.semantic_meaning.lower():
                return "PII_SSN"
            elif "credit" in pattern.semantic_meaning.lower():
                return "Financial_CreditCard"
        
        elif pattern.pattern_type == PatternType.SEMANTIC_CONTENT:
            if "personal" in pattern.semantic_meaning.lower():
                return "PII_Personal"
            elif "financial" in pattern.semantic_meaning.lower():
                return "Financial_General"
        
        return "General_Structured"

    # Additional helper methods for advanced pattern analysis
    
    async def _cluster_patterns(
        self,
        patterns: List[PatternAnalysisResult],
        config: PatternDiscoveryConfig
    ) -> List[PatternAnalysisResult]:
        """Cluster similar patterns to reduce redundancy"""
        
        try:
            if len(patterns) < 5:
                return patterns
            
            # Extract features for clustering
            pattern_features = []
            for pattern in patterns:
                features = [
                    pattern.confidence_score,
                    pattern.support_count / 100,  # Normalize
                    pattern.business_relevance,
                    len(pattern.applicable_contexts),
                    hash(pattern.pattern_type) % 1000 / 1000  # Normalize hash
                ]
                pattern_features.append(features)
            
            # Apply clustering
            features_array = np.array(pattern_features)
            dbscan = DBSCAN(eps=0.3, min_samples=2)
            cluster_labels = dbscan.fit_predict(features_array)
            
            # Group patterns by cluster
            clustered_patterns = []
            clusters = defaultdict(list)
            
            for i, label in enumerate(cluster_labels):
                if label == -1:  # Noise/outlier patterns
                    clustered_patterns.append(patterns[i])
                else:
                    clusters[label].append(patterns[i])
            
            # Select best pattern from each cluster
            for cluster_patterns in clusters.values():
                # Select pattern with highest confidence * business_relevance score
                best_pattern = max(
                    cluster_patterns,
                    key=lambda p: p.confidence_score * p.business_relevance
                )
                clustered_patterns.append(best_pattern)
            
            return clustered_patterns
            
        except Exception as e:
            logger.error(f"Pattern clustering failed: {str(e)}")
            return patterns

    async def _filter_and_rank_patterns(
        self,
        patterns: List[PatternAnalysisResult],
        config: PatternDiscoveryConfig
    ) -> List[PatternAnalysisResult]:
        """Filter and rank patterns by quality and relevance"""
        
        # Filter by confidence threshold
        filtered = [
            p for p in patterns
            if p.confidence_score >= config.confidence_threshold
            and p.support_count >= config.min_support
        ]
        
        # Rank by composite score
        def pattern_score(pattern: PatternAnalysisResult) -> float:
            return (
                pattern.confidence_score * 0.4 +
                pattern.business_relevance * 0.3 +
                min(1.0, pattern.support_count / 50) * 0.2 +
                (1.0 if pattern.complexity in [PatternComplexity.MODERATE, PatternComplexity.COMPLEX] else 0.5) * 0.1
            )
        
        ranked = sorted(filtered, key=pattern_score, reverse=True)
        
        # Limit to max patterns
        return ranked[:config.max_patterns]

    async def _cache_discovered_patterns(self, patterns: List[PatternAnalysisResult]):
        """Cache discovered patterns for future use"""
        
        try:
            for pattern in patterns:
                cache_key = f"pattern_{pattern.pattern_id}"
                cache_entry = {
                    "pattern": pattern,
                    "cached_at": datetime.utcnow(),
                    "access_count": 0
                }
                
                self._pattern_cache[cache_key] = cache_entry
            
            # Clean old cache entries
            if len(self._pattern_cache) > self.max_cache_size:
                # Remove oldest entries
                sorted_cache = sorted(
                    self._pattern_cache.items(),
                    key=lambda x: x[1]["cached_at"]
                )
                
                # Keep only the most recent entries
                self._pattern_cache = dict(sorted_cache[-self.max_cache_size//2:])
            
        except Exception as e:
            logger.error(f"Pattern caching failed: {str(e)}")

    # Placeholder methods for additional analysis types
    
    async def _discover_custom_naming_patterns(
        self,
        names: List[str],
        contexts: List[Dict[str, Any]],
        config: PatternDiscoveryConfig
    ) -> List[PatternAnalysisResult]:
        """Discover custom naming patterns using advanced analysis"""
        # Implementation would use advanced NLP and ML techniques
        return []

    async def _nlp_semantic_analysis(
        self,
        text_corpus: List[str],
        contexts: List[Dict[str, Any]],
        config: PatternDiscoveryConfig
    ) -> List[PatternAnalysisResult]:
        """Perform advanced NLP semantic analysis"""
        # Implementation would use advanced NLP models
        return []

    async def _analyze_table_structures(
        self,
        table_structures: Dict[str, List[Dict[str, Any]]],
        config: PatternDiscoveryConfig
    ) -> List[PatternAnalysisResult]:
        """Analyze common table structure patterns"""
        # Implementation would analyze structural similarities
        return []

    async def _analyze_data_type_patterns(
        self,
        type_distribution: Dict[str, int],
        config: PatternDiscoveryConfig
    ) -> List[PatternAnalysisResult]:
        """Analyze data type distribution patterns"""
        # Implementation would analyze type usage patterns
        return []

    async def _statistical_analysis(
        self,
        numerical_data: List[float],
        contexts: List[Dict[str, Any]],
        config: PatternDiscoveryConfig
    ) -> List[PatternAnalysisResult]:
        """Perform statistical analysis on numerical data"""
        # Implementation would perform statistical pattern analysis
        return []

    async def _generate_rules_from_pattern(
        self,
        pattern: PatternAnalysisResult,
        db: Session
    ) -> List[Dict[str, Any]]:
        """Generate rules from a single pattern"""
        return await self.generate_intelligent_rules([pattern], db=db)


# Export the service
__all__ = [
    "IntelligentPatternService", "PatternDiscoveryConfig", "PatternAnalysisResult",
    "PatternType", "LearningMode", "PatternComplexity"
]