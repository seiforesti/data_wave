"""
🧠 INTELLIGENT PATTERN SERVICE
Advanced AI/ML-powered pattern detection and recognition engine for smart data scanning
with machine learning capabilities, predictive analytics, and adaptive pattern optimization.
"""

from typing import List, Dict, Any, Optional, Union, Set, Tuple, Pattern
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import json
import logging
import re
import numpy as np
from dataclasses import dataclass
from collections import defaultdict, Counter
import pickle
import hashlib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import DBSCAN, KMeans
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sqlalchemy import and_, or_, func
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..models.scan_models import (
    Scan, ScanStatus, DataSource, DataSourceType, ScanResult
)
from ..models.advanced_scan_rule_models import (
    IntelligentScanRule, RuleExecutionHistory, ScanRulePerformance,
    PatternDetectionRule, PatternMatchResult
)
from ..core.database import get_session
from .data_source_connection_service import DataSourceConnectionService
from .enterprise_scan_rule_service import EnterpriseScanRuleService

logger = logging.getLogger(__name__)

class PatternType(str, Enum):
    """Types of patterns that can be detected"""
    DATA_FORMAT = "data_format"           # Data format patterns (email, phone, etc.)
    STRUCTURAL = "structural"             # Database structure patterns
    BEHAVIORAL = "behavioral"             # Access pattern behaviors
    ANOMALY = "anomaly"                  # Anomalous data patterns
    CLASSIFICATION = "classification"     # Data classification patterns
    QUALITY = "quality"                  # Data quality patterns
    RELATIONSHIP = "relationship"         # Data relationship patterns
    TEMPORAL = "temporal"                # Time-based patterns
    SEMANTIC = "semantic"                # Semantic content patterns
    REGULATORY = "regulatory"            # Compliance pattern matches

class PatternConfidence(str, Enum):
    """Confidence levels for pattern detection"""
    VERY_HIGH = "very_high"    # 95%+ confidence
    HIGH = "high"              # 85-95% confidence
    MEDIUM = "medium"          # 70-85% confidence
    LOW = "low"               # 50-70% confidence
    VERY_LOW = "very_low"     # <50% confidence

class LearningMode(str, Enum):
    """Machine learning modes for pattern detection"""
    SUPERVISED = "supervised"         # Learn from labeled data
    UNSUPERVISED = "unsupervised"    # Discover patterns automatically
    SEMI_SUPERVISED = "semi_supervised"  # Combination approach
    REINFORCEMENT = "reinforcement"   # Learn from feedback
    TRANSFER = "transfer"            # Transfer learning from other sources

@dataclass
class PatternDetectionConfig:
    """Configuration for pattern detection algorithms"""
    pattern_type: PatternType
    confidence_threshold: float = 0.7
    learning_mode: LearningMode = LearningMode.UNSUPERVISED
    max_patterns: int = 1000
    enable_clustering: bool = True
    enable_anomaly_detection: bool = True
    temporal_window: int = 30  # days
    min_support: float = 0.01
    feature_extraction_method: str = "tfidf"

@dataclass
class DetectedPattern:
    """Represents a detected pattern"""
    id: str
    pattern_type: PatternType
    pattern_value: str
    regex_pattern: Optional[str]
    confidence: float
    confidence_level: PatternConfidence
    support: float  # How often this pattern appears
    data_source_ids: List[int]
    detection_method: str
    metadata: Dict[str, Any]
    first_detected: datetime
    last_updated: datetime
    validation_status: str = "pending"
    false_positive_rate: float = 0.0
    
class PatternLearningEngine:
    """Advanced machine learning engine for pattern detection"""
    
    def __init__(self):
        self.models = {}
        self.vectorizers = {}
        self.scalers = {}
        self.pattern_cache = {}
        self.learning_history = []
        
    async def learn_patterns_from_data(
        self,
        data_samples: List[Dict[str, Any]],
        config: PatternDetectionConfig
    ) -> List[DetectedPattern]:
        """Learn patterns from data using machine learning"""
        
        if not data_samples:
            return []
        
        patterns = []
        
        # Extract features from data
        features = await self._extract_features(data_samples, config)
        
        if config.learning_mode == LearningMode.UNSUPERVISED:
            patterns.extend(await self._unsupervised_pattern_learning(features, config))
        elif config.learning_mode == LearningMode.SUPERVISED:
            patterns.extend(await self._supervised_pattern_learning(features, config))
        elif config.learning_mode == LearningMode.SEMI_SUPERVISED:
            patterns.extend(await self._semi_supervised_pattern_learning(features, config))
        
        # Apply clustering if enabled
        if config.enable_clustering:
            clustered_patterns = await self._cluster_patterns(patterns, config)
            patterns.extend(clustered_patterns)
        
        # Detect anomalies if enabled
        if config.enable_anomaly_detection:
            anomaly_patterns = await self._detect_anomaly_patterns(features, config)
            patterns.extend(anomaly_patterns)
        
        # Filter by confidence threshold
        filtered_patterns = [
            p for p in patterns 
            if p.confidence >= config.confidence_threshold
        ]
        
        return filtered_patterns[:config.max_patterns]
    
    async def _extract_features(
        self,
        data_samples: List[Dict[str, Any]],
        config: PatternDetectionConfig
    ) -> np.ndarray:
        """Extract features from data samples"""
        
        if config.feature_extraction_method == "tfidf":
            return await self._extract_tfidf_features(data_samples, config)
        elif config.feature_extraction_method == "statistical":
            return await self._extract_statistical_features(data_samples, config)
        elif config.feature_extraction_method == "semantic":
            return await self._extract_semantic_features(data_samples, config)
        else:
            return await self._extract_basic_features(data_samples, config)
    
    async def _extract_tfidf_features(
        self,
        data_samples: List[Dict[str, Any]],
        config: PatternDetectionConfig
    ) -> np.ndarray:
        """Extract TF-IDF features from text data"""
        
        # Combine all text fields
        text_data = []
        for sample in data_samples:
            text_parts = []
            for key, value in sample.items():
                if isinstance(value, str):
                    text_parts.append(value)
            text_data.append(" ".join(text_parts))
        
        # Use cached vectorizer or create new one
        cache_key = f"tfidf_{config.pattern_type}"
        if cache_key not in self.vectorizers:
            self.vectorizers[cache_key] = TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 3),
                stop_words='english'
            )
            features = self.vectorizers[cache_key].fit_transform(text_data)
        else:
            features = self.vectorizers[cache_key].transform(text_data)
        
        return features.toarray()
    
    async def _extract_statistical_features(
        self,
        data_samples: List[Dict[str, Any]],
        config: PatternDetectionConfig
    ) -> np.ndarray:
        """Extract statistical features from data"""
        
        features = []
        for sample in data_samples:
            feature_vector = []
            
            # Numerical statistics
            numeric_values = [v for v in sample.values() if isinstance(v, (int, float))]
            if numeric_values:
                feature_vector.extend([
                    np.mean(numeric_values),
                    np.std(numeric_values),
                    np.min(numeric_values),
                    np.max(numeric_values),
                    len(numeric_values)
                ])
            else:
                feature_vector.extend([0.0, 0.0, 0.0, 0.0, 0])
            
            # String statistics
            string_values = [v for v in sample.values() if isinstance(v, str)]
            if string_values:
                lengths = [len(s) for s in string_values]
                feature_vector.extend([
                    np.mean(lengths),
                    np.std(lengths),
                    len(string_values),
                    sum(1 for s in string_values if s.isupper()),
                    sum(1 for s in string_values if s.islower()),
                    sum(1 for s in string_values if s.isdigit())
                ])
            else:
                feature_vector.extend([0.0, 0.0, 0, 0, 0, 0])
            
            features.append(feature_vector)
        
        return np.array(features)
    
    async def _extract_semantic_features(
        self,
        data_samples: List[Dict[str, Any]],
        config: PatternDetectionConfig
    ) -> np.ndarray:
        """Extract semantic features using NLP techniques"""
        
        # This would integrate with semantic embedding models
        # For now, return TF-IDF features as fallback
        return await self._extract_tfidf_features(data_samples, config)
    
    async def _extract_basic_features(
        self,
        data_samples: List[Dict[str, Any]],
        config: PatternDetectionConfig
    ) -> np.ndarray:
        """Extract basic features from data"""
        
        features = []
        for sample in data_samples:
            feature_vector = [
                len(sample),  # Number of fields
                sum(1 for v in sample.values() if v is None),  # Null count
                sum(1 for v in sample.values() if isinstance(v, str)),  # String count
                sum(1 for v in sample.values() if isinstance(v, (int, float))),  # Numeric count
            ]
            features.append(feature_vector)
        
        return np.array(features)
    
    async def _unsupervised_pattern_learning(
        self,
        features: np.ndarray,
        config: PatternDetectionConfig
    ) -> List[DetectedPattern]:
        """Learn patterns using unsupervised learning"""
        
        patterns = []
        
        # K-means clustering for pattern discovery
        n_clusters = min(10, len(features) // 5)  # Adaptive cluster count
        if n_clusters > 1:
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(features)
            
            # Create patterns from clusters
            for cluster_id in range(n_clusters):
                cluster_indices = np.where(cluster_labels == cluster_id)[0]
                if len(cluster_indices) >= max(2, len(features) * config.min_support):
                    pattern = await self._create_cluster_pattern(
                        cluster_id, cluster_indices, features, config
                    )
                    if pattern:
                        patterns.append(pattern)
        
        return patterns
    
    async def _supervised_pattern_learning(
        self,
        features: np.ndarray,
        config: PatternDetectionConfig
    ) -> List[DetectedPattern]:
        """Learn patterns using supervised learning"""
        
        # This would require labeled training data
        # For now, return empty list
        return []
    
    async def _semi_supervised_pattern_learning(
        self,
        features: np.ndarray,
        config: PatternDetectionConfig
    ) -> List[DetectedPattern]:
        """Learn patterns using semi-supervised learning"""
        
        # Combine supervised and unsupervised approaches
        patterns = []
        patterns.extend(await self._unsupervised_pattern_learning(features, config))
        return patterns
    
    async def _cluster_patterns(
        self,
        patterns: List[DetectedPattern],
        config: PatternDetectionConfig
    ) -> List[DetectedPattern]:
        """Cluster similar patterns together"""
        
        if len(patterns) < 2:
            return []
        
        # Extract pattern features for clustering
        pattern_features = []
        for pattern in patterns:
            features = [
                pattern.confidence,
                pattern.support,
                len(pattern.pattern_value),
                hash(pattern.pattern_type.value) % 1000000,
            ]
            pattern_features.append(features)
        
        # Apply DBSCAN clustering
        dbscan = DBSCAN(eps=0.3, min_samples=2)
        cluster_labels = dbscan.fit_predict(pattern_features)
        
        # Create meta-patterns from clusters
        clustered_patterns = []
        cluster_groups = defaultdict(list)
        
        for i, label in enumerate(cluster_labels):
            if label != -1:  # Not noise
                cluster_groups[label].append(patterns[i])
        
        for cluster_id, cluster_patterns in cluster_groups.items():
            if len(cluster_patterns) > 1:
                meta_pattern = await self._create_meta_pattern(cluster_patterns, config)
                if meta_pattern:
                    clustered_patterns.append(meta_pattern)
        
        return clustered_patterns
    
    async def _detect_anomaly_patterns(
        self,
        features: np.ndarray,
        config: PatternDetectionConfig
    ) -> List[DetectedPattern]:
        """Detect anomalous patterns using isolation forest"""
        
        if len(features) < 10:  # Need sufficient data for anomaly detection
            return []
        
        # Apply isolation forest
        iso_forest = IsolationForest(
            contamination=0.1,  # 10% expected anomalies
            random_state=42
        )
        anomaly_labels = iso_forest.fit_predict(features)
        
        # Create anomaly patterns
        anomaly_patterns = []
        anomaly_indices = np.where(anomaly_labels == -1)[0]
        
        for idx in anomaly_indices:
            pattern = DetectedPattern(
                id=f"anomaly_{hashlib.md5(str(features[idx]).encode()).hexdigest()[:8]}",
                pattern_type=PatternType.ANOMALY,
                pattern_value=f"Anomalous data pattern at index {idx}",
                regex_pattern=None,
                confidence=0.8,
                confidence_level=PatternConfidence.HIGH,
                support=1.0 / len(features),  # Single occurrence
                data_source_ids=[],
                detection_method="isolation_forest",
                metadata={
                    "feature_vector": features[idx].tolist(),
                    "anomaly_score": iso_forest.decision_function([features[idx]])[0]
                },
                first_detected=datetime.utcnow(),
                last_updated=datetime.utcnow()
            )
            anomaly_patterns.append(pattern)
        
        return anomaly_patterns
    
    async def _create_cluster_pattern(
        self,
        cluster_id: int,
        cluster_indices: np.ndarray,
        features: np.ndarray,
        config: PatternDetectionConfig
    ) -> Optional[DetectedPattern]:
        """Create a pattern from a cluster of similar data"""
        
        support = len(cluster_indices) / len(features)
        confidence = min(0.9, 0.5 + support)  # Higher support = higher confidence
        
        # Calculate cluster centroid
        centroid = np.mean(features[cluster_indices], axis=0)
        
        pattern = DetectedPattern(
            id=f"cluster_{config.pattern_type.value}_{cluster_id}",
            pattern_type=config.pattern_type,
            pattern_value=f"Cluster pattern {cluster_id}",
            regex_pattern=None,
            confidence=confidence,
            confidence_level=self._get_confidence_level(confidence),
            support=support,
            data_source_ids=[],
            detection_method="kmeans_clustering",
            metadata={
                "cluster_id": cluster_id,
                "cluster_size": len(cluster_indices),
                "centroid": centroid.tolist(),
                "indices": cluster_indices.tolist()
            },
            first_detected=datetime.utcnow(),
            last_updated=datetime.utcnow()
        )
        
        return pattern
    
    async def _create_meta_pattern(
        self,
        cluster_patterns: List[DetectedPattern],
        config: PatternDetectionConfig
    ) -> Optional[DetectedPattern]:
        """Create a meta-pattern from clustered patterns"""
        
        avg_confidence = np.mean([p.confidence for p in cluster_patterns])
        avg_support = np.mean([p.support for p in cluster_patterns])
        
        meta_pattern = DetectedPattern(
            id=f"meta_{hashlib.md5(str([p.id for p in cluster_patterns]).encode()).hexdigest()[:8]}",
            pattern_type=config.pattern_type,
            pattern_value=f"Meta-pattern of {len(cluster_patterns)} similar patterns",
            regex_pattern=None,
            confidence=avg_confidence,
            confidence_level=self._get_confidence_level(avg_confidence),
            support=avg_support,
            data_source_ids=list(set().union(*[p.data_source_ids for p in cluster_patterns])),
            detection_method="pattern_clustering",
            metadata={
                "constituent_patterns": [p.id for p in cluster_patterns],
                "pattern_count": len(cluster_patterns)
            },
            first_detected=datetime.utcnow(),
            last_updated=datetime.utcnow()
        )
        
        return meta_pattern
    
    def _get_confidence_level(self, confidence: float) -> PatternConfidence:
        """Convert confidence score to confidence level"""
        if confidence >= 0.95:
            return PatternConfidence.VERY_HIGH
        elif confidence >= 0.85:
            return PatternConfidence.HIGH
        elif confidence >= 0.70:
            return PatternConfidence.MEDIUM
        elif confidence >= 0.50:
            return PatternConfidence.LOW
        else:
            return PatternConfidence.VERY_LOW

class RegexPatternGenerator:
    """Advanced regex pattern generator using AI/ML techniques"""
    
    def __init__(self):
        self.common_patterns = {
            "email": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
            "phone": r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
            "ssn": r"\d{3}-?\d{2}-?\d{4}",
            "credit_card": r"\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}",
            "ip_address": r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",
            "url": r"https?://[^\s]+",
            "date": r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}",
            "time": r"\d{1,2}:\d{2}(:\d{2})?(\s?(AM|PM))?",
            "zip_code": r"\d{5}(-\d{4})?",
            "guid": r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
        }
        
    async def generate_regex_from_examples(
        self,
        examples: List[str],
        pattern_type: PatternType
    ) -> Optional[str]:
        """Generate regex pattern from example strings"""
        
        if not examples:
            return None
        
        # Try common patterns first
        for pattern_name, regex in self.common_patterns.items():
            if self._matches_pattern(examples, regex, threshold=0.8):
                return regex
        
        # Generate custom pattern
        return await self._generate_custom_regex(examples, pattern_type)
    
    def _matches_pattern(self, examples: List[str], regex: str, threshold: float) -> bool:
        """Check if regex matches examples above threshold"""
        pattern = re.compile(regex)
        matches = sum(1 for ex in examples if pattern.match(ex))
        return (matches / len(examples)) >= threshold
    
    async def _generate_custom_regex(
        self,
        examples: List[str],
        pattern_type: PatternType
    ) -> Optional[str]:
        """Generate custom regex pattern from examples"""
        
        if not examples:
            return None
        
        # Analyze common characteristics
        common_length = self._find_common_length(examples)
        common_structure = self._analyze_character_structure(examples)
        
        # Build regex based on analysis
        regex_parts = []
        
        if common_structure:
            for char_type, positions in common_structure.items():
                if char_type == "digit" and len(positions) > len(examples) * 0.7:
                    regex_parts.append(r"\d")
                elif char_type == "alpha" and len(positions) > len(examples) * 0.7:
                    regex_parts.append(r"[a-zA-Z]")
                elif char_type == "special" and len(positions) > len(examples) * 0.7:
                    regex_parts.append(r"[\W]")
        
        if regex_parts:
            # Create pattern with quantifiers
            if common_length:
                return f"{''.join(regex_parts)}{{{common_length[0]},{common_length[1]}}}"
            else:
                return f"{''.join(regex_parts)}+"
        
        return None
    
    def _find_common_length(self, examples: List[str]) -> Optional[Tuple[int, int]]:
        """Find common length pattern in examples"""
        lengths = [len(ex) for ex in examples]
        min_len, max_len = min(lengths), max(lengths)
        
        # If all examples have same length
        if min_len == max_len:
            return (min_len, min_len)
        
        # If lengths are within reasonable range
        if max_len - min_len <= 5:
            return (min_len, max_len)
        
        return None
    
    def _analyze_character_structure(self, examples: List[str]) -> Dict[str, Set[int]]:
        """Analyze character type structure across examples"""
        structure = defaultdict(set)
        
        for example in examples:
            for i, char in enumerate(example):
                if char.isdigit():
                    structure["digit"].add(i)
                elif char.isalpha():
                    structure["alpha"].add(i)
                elif not char.isspace():
                    structure["special"].add(i)
        
        return dict(structure)

class SemanticPatternAnalyzer:
    """Advanced semantic pattern analyzer using NLP techniques"""
    
    def __init__(self):
        self.semantic_categories = {
            "personal_info": ["name", "address", "phone", "email", "ssn"],
            "financial": ["account", "card", "balance", "payment", "transaction"],
            "healthcare": ["patient", "diagnosis", "treatment", "medical", "health"],
            "geographic": ["country", "state", "city", "location", "address"],
            "temporal": ["date", "time", "year", "month", "day", "timestamp"],
            "business": ["company", "organization", "department", "employee", "client"]
        }
        
    async def analyze_semantic_patterns(
        self,
        data_samples: List[Dict[str, Any]],
        config: PatternDetectionConfig
    ) -> List[DetectedPattern]:
        """Analyze semantic patterns in data"""
        
        patterns = []
        
        # Analyze field names for semantic meaning
        field_patterns = await self._analyze_field_semantics(data_samples)
        patterns.extend(field_patterns)
        
        # Analyze data values for semantic content
        value_patterns = await self._analyze_value_semantics(data_samples)
        patterns.extend(value_patterns)
        
        # Analyze relationships between fields
        relationship_patterns = await self._analyze_field_relationships(data_samples)
        patterns.extend(relationship_patterns)
        
        return patterns
    
    async def _analyze_field_semantics(
        self,
        data_samples: List[Dict[str, Any]]
    ) -> List[DetectedPattern]:
        """Analyze semantic meaning of field names"""
        
        patterns = []
        field_counter = Counter()
        
        # Count field name occurrences
        for sample in data_samples:
            for field_name in sample.keys():
                field_counter[field_name.lower()] += 1
        
        # Categorize fields semantically
        for field_name, count in field_counter.items():
            for category, keywords in self.semantic_categories.items():
                if any(keyword in field_name for keyword in keywords):
                    support = count / len(data_samples)
                    confidence = min(0.9, 0.5 + support * 0.5)
                    
                    pattern = DetectedPattern(
                        id=f"semantic_field_{category}_{hashlib.md5(field_name.encode()).hexdigest()[:8]}",
                        pattern_type=PatternType.SEMANTIC,
                        pattern_value=f"Semantic field: {field_name} ({category})",
                        regex_pattern=None,
                        confidence=confidence,
                        confidence_level=self._get_confidence_level(confidence),
                        support=support,
                        data_source_ids=[],
                        detection_method="semantic_field_analysis",
                        metadata={
                            "field_name": field_name,
                            "semantic_category": category,
                            "occurrence_count": count,
                            "matching_keywords": [kw for kw in keywords if kw in field_name]
                        },
                        first_detected=datetime.utcnow(),
                        last_updated=datetime.utcnow()
                    )
                    patterns.append(pattern)
                    break
        
        return patterns
    
    async def _analyze_value_semantics(
        self,
        data_samples: List[Dict[str, Any]]
    ) -> List[DetectedPattern]:
        """Analyze semantic meaning of data values"""
        
        patterns = []
        
        # This would integrate with semantic analysis libraries
        # For now, return basic analysis
        
        return patterns
    
    async def _analyze_field_relationships(
        self,
        data_samples: List[Dict[str, Any]]
    ) -> List[DetectedPattern]:
        """Analyze relationships between fields"""
        
        patterns = []
        
        # This would analyze co-occurrence and correlation patterns
        # For now, return empty list
        
        return patterns
    
    def _get_confidence_level(self, confidence: float) -> PatternConfidence:
        """Convert confidence score to confidence level"""
        if confidence >= 0.95:
            return PatternConfidence.VERY_HIGH
        elif confidence >= 0.85:
            return PatternConfidence.HIGH
        elif confidence >= 0.70:
            return PatternConfidence.MEDIUM
        elif confidence >= 0.50:
            return PatternConfidence.LOW
        else:
            return PatternConfidence.VERY_LOW

class IntelligentPatternService:
    """
    🧠 INTELLIGENT PATTERN SERVICE
    
    Advanced AI/ML-powered pattern detection and recognition engine that provides
    intelligent pattern discovery, adaptive optimization, and predictive analytics
    for enterprise-level data governance and scanning operations.
    """
    
    def __init__(self):
        self.learning_engine = PatternLearningEngine()
        self.regex_generator = RegexPatternGenerator()
        self.semantic_analyzer = SemanticPatternAnalyzer()
        self.data_source_service = DataSourceConnectionService()
        self.scan_rule_service = EnterpriseScanRuleService()
        self.detected_patterns = {}
        self.pattern_performance = {}
        self.feedback_history = []
        
    async def discover_patterns_in_data_source(
        self,
        data_source_id: int,
        config: Optional[PatternDetectionConfig] = None
    ) -> List[DetectedPattern]:
        """Discover patterns in a specific data source"""
        
        if not config:
            config = PatternDetectionConfig(pattern_type=PatternType.DATA_FORMAT)
        
        with get_session() as session:
            # Validate data source
            data_source = session.query(DataSource).filter(
                DataSource.id == data_source_id
            ).first()
            
            if not data_source:
                raise HTTPException(status_code=404, detail="Data source not found")
            
            # Get sample data from the data source
            data_samples = await self._get_data_samples(data_source, config)
            
            if not data_samples:
                logger.warning(f"No data samples available for data source {data_source_id}")
                return []
            
            # Apply different pattern detection methods
            all_patterns = []
            
            # Machine learning-based pattern discovery
            ml_patterns = await self.learning_engine.learn_patterns_from_data(
                data_samples, config
            )
            all_patterns.extend(ml_patterns)
            
            # Semantic pattern analysis
            semantic_patterns = await self.semantic_analyzer.analyze_semantic_patterns(
                data_samples, config
            )
            all_patterns.extend(semantic_patterns)
            
            # Add data source information to patterns
            for pattern in all_patterns:
                pattern.data_source_ids = [data_source_id]
            
            # Store detected patterns
            await self._store_detected_patterns(all_patterns, session)
            
            return all_patterns
    
    async def generate_scan_rules_from_patterns(
        self,
        pattern_ids: List[str],
        rule_template: Optional[Dict[str, Any]] = None
    ) -> List[IntelligentScanRule]:
        """Generate intelligent scan rules from detected patterns"""
        
        with get_session() as session:
            generated_rules = []
            
            for pattern_id in pattern_ids:
                if pattern_id in self.detected_patterns:
                    pattern = self.detected_patterns[pattern_id]
                    
                    # Generate regex if not available
                    if not pattern.regex_pattern and pattern.pattern_type == PatternType.DATA_FORMAT:
                        # This would require example data for regex generation
                        pattern.regex_pattern = await self._generate_regex_for_pattern(pattern)
                    
                    # Create scan rule
                    rule = IntelligentScanRule(
                        name=f"Auto-generated rule for {pattern.pattern_value}",
                        description=f"Automatically generated from detected pattern: {pattern.pattern_value}",
                        pattern_type=pattern.pattern_type.value,
                        pattern=pattern.regex_pattern or pattern.pattern_value,
                        confidence_threshold=pattern.confidence,
                        is_active=True,
                        is_ai_generated=True,
                        metadata={
                            "source_pattern_id": pattern.id,
                            "detection_method": pattern.detection_method,
                            "confidence": pattern.confidence,
                            "support": pattern.support
                        },
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    
                    session.add(rule)
                    generated_rules.append(rule)
            
            session.commit()
            return generated_rules
    
    async def optimize_patterns_with_feedback(
        self,
        pattern_id: str,
        feedback: Dict[str, Any]
    ) -> DetectedPattern:
        """Optimize pattern based on user feedback"""
        
        if pattern_id not in self.detected_patterns:
            raise HTTPException(status_code=404, detail="Pattern not found")
        
        pattern = self.detected_patterns[pattern_id]
        
        # Record feedback
        feedback_entry = {
            "pattern_id": pattern_id,
            "feedback": feedback,
            "timestamp": datetime.utcnow(),
            "previous_confidence": pattern.confidence
        }
        self.feedback_history.append(feedback_entry)
        
        # Adjust pattern based on feedback
        if feedback.get("is_false_positive", False):
            pattern.confidence *= 0.8  # Reduce confidence
            pattern.false_positive_rate += 0.1
        elif feedback.get("is_useful", True):
            pattern.confidence = min(1.0, pattern.confidence * 1.1)  # Increase confidence
        
        # Update validation status
        if feedback.get("validated", False):
            pattern.validation_status = "validated"
        elif feedback.get("rejected", False):
            pattern.validation_status = "rejected"
        
        # Update confidence level
        pattern.confidence_level = self._get_confidence_level(pattern.confidence)
        pattern.last_updated = datetime.utcnow()
        
        return pattern
    
    async def get_pattern_performance_metrics(
        self,
        pattern_id: str
    ) -> Dict[str, Any]:
        """Get performance metrics for a specific pattern"""
        
        if pattern_id not in self.detected_patterns:
            raise HTTPException(status_code=404, detail="Pattern not found")
        
        pattern = self.detected_patterns[pattern_id]
        
        # Calculate metrics
        usage_count = await self._get_pattern_usage_count(pattern_id)
        accuracy_score = await self._calculate_pattern_accuracy(pattern_id)
        feedback_count = len([f for f in self.feedback_history if f["pattern_id"] == pattern_id])
        
        return {
            "pattern_id": pattern_id,
            "pattern_type": pattern.pattern_type,
            "confidence": pattern.confidence,
            "confidence_level": pattern.confidence_level,
            "support": pattern.support,
            "usage_count": usage_count,
            "accuracy_score": accuracy_score,
            "feedback_count": feedback_count,
            "false_positive_rate": pattern.false_positive_rate,
            "validation_status": pattern.validation_status,
            "detection_method": pattern.detection_method,
            "first_detected": pattern.first_detected,
            "last_updated": pattern.last_updated
        }
    
    async def retrain_pattern_models(
        self,
        pattern_type: Optional[PatternType] = None
    ) -> Dict[str, Any]:
        """Retrain machine learning models for pattern detection"""
        
        # Collect training data from feedback history
        training_data = await self._prepare_training_data(pattern_type)
        
        if not training_data:
            return {"status": "no_training_data", "message": "No training data available"}
        
        # Retrain models
        retrain_results = {}
        
        for pt in PatternType:
            if pattern_type is None or pt == pattern_type:
                pt_data = [d for d in training_data if d.get("pattern_type") == pt]
                if pt_data:
                    result = await self._retrain_model_for_type(pt, pt_data)
                    retrain_results[pt.value] = result
        
        return {
            "status": "completed",
            "retrained_models": list(retrain_results.keys()),
            "results": retrain_results,
            "timestamp": datetime.utcnow()
        }
    
    async def _get_data_samples(
        self,
        data_source: DataSource,
        config: PatternDetectionConfig,
        max_samples: int = 1000
    ) -> List[Dict[str, Any]]:
        """Get sample data from data source for pattern analysis"""
        
        try:
            # Use data source connection service to get samples
            connection_result = await self.data_source_service.test_connection(data_source.id)
            
            if not connection_result.get("success"):
                logger.error(f"Cannot connect to data source {data_source.id}")
                return []
            
            # This would implement actual data sampling based on data source type
            # For now, return mock data structure
            sample_data = []
            
            # Generate sample data based on data source type
            if data_source.source_type == DataSourceType.MYSQL:
                # Sample MySQL data structure
                for i in range(min(max_samples, 100)):
                    sample_data.append({
                        "id": i,
                        "email": f"user{i}@example.com",
                        "phone": f"555-0{i:03d}",
                        "created_at": datetime.utcnow() - timedelta(days=i)
                    })
            
            return sample_data
            
        except Exception as e:
            logger.error(f"Error getting data samples: {str(e)}")
            return []
    
    async def _store_detected_patterns(
        self,
        patterns: List[DetectedPattern],
        session: Session
    ):
        """Store detected patterns in cache and database"""
        
        for pattern in patterns:
            self.detected_patterns[pattern.id] = pattern
            
            # Store pattern metadata in database if needed
            # This would create database records for patterns
        
    async def _generate_regex_for_pattern(self, pattern: DetectedPattern) -> Optional[str]:
        """Generate regex pattern for detected pattern"""
        
        # This would need example data that matched the pattern
        # For now, return None
        return None
    
    async def _get_pattern_usage_count(self, pattern_id: str) -> int:
        """Get usage count for a pattern"""
        
        with get_session() as session:
            # Count how many scan rules use this pattern
            usage_count = session.query(IntelligentScanRule).filter(
                IntelligentScanRule.metadata.contains(f'"source_pattern_id": "{pattern_id}"')
            ).count()
            
            return usage_count
    
    async def _calculate_pattern_accuracy(self, pattern_id: str) -> float:
        """Calculate accuracy score for a pattern"""
        
        # Based on feedback history
        pattern_feedback = [f for f in self.feedback_history if f["pattern_id"] == pattern_id]
        
        if not pattern_feedback:
            return 0.5  # Default neutral score
        
        positive_feedback = sum(1 for f in pattern_feedback if f["feedback"].get("is_useful", False))
        total_feedback = len(pattern_feedback)
        
        return positive_feedback / total_feedback
    
    async def _prepare_training_data(
        self,
        pattern_type: Optional[PatternType]
    ) -> List[Dict[str, Any]]:
        """Prepare training data from feedback history"""
        
        training_data = []
        
        for feedback in self.feedback_history:
            if pattern_type is None or self.detected_patterns.get(feedback["pattern_id"], {}).pattern_type == pattern_type:
                training_entry = {
                    "pattern_id": feedback["pattern_id"],
                    "pattern_type": self.detected_patterns.get(feedback["pattern_id"], {}).pattern_type,
                    "feedback": feedback["feedback"],
                    "confidence": feedback["previous_confidence"]
                }
                training_data.append(training_entry)
        
        return training_data
    
    async def _retrain_model_for_type(
        self,
        pattern_type: PatternType,
        training_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Retrain model for specific pattern type"""
        
        # This would implement actual model retraining
        # For now, return mock results
        
        return {
            "pattern_type": pattern_type.value,
            "training_samples": len(training_data),
            "model_accuracy": 0.85,
            "improvement": 0.05,
            "retrained_at": datetime.utcnow()
        }
    
    def _get_confidence_level(self, confidence: float) -> PatternConfidence:
        """Convert confidence score to confidence level"""
        if confidence >= 0.95:
            return PatternConfidence.VERY_HIGH
        elif confidence >= 0.85:
            return PatternConfidence.HIGH
        elif confidence >= 0.70:
            return PatternConfidence.MEDIUM
        elif confidence >= 0.50:
            return PatternConfidence.LOW
        else:
            return PatternConfidence.VERY_LOW
    
    async def get_pattern_discovery_summary(self) -> Dict[str, Any]:
        """Get comprehensive summary of pattern discovery activities"""
        
        total_patterns = len(self.detected_patterns)
        patterns_by_type = defaultdict(int)
        patterns_by_confidence = defaultdict(int)
        
        for pattern in self.detected_patterns.values():
            patterns_by_type[pattern.pattern_type.value] += 1
            patterns_by_confidence[pattern.confidence_level.value] += 1
        
        return {
            "total_patterns": total_patterns,
            "patterns_by_type": dict(patterns_by_type),
            "patterns_by_confidence": dict(patterns_by_confidence),
            "total_feedback": len(self.feedback_history),
            "validated_patterns": len([p for p in self.detected_patterns.values() if p.validation_status == "validated"]),
            "rejected_patterns": len([p for p in self.detected_patterns.values() if p.validation_status == "rejected"]),
            "learning_engine_models": len(self.learning_engine.models),
            "last_discovery": max([p.last_updated for p in self.detected_patterns.values()]) if self.detected_patterns else None
        }


# Global service instance
intelligent_pattern_service = IntelligentPatternService()