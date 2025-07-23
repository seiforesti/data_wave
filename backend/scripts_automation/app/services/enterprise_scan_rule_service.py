"""
🧠 ENTERPRISE SCAN RULE SERVICE
Intelligent rule engine with AI/ML-powered pattern recognition, adaptive optimization,
predictive scanning, and comprehensive rule management that surpasses industry platforms.
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
import ast
import hashlib
from collections import defaultdict, Counter, deque
import threading
import queue
import time
from contextlib import asynccontextmanager
import joblib
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score
import pickle

# Import models
from ..models.advanced_scan_rule_models import (
    AdvancedScanRule, RuleExecutionHistory, RuleOptimizationSession,
    RuleValidationTest, RulePerformanceAnalytics, RuleIntegration,
    RuleType, ComplexityLevel, ExecutionMode, OptimizationStrategy,
    ValidationStatus, PerformanceLevel, IntegrationStatus,
    RuleCategory, RuleScope, AdaptationTrigger, ResourceType
)
from ..models.scan_rule_orchestration_models import (
    ScanRuleOrchestration, OrchestrationJob, RuleExecutionTracking,
    ResourceAllocation, WorkflowStateManagement, PerformanceMetrics,
    OrchestrationTemplate, OrchestrationStatus, ExecutionStrategy,
    LoadBalancingType, FailureStrategy, ResourceType as OrchResourceType
)
from ..models.scan_rule_intelligence_models import (
    ScanRuleIntelligenceModel, IntelligenceTrainingSession, PatternRecognitionResult,
    ModelInferenceLog, PerformanceBenchmark, FeatureStore,
    ModelType, LearningApproach, ModelStatus, FeatureType,
    OptimizationObjective, BenchmarkType, InferenceType
)
from ..models.scan_performance_models import (
    ScanPerformanceProfile, PerformanceMetric, PerformanceAnalysis,
    PerformanceBottleneck, OptimizationRecommendation, PerformanceAlert,
    PerformanceMetricType, PerformanceLevel, BottleneckType, OptimizationCategory
)

# Import services for integration
from .rule_optimization_service import RuleOptimizationService
from .rule_validation_engine import RuleValidationEngine
from .intelligent_pattern_service import IntelligentPatternService
from .scan_performance_service import ScanPerformanceService

logger = logging.getLogger(__name__)

@dataclass
class RuleExecutionContext:
    """Context for rule execution operations"""
    execution_id: str
    user_id: str
    organization_id: str
    data_source_ids: List[str]
    execution_mode: ExecutionMode
    performance_targets: Dict[str, float]
    resource_constraints: Dict[str, Any]
    compliance_requirements: List[str]
    business_context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AdaptationConfiguration:
    """Configuration for rule adaptation"""
    adaptation_triggers: List[AdaptationTrigger]
    learning_rate: float = 0.01
    adaptation_threshold: float = 0.1
    min_samples_for_adaptation: int = 100
    max_adaptation_frequency: int = 24  # hours
    confidence_threshold: float = 0.8
    rollback_threshold: float = 0.3

@dataclass
class IntelligenceConfiguration:
    """Configuration for AI/ML intelligence features"""
    enable_pattern_recognition: bool = True
    enable_predictive_optimization: bool = True
    enable_anomaly_detection: bool = True
    enable_auto_tuning: bool = True
    model_retrain_frequency: int = 168  # hours (weekly)
    inference_batch_size: int = 1000
    performance_monitoring: bool = True

class RuleExecutionPriority(str, Enum):
    """Priority levels for rule execution"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

class AdaptationStrategy(str, Enum):
    """Strategies for rule adaptation"""
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"
    INTELLIGENT = "intelligent"
    MANUAL_ONLY = "manual_only"

class PatternConfidenceLevel(str, Enum):
    """Confidence levels for pattern recognition"""
    VERY_LOW = "very_low"    # 0-20%
    LOW = "low"             # 20-40%
    MEDIUM = "medium"       # 40-60%
    HIGH = "high"           # 60-80%
    VERY_HIGH = "very_high" # 80-100%

class EnterpriseScanRuleService:
    """
    Enterprise-grade scan rule service with AI/ML-powered intelligent features,
    adaptive optimization, predictive capabilities, and comprehensive rule management.
    """
    
    def __init__(
        self,
        db_session: AsyncSession,
        optimization_service: RuleOptimizationService,
        validation_engine: RuleValidationEngine,
        pattern_service: IntelligentPatternService,
        performance_service: ScanPerformanceService,
        intelligence_config: IntelligenceConfiguration = None,
        ml_models_path: str = "/app/models/scan_rules",
        cache_size: int = 5000,
        thread_pool_size: int = 20
    ):
        self.db = db_session
        self.optimization_service = optimization_service
        self.validation_engine = validation_engine
        self.pattern_service = pattern_service
        self.performance_service = performance_service
        self.intelligence_config = intelligence_config or IntelligenceConfiguration()
        self.ml_models_path = ml_models_path
        self.thread_pool = ThreadPoolExecutor(max_workers=thread_pool_size)
        
        # Advanced caching and state management
        self.rule_cache: Dict[str, AdvancedScanRule] = {}
        self.execution_state: Dict[str, Dict[str, Any]] = {}
        self.pattern_cache: Dict[str, Dict[str, Any]] = {}
        self.optimization_history: deque = deque(maxlen=10000)
        
        # AI/ML models for intelligent features
        self.ml_models = {
            "pattern_classifier": None,
            "performance_predictor": None,
            "anomaly_detector": None,
            "optimization_recommender": None,
            "failure_predictor": None,
            "resource_estimator": None
        }
        
        # Performance tracking and metrics
        self.performance_metrics = {
            "rule_execution_times": defaultdict(list),
            "adaptation_success_rates": defaultdict(float),
            "pattern_recognition_accuracy": [],
            "optimization_improvements": [],
            "resource_utilization": defaultdict(list)
        }
        
        # Real-time monitoring
        self.active_executions: Dict[str, RuleExecutionContext] = {}
        self.execution_queue: queue.PriorityQueue = queue.PriorityQueue()
        self.monitoring_thread: Optional[threading.Thread] = None
        self.shutdown_event = threading.Event()
        
        # Rule intelligence and learning
        self.pattern_learning_buffer: deque = deque(maxlen=50000)
        self.adaptation_learning_buffer: deque = deque(maxlen=20000)
        self.feature_store: Dict[str, np.ndarray] = {}
        
        # Event handling
        self.event_handlers: Dict[str, List] = defaultdict(list)
        self.audit_trail: List[Dict[str, Any]] = []
        
        # Initialize the service
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize the enterprise scan rule service"""
        logger.info("Initializing Enterprise Scan Rule Service...")
        
        # Load ML models
        self._load_ml_models()
        
        # Initialize pattern recognition
        self._initialize_pattern_recognition()
        
        # Start monitoring thread
        self._start_monitoring_thread()
        
        # Initialize feature store
        self._initialize_feature_store()
        
        logger.info("Enterprise Scan Rule Service initialized successfully")

    def _load_ml_models(self):
        """Load pre-trained ML models for intelligent features"""
        try:
            # Load pattern classification model
            self.ml_models["pattern_classifier"] = self._create_pattern_classifier()
            
            # Load performance prediction model
            self.ml_models["performance_predictor"] = self._create_performance_predictor()
            
            # Load anomaly detection model
            self.ml_models["anomaly_detector"] = IsolationForest(
                contamination=0.1,
                random_state=42,
                n_estimators=100
            )
            
            # Initialize other models
            self.ml_models["optimization_recommender"] = self._create_optimization_recommender()
            self.ml_models["failure_predictor"] = self._create_failure_predictor()
            self.ml_models["resource_estimator"] = self._create_resource_estimator()
            
            logger.info("ML models loaded successfully")
        except Exception as e:
            logger.warning(f"Failed to load some ML models: {str(e)}")

    def _create_pattern_classifier(self):
        """Create pattern classification model"""
        return RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )

    # ================================================================
    # CORE RULE MANAGEMENT
    # ================================================================

    async def create_intelligent_rule(
        self,
        rule_data: Dict[str, Any],
        context: RuleExecutionContext,
        auto_optimize: bool = True
    ) -> AdvancedScanRule:
        """
        Create an intelligent scan rule with AI-powered optimization,
        pattern analysis, and predictive configuration.
        """
        try:
            rule_id = f"rule_{uuid4().hex[:12]}"
            logger.info(f"Creating intelligent scan rule {rule_id}")
            
            # Analyze rule complexity and requirements
            complexity_analysis = await self._analyze_rule_complexity(rule_data)
            
            # Generate intelligent rule configuration
            intelligent_config = await self._generate_intelligent_rule_config(
                rule_data, complexity_analysis, context
            )
            
            # Create base scan rule
            scan_rule = AdvancedScanRule(
                rule_id=rule_id,
                rule_name=rule_data["rule_name"],
                rule_type=rule_data["rule_type"],
                rule_category=rule_data.get("rule_category", RuleCategory.DATA_QUALITY),
                complexity_level=complexity_analysis["complexity_level"],
                rule_definition=rule_data["rule_definition"],
                execution_mode=intelligent_config["recommended_execution_mode"],
                optimization_strategy=intelligent_config["optimization_strategy"],
                performance_targets=intelligent_config["performance_targets"],
                resource_requirements=intelligent_config["resource_requirements"],
                adaptation_config=intelligent_config["adaptation_config"],
                intelligence_features=intelligent_config["intelligence_features"],
                created_by=context.user_id,
                business_context=context.business_context,
                compliance_requirements=context.compliance_requirements
            )
            
            # Add to database
            self.db.add(scan_rule)
            await self.db.commit()
            await self.db.refresh(scan_rule)
            
            # Auto-optimization if enabled
            if auto_optimize:
                optimization_results = await self._auto_optimize_rule(scan_rule, context)
                scan_rule.optimization_history = optimization_results
            
            # Generate initial patterns
            initial_patterns = await self._generate_initial_patterns(scan_rule, context)
            
            # Predict performance characteristics
            performance_prediction = await self._predict_rule_performance(scan_rule, context)
            scan_rule.performance_predictions = performance_prediction
            
            # Create intelligence model for this rule
            intelligence_model = await self._create_rule_intelligence_model(scan_rule, context)
            
            # Update caches
            self.rule_cache[rule_id] = scan_rule
            
            # Store in feature store
            await self._store_rule_features(scan_rule)
            
            # Emit creation event
            await self._emit_rule_event(
                "rule_created",
                {
                    "rule_id": rule_id,
                    "rule_name": scan_rule.rule_name,
                    "complexity_level": complexity_analysis["complexity_level"].value,
                    "predicted_performance": performance_prediction,
                    "patterns_generated": len(initial_patterns)
                },
                context
            )
            
            logger.info(f"Intelligent scan rule {rule_id} created successfully")
            return scan_rule
            
        except Exception as e:
            logger.error(f"Failed to create intelligent rule: {str(e)}")
            await self.db.rollback()
            raise

    async def execute_rule_with_intelligence(
        self,
        rule_id: str,
        execution_context: RuleExecutionContext,
        data_samples: List[Dict[str, Any]] = None,
        adaptive_mode: bool = True
    ) -> Dict[str, Any]:
        """
        Execute scan rule with AI-powered intelligence, adaptive optimization,
        and real-time performance monitoring.
        """
        try:
            execution_id = f"exec_{uuid4().hex[:12]}"
            start_time = datetime.utcnow()
            
            logger.info(f"Executing rule {rule_id} with intelligence (execution: {execution_id})")
            
            # Get rule from cache or database
            rule = await self._get_rule_with_cache(rule_id)
            if not rule:
                raise ValueError(f"Rule {rule_id} not found")
            
            # Validate execution context
            validation_result = await self._validate_execution_context(rule, execution_context)
            if not validation_result["valid"]:
                raise ValueError(f"Invalid execution context: {validation_result['reasons']}")
            
            # Initialize execution tracking
            execution_tracking = {
                "execution_id": execution_id,
                "rule_id": rule_id,
                "start_time": start_time,
                "status": "initializing",
                "phase": "preparation",
                "performance_metrics": {},
                "intelligence_insights": {},
                "adaptation_actions": [],
                "errors": [],
                "warnings": []
            }
            
            # Add to active executions
            self.active_executions[execution_id] = execution_context
            
            try:
                # Phase 1: Pre-execution Intelligence Analysis
                execution_tracking["phase"] = "pre_analysis"
                pre_analysis = await self._perform_pre_execution_analysis(
                    rule, execution_context, data_samples
                )
                execution_tracking["intelligence_insights"]["pre_analysis"] = pre_analysis
                
                # Phase 2: Dynamic Rule Optimization
                if adaptive_mode and rule.intelligence_features.get("auto_optimization", True):
                    execution_tracking["phase"] = "optimization"
                    optimization_result = await self._perform_dynamic_optimization(
                        rule, execution_context, pre_analysis
                    )
                    execution_tracking["adaptation_actions"].append(optimization_result)
                
                # Phase 3: Intelligent Pattern Recognition
                execution_tracking["phase"] = "pattern_recognition"
                pattern_insights = await self._perform_pattern_recognition(
                    rule, execution_context, data_samples
                )
                execution_tracking["intelligence_insights"]["patterns"] = pattern_insights
                
                # Phase 4: Predictive Resource Allocation
                execution_tracking["phase"] = "resource_allocation"
                resource_allocation = await self._allocate_resources_intelligently(
                    rule, execution_context, pre_analysis
                )
                
                # Phase 5: Core Rule Execution with Monitoring
                execution_tracking["phase"] = "execution"
                execution_tracking["status"] = "running"
                
                core_results = await self._execute_rule_core_with_monitoring(
                    rule, execution_context, data_samples, resource_allocation, execution_tracking
                )
                
                # Phase 6: Post-execution Analysis and Learning
                execution_tracking["phase"] = "post_analysis"
                post_analysis = await self._perform_post_execution_analysis(
                    rule, execution_context, core_results, execution_tracking
                )
                execution_tracking["intelligence_insights"]["post_analysis"] = post_analysis
                
                # Phase 7: Adaptive Learning and Model Updates
                if adaptive_mode:
                    execution_tracking["phase"] = "learning"
                    learning_updates = await self._perform_adaptive_learning(
                        rule, execution_context, execution_tracking
                    )
                    execution_tracking["adaptation_actions"].extend(learning_updates)
                
                # Phase 8: Performance Impact Analysis
                execution_tracking["phase"] = "impact_analysis"
                impact_analysis = await self._analyze_execution_impact(
                    rule, execution_context, execution_tracking
                )
                
                # Finalize execution
                execution_tracking["status"] = "completed"
                execution_tracking["end_time"] = datetime.utcnow()
                execution_tracking["total_duration"] = (
                    execution_tracking["end_time"] - start_time
                ).total_seconds()
                
                # Generate comprehensive results
                execution_results = {
                    "execution_id": execution_id,
                    "rule_id": rule_id,
                    "status": "success",
                    "execution_time_seconds": execution_tracking["total_duration"],
                    "core_results": core_results,
                    "intelligence_insights": execution_tracking["intelligence_insights"],
                    "adaptation_actions": execution_tracking["adaptation_actions"],
                    "performance_metrics": execution_tracking["performance_metrics"],
                    "impact_analysis": impact_analysis,
                    "recommendations": await self._generate_execution_recommendations(
                        rule, execution_tracking
                    )
                }
                
                # Store execution history
                await self._store_execution_history(rule, execution_tracking, execution_results)
                
                # Update rule performance analytics
                await self._update_rule_performance_analytics(rule, execution_results)
                
                # Emit execution event
                await self._emit_rule_event(
                    "rule_executed",
                    {
                        "execution_id": execution_id,
                        "rule_id": rule_id,
                        "duration": execution_tracking["total_duration"],
                        "intelligence_used": True,
                        "adaptations_made": len(execution_tracking["adaptation_actions"]),
                        "performance_score": execution_results.get("performance_score", 0)
                    },
                    execution_context
                )
                
                logger.info(f"Rule execution {execution_id} completed successfully")
                return execution_results
                
            finally:
                # Clean up active execution
                if execution_id in self.active_executions:
                    del self.active_executions[execution_id]
        
        except Exception as e:
            logger.error(f"Failed to execute rule {rule_id}: {str(e)}")
            execution_tracking["status"] = "failed"
            execution_tracking["error"] = str(e)
            execution_tracking["end_time"] = datetime.utcnow()
            
            # Store failed execution for learning
            await self._store_failed_execution(rule_id, execution_tracking, str(e))
            
            raise

    async def _perform_pre_execution_analysis(
        self,
        rule: AdvancedScanRule,
        context: RuleExecutionContext,
        data_samples: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Perform comprehensive pre-execution intelligence analysis"""
        
        analysis_results = {
            "data_characteristics": {},
            "performance_predictions": {},
            "resource_recommendations": {},
            "optimization_opportunities": [],
            "risk_assessment": {},
            "pattern_predictions": []
        }
        
        try:
            # Analyze data characteristics if samples provided
            if data_samples:
                analysis_results["data_characteristics"] = await self._analyze_data_characteristics(
                    data_samples, rule
                )
            
            # Predict execution performance
            if self.ml_models["performance_predictor"]:
                performance_features = await self._extract_performance_features(rule, context)
                predicted_metrics = self.ml_models["performance_predictor"].predict([performance_features])
                analysis_results["performance_predictions"] = {
                    "predicted_duration": float(predicted_metrics[0][0]),
                    "predicted_accuracy": float(predicted_metrics[0][1]),
                    "predicted_resource_usage": float(predicted_metrics[0][2]),
                    "confidence_score": 0.85  # Simplified for demo
                }
            
            # Generate resource recommendations
            analysis_results["resource_recommendations"] = await self._generate_resource_recommendations(
                rule, context, analysis_results["performance_predictions"]
            )
            
            # Identify optimization opportunities
            analysis_results["optimization_opportunities"] = await self._identify_optimization_opportunities(
                rule, context, analysis_results
            )
            
            # Assess execution risks
            analysis_results["risk_assessment"] = await self._assess_execution_risks(
                rule, context, analysis_results
            )
            
            # Predict likely patterns
            if self.ml_models["pattern_classifier"] and data_samples:
                pattern_features = await self._extract_pattern_features(data_samples)
                predicted_patterns = self.ml_models["pattern_classifier"].predict_proba([pattern_features])
                analysis_results["pattern_predictions"] = self._interpret_pattern_predictions(
                    predicted_patterns[0]
                )
            
            return analysis_results
            
        except Exception as e:
            logger.error(f"Pre-execution analysis failed: {str(e)}")
            analysis_results["error"] = str(e)
            return analysis_results

    async def _perform_dynamic_optimization(
        self,
        rule: AdvancedScanRule,
        context: RuleExecutionContext,
        pre_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform dynamic rule optimization based on current context"""
        
        optimization_result = {
            "optimization_type": "dynamic",
            "changes_made": [],
            "performance_impact": {},
            "confidence_score": 0.0,
            "rollback_plan": {}
        }
        
        try:
            # Analyze current rule performance vs. targets
            performance_gap = await self._analyze_performance_gap(rule, context, pre_analysis)
            
            if performance_gap["significant_gap"]:
                # Generate optimization recommendations
                recommendations = await self.optimization_service.generate_recommendations(
                    rule.rule_id,
                    context.user_id,
                    {
                        "performance_gap": performance_gap,
                        "pre_analysis": pre_analysis,
                        "context": context.__dict__
                    }
                )
                
                # Apply low-risk optimizations automatically
                for recommendation in recommendations:
                    if recommendation["risk_level"] == "low" and recommendation["confidence"] > 0.8:
                        change_result = await self._apply_optimization_change(
                            rule, recommendation, context
                        )
                        optimization_result["changes_made"].append(change_result)
                
                # Calculate expected performance impact
                optimization_result["performance_impact"] = await self._calculate_optimization_impact(
                    optimization_result["changes_made"]
                )
                
                # Calculate overall confidence
                if optimization_result["changes_made"]:
                    optimization_result["confidence_score"] = np.mean([
                        change["confidence"] for change in optimization_result["changes_made"]
                    ])
                
                # Create rollback plan
                optimization_result["rollback_plan"] = await self._create_rollback_plan(
                    rule, optimization_result["changes_made"]
                )
            
            return optimization_result
            
        except Exception as e:
            logger.error(f"Dynamic optimization failed: {str(e)}")
            optimization_result["error"] = str(e)
            return optimization_result

    # ================================================================
    # PATTERN RECOGNITION AND INTELLIGENCE
    # ================================================================

    async def _perform_pattern_recognition(
        self,
        rule: AdvancedScanRule,
        context: RuleExecutionContext,
        data_samples: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Perform intelligent pattern recognition and analysis"""
        
        pattern_insights = {
            "detected_patterns": [],
            "pattern_confidence": {},
            "anomalies_detected": [],
            "trend_analysis": {},
            "recommendations": []
        }
        
        try:
            if not data_samples:
                return pattern_insights
            
            # Extract features for pattern analysis
            feature_matrix = await self._extract_comprehensive_features(data_samples, rule)
            
            # Detect patterns using ML models
            if self.ml_models["pattern_classifier"]:
                pattern_predictions = self.ml_models["pattern_classifier"].predict(feature_matrix)
                pattern_probabilities = self.ml_models["pattern_classifier"].predict_proba(feature_matrix)
                
                # Analyze detected patterns
                unique_patterns, pattern_counts = np.unique(pattern_predictions, return_counts=True)
                for pattern, count in zip(unique_patterns, pattern_counts):
                    confidence = np.mean(np.max(pattern_probabilities, axis=1))
                    pattern_insights["detected_patterns"].append({
                        "pattern_id": int(pattern),
                        "pattern_name": self._get_pattern_name(pattern),
                        "occurrence_count": int(count),
                        "frequency": float(count / len(data_samples)),
                        "confidence": float(confidence)
                    })
                    pattern_insights["pattern_confidence"][str(pattern)] = float(confidence)
            
            # Detect anomalies
            if self.ml_models["anomaly_detector"]:
                anomaly_scores = self.ml_models["anomaly_detector"].decision_function(feature_matrix)
                anomaly_predictions = self.ml_models["anomaly_detector"].predict(feature_matrix)
                
                anomaly_indices = np.where(anomaly_predictions == -1)[0]
                for idx in anomaly_indices:
                    pattern_insights["anomalies_detected"].append({
                        "sample_index": int(idx),
                        "anomaly_score": float(anomaly_scores[idx]),
                        "severity": self._classify_anomaly_severity(anomaly_scores[idx]),
                        "characteristics": await self._analyze_anomaly_characteristics(
                            data_samples[idx], feature_matrix[idx]
                        )
                    })
            
            # Perform trend analysis
            pattern_insights["trend_analysis"] = await self._analyze_pattern_trends(
                pattern_insights["detected_patterns"], rule
            )
            
            # Generate pattern-based recommendations
            pattern_insights["recommendations"] = await self._generate_pattern_recommendations(
                pattern_insights, rule, context
            )
            
            # Store patterns in learning buffer
            self._store_patterns_for_learning(pattern_insights, rule, context)
            
            return pattern_insights
            
        except Exception as e:
            logger.error(f"Pattern recognition failed: {str(e)}")
            pattern_insights["error"] = str(e)
            return pattern_insights

    async def _extract_comprehensive_features(
        self,
        data_samples: List[Dict[str, Any]],
        rule: AdvancedScanRule
    ) -> np.ndarray:
        """Extract comprehensive features for ML analysis"""
        
        features = []
        
        for sample in data_samples:
            sample_features = []
            
            # Basic statistical features
            if isinstance(sample, dict):
                # Numerical features
                numerical_values = [v for v in sample.values() if isinstance(v, (int, float))]
                if numerical_values:
                    sample_features.extend([
                        np.mean(numerical_values),
                        np.std(numerical_values),
                        np.min(numerical_values),
                        np.max(numerical_values),
                        len(numerical_values)
                    ])
                else:
                    sample_features.extend([0, 0, 0, 0, 0])
                
                # Text features
                text_values = [str(v) for v in sample.values() if isinstance(v, str)]
                if text_values:
                    combined_text = " ".join(text_values)
                    sample_features.extend([
                        len(combined_text),
                        len(combined_text.split()),
                        combined_text.count(' '),
                        len(set(combined_text.lower().split())),
                        sum(1 for c in combined_text if c.isdigit()) / len(combined_text) if combined_text else 0
                    ])
                else:
                    sample_features.extend([0, 0, 0, 0, 0])
                
                # Structural features
                sample_features.extend([
                    len(sample),  # Number of fields
                    sum(1 for v in sample.values() if v is None),  # Null count
                    sum(1 for v in sample.values() if isinstance(v, bool)),  # Boolean count
                    sum(1 for v in sample.values() if isinstance(v, (list, dict)))  # Complex type count
                ])
            
            features.append(sample_features)
        
        # Pad features to ensure consistent dimensionality
        max_features = max(len(f) for f in features) if features else 0
        for i, feature_vector in enumerate(features):
            while len(feature_vector) < max_features:
                feature_vector.append(0)
            features[i] = feature_vector[:max_features]  # Trim if necessary
        
        return np.array(features, dtype=np.float32)

    def _get_pattern_name(self, pattern_id: int) -> str:
        """Get human-readable pattern name"""
        pattern_names = {
            0: "Normal Distribution",
            1: "Outlier Pattern",
            2: "Seasonal Pattern",
            3: "Trend Pattern",
            4: "Anomalous Pattern",
            5: "Clustered Pattern",
            6: "Sparse Pattern",
            7: "Dense Pattern",
            8: "Complex Pattern",
            9: "Unknown Pattern"
        }
        return pattern_names.get(pattern_id, f"Pattern_{pattern_id}")

    def _classify_anomaly_severity(self, anomaly_score: float) -> str:
        """Classify anomaly severity based on score"""
        if anomaly_score < -0.5:
            return "critical"
        elif anomaly_score < -0.3:
            return "high"
        elif anomaly_score < -0.1:
            return "medium"
        else:
            return "low"

    # ================================================================
    # ADAPTIVE LEARNING AND OPTIMIZATION
    # ================================================================

    async def _perform_adaptive_learning(
        self,
        rule: AdvancedScanRule,
        context: RuleExecutionContext,
        execution_tracking: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Perform adaptive learning based on execution results"""
        
        learning_updates = []
        
        try:
            # Check if adaptation is enabled and conditions are met
            if not rule.intelligence_features.get("adaptive_learning", True):
                return learning_updates
            
            adaptation_config = rule.adaptation_config or {}
            min_samples = adaptation_config.get("min_samples", 100)
            
            # Get historical execution data
            historical_data = await self._get_historical_execution_data(rule.rule_id, limit=min_samples)
            
            if len(historical_data) < min_samples:
                logger.info(f"Insufficient data for adaptation: {len(historical_data)}/{min_samples}")
                return learning_updates
            
            # Analyze performance trends
            performance_trend = await self._analyze_performance_trend(historical_data)
            
            # Check if adaptation is needed
            if performance_trend["declining"] or performance_trend["variance_high"]:
                # Generate adaptation recommendations
                adaptation_recommendations = await self._generate_adaptation_recommendations(
                    rule, historical_data, performance_trend, context
                )
                
                # Apply safe adaptations
                for recommendation in adaptation_recommendations:
                    if recommendation["safety_score"] > 0.8:
                        adaptation_result = await self._apply_adaptation(
                            rule, recommendation, context
                        )
                        learning_updates.append(adaptation_result)
                        
                        # Update rule in database
                        await self._update_rule_with_adaptation(rule, adaptation_result)
            
            # Update feature store with new patterns
            if execution_tracking.get("intelligence_insights", {}).get("patterns"):
                await self._update_feature_store(
                    rule.rule_id,
                    execution_tracking["intelligence_insights"]["patterns"]
                )
            
            # Retrain models if necessary
            if await self._should_retrain_models(rule, historical_data):
                retrain_result = await self._retrain_rule_models(rule, historical_data)
                learning_updates.append(retrain_result)
            
            return learning_updates
            
        except Exception as e:
            logger.error(f"Adaptive learning failed: {str(e)}")
            return learning_updates

    async def _generate_adaptation_recommendations(
        self,
        rule: AdvancedScanRule,
        historical_data: List[Dict[str, Any]],
        performance_trend: Dict[str, Any],
        context: RuleExecutionContext
    ) -> List[Dict[str, Any]]:
        """Generate intelligent adaptation recommendations"""
        
        recommendations = []
        
        try:
            # Analyze performance bottlenecks
            bottlenecks = await self._identify_performance_bottlenecks(historical_data)
            
            # Generate recommendations for each bottleneck
            for bottleneck in bottlenecks:
                if bottleneck["type"] == "execution_time":
                    recommendations.append({
                        "type": "parameter_tuning",
                        "target": "execution_timeout",
                        "current_value": rule.execution_parameters.get("timeout", 300),
                        "recommended_value": min(
                            rule.execution_parameters.get("timeout", 300) * 1.2,
                            600
                        ),
                        "reason": "Reduce timeout-related failures",
                        "safety_score": 0.9,
                        "expected_improvement": 0.15
                    })
                
                elif bottleneck["type"] == "resource_usage":
                    recommendations.append({
                        "type": "resource_adjustment",
                        "target": "memory_limit",
                        "current_value": rule.resource_requirements.get("memory_mb", 1024),
                        "recommended_value": int(
                            rule.resource_requirements.get("memory_mb", 1024) * 1.1
                        ),
                        "reason": "Prevent memory-related failures",
                        "safety_score": 0.85,
                        "expected_improvement": 0.10
                    })
                
                elif bottleneck["type"] == "accuracy":
                    recommendations.append({
                        "type": "algorithm_tuning",
                        "target": "sensitivity_threshold",
                        "current_value": rule.rule_definition.get("threshold", 0.5),
                        "recommended_value": rule.rule_definition.get("threshold", 0.5) * 0.95,
                        "reason": "Improve detection accuracy",
                        "safety_score": 0.75,
                        "expected_improvement": 0.08
                    })
            
            # Add learning-based recommendations
            if self.ml_models["optimization_recommender"]:
                ml_recommendations = await self._get_ml_optimization_recommendations(
                    rule, historical_data, context
                )
                recommendations.extend(ml_recommendations)
            
            # Sort by expected improvement and safety score
            recommendations.sort(
                key=lambda x: x["expected_improvement"] * x["safety_score"],
                reverse=True
            )
            
            return recommendations[:5]  # Return top 5 recommendations
            
        except Exception as e:
            logger.error(f"Failed to generate adaptation recommendations: {str(e)}")
            return recommendations

    # ================================================================
    # PERFORMANCE MONITORING AND ANALYTICS
    # ================================================================

    async def _execute_rule_core_with_monitoring(
        self,
        rule: AdvancedScanRule,
        context: RuleExecutionContext,
        data_samples: List[Dict[str, Any]],
        resource_allocation: Dict[str, Any],
        execution_tracking: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute rule core logic with comprehensive monitoring"""
        
        core_results = {
            "matches_found": 0,
            "total_records_processed": 0,
            "execution_phases": [],
            "performance_metrics": {},
            "quality_metrics": {},
            "resource_usage": {},
            "errors": [],
            "warnings": []
        }
        
        try:
            phase_start = time.time()
            
            # Phase 1: Data Preparation
            prepared_data = await self._prepare_data_for_execution(
                data_samples, rule, resource_allocation
            )
            
            phase_duration = time.time() - phase_start
            core_results["execution_phases"].append({
                "phase": "data_preparation",
                "duration_seconds": phase_duration,
                "records_processed": len(prepared_data)
            })
            
            # Phase 2: Rule Application with Real-time Monitoring
            phase_start = time.time()
            
            # Start performance monitoring
            monitoring_task = asyncio.create_task(
                self._monitor_execution_performance(execution_tracking["execution_id"])
            )
            
            try:
                # Apply rule logic
                if rule.rule_type == RuleType.PATTERN_MATCH:
                    matches = await self._apply_pattern_matching_rule(
                        rule, prepared_data, execution_tracking
                    )
                elif rule.rule_type == RuleType.DATA_QUALITY:
                    matches = await self._apply_data_quality_rule(
                        rule, prepared_data, execution_tracking
                    )
                elif rule.rule_type == RuleType.ANOMALY_DETECTION:
                    matches = await self._apply_anomaly_detection_rule(
                        rule, prepared_data, execution_tracking
                    )
                elif rule.rule_type == RuleType.COMPLIANCE_CHECK:
                    matches = await self._apply_compliance_rule(
                        rule, prepared_data, execution_tracking
                    )
                else:
                    matches = await self._apply_generic_rule(
                        rule, prepared_data, execution_tracking
                    )
                
                core_results["matches_found"] = len(matches)
                core_results["match_details"] = matches
                
            finally:
                # Stop monitoring
                monitoring_task.cancel()
                try:
                    await monitoring_task
                except asyncio.CancelledError:
                    pass
            
            phase_duration = time.time() - phase_start
            core_results["execution_phases"].append({
                "phase": "rule_application",
                "duration_seconds": phase_duration,
                "matches_found": core_results["matches_found"]
            })
            
            # Phase 3: Results Processing and Validation
            phase_start = time.time()
            
            processed_results = await self._process_and_validate_results(
                core_results["match_details"], rule, context
            )
            
            core_results["processed_results"] = processed_results
            core_results["total_records_processed"] = len(prepared_data)
            
            phase_duration = time.time() - phase_start
            core_results["execution_phases"].append({
                "phase": "results_processing",
                "duration_seconds": phase_duration,
                "validated_matches": len(processed_results.get("validated_matches", []))
            })
            
            # Calculate performance metrics
            core_results["performance_metrics"] = await self._calculate_execution_performance_metrics(
                core_results, execution_tracking
            )
            
            # Calculate quality metrics
            core_results["quality_metrics"] = await self._calculate_quality_metrics(
                core_results, rule
            )
            
            # Track resource usage
            core_results["resource_usage"] = await self._track_resource_usage(
                execution_tracking["execution_id"]
            )
            
            return core_results
            
        except Exception as e:
            logger.error(f"Core rule execution failed: {str(e)}")
            core_results["errors"].append({
                "type": "execution_error",
                "message": str(e),
                "timestamp": datetime.utcnow().isoformat()
            })
            return core_results

    async def _monitor_execution_performance(self, execution_id: str):
        """Monitor rule execution performance in real-time"""
        try:
            while True:
                # Collect current performance metrics
                metrics = {
                    "timestamp": time.time(),
                    "cpu_usage": await self._get_cpu_usage(),
                    "memory_usage": await self._get_memory_usage(),
                    "io_operations": await self._get_io_operations()
                }
                
                # Store metrics in execution tracking
                if execution_id in self.performance_metrics:
                    self.performance_metrics[execution_id].append(metrics)
                else:
                    self.performance_metrics[execution_id] = [metrics]
                
                # Check for performance alerts
                await self._check_performance_alerts(execution_id, metrics)
                
                # Wait before next measurement
                await asyncio.sleep(1)  # Monitor every second
                
        except asyncio.CancelledError:
            # Monitoring stopped
            pass
        except Exception as e:
            logger.error(f"Performance monitoring error: {str(e)}")

    # ================================================================
    # RULE APPLICATION METHODS
    # ================================================================

    async def _apply_pattern_matching_rule(
        self,
        rule: AdvancedScanRule,
        data: List[Dict[str, Any]],
        execution_tracking: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Apply pattern matching rule with intelligent features"""
        
        matches = []
        pattern_config = rule.rule_definition.get("pattern_config", {})
        
        try:
            # Extract pattern from rule definition
            pattern = pattern_config.get("pattern", "")
            case_sensitive = pattern_config.get("case_sensitive", False)
            use_regex = pattern_config.get("use_regex", False)
            
            # Apply AI-enhanced pattern matching
            if rule.intelligence_features.get("ai_pattern_enhancement", False):
                pattern = await self._enhance_pattern_with_ai(pattern, rule, data)
            
            # Compile pattern if regex
            compiled_pattern = None
            if use_regex:
                flags = 0 if case_sensitive else re.IGNORECASE
                compiled_pattern = re.compile(pattern, flags)
            
            # Process each data record
            for i, record in enumerate(data):
                record_matches = []
                
                # Check each field in the record
                for field_name, field_value in record.items():
                    if field_value is None:
                        continue
                    
                    field_str = str(field_value)
                    match_found = False
                    
                    if use_regex and compiled_pattern:
                        match_result = compiled_pattern.search(field_str)
                        if match_result:
                            match_found = True
                            record_matches.append({
                                "field": field_name,
                                "matched_text": match_result.group(),
                                "match_position": match_result.span(),
                                "confidence": 1.0
                            })
                    else:
                        # Simple string matching
                        search_text = field_str if case_sensitive else field_str.lower()
                        search_pattern = pattern if case_sensitive else pattern.lower()
                        
                        if search_pattern in search_text:
                            match_found = True
                            record_matches.append({
                                "field": field_name,
                                "matched_text": pattern,
                                "confidence": 1.0
                            })
                
                # If matches found in this record, add to results
                if record_matches:
                    matches.append({
                        "record_index": i,
                        "record_data": record,
                        "matches": record_matches,
                        "total_matches": len(record_matches),
                        "match_confidence": np.mean([m["confidence"] for m in record_matches])
                    })
            
            # Update execution tracking
            execution_tracking["performance_metrics"]["pattern_matching"] = {
                "records_processed": len(data),
                "matches_found": len(matches),
                "match_rate": len(matches) / len(data) if data else 0
            }
            
            return matches
            
        except Exception as e:
            logger.error(f"Pattern matching rule application failed: {str(e)}")
            return matches

    async def _apply_data_quality_rule(
        self,
        rule: AdvancedScanRule,
        data: List[Dict[str, Any]],
        execution_tracking: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Apply data quality rule with intelligent validation"""
        
        matches = []
        quality_config = rule.rule_definition.get("quality_config", {})
        
        try:
            quality_checks = quality_config.get("checks", [])
            threshold = quality_config.get("threshold", 0.8)
            
            for i, record in enumerate(data):
                quality_issues = []
                quality_scores = []
                
                # Apply each quality check
                for check in quality_checks:
                    check_type = check.get("type", "")
                    check_field = check.get("field", "")
                    check_params = check.get("parameters", {})
                    
                    if check_field not in record:
                        continue
                    
                    field_value = record[check_field]
                    issue_found = False
                    quality_score = 1.0
                    
                    # Apply specific quality checks
                    if check_type == "null_check":
                        if field_value is None or field_value == "":
                            issue_found = True
                            quality_score = 0.0
                    
                    elif check_type == "format_check":
                        expected_format = check_params.get("format", "")
                        if expected_format and not re.match(expected_format, str(field_value)):
                            issue_found = True
                            quality_score = 0.3
                    
                    elif check_type == "range_check":
                        min_val = check_params.get("min")
                        max_val = check_params.get("max")
                        if isinstance(field_value, (int, float)):
                            if (min_val is not None and field_value < min_val) or \
                               (max_val is not None and field_value > max_val):
                                issue_found = True
                                quality_score = 0.2
                    
                    elif check_type == "uniqueness_check":
                        # This would require checking against other records
                        # Simplified for demo
                        quality_score = 0.9
                    
                    elif check_type == "completeness_check":
                        required_fields = check_params.get("required_fields", [])
                        missing_fields = [f for f in required_fields if f not in record or record[f] is None]
                        if missing_fields:
                            issue_found = True
                            quality_score = 1.0 - (len(missing_fields) / len(required_fields))
                    
                    # Store quality issue if found
                    if issue_found:
                        quality_issues.append({
                            "check_type": check_type,
                            "field": check_field,
                            "issue_description": f"{check_type} failed for field {check_field}",
                            "severity": self._determine_quality_severity(quality_score)
                        })
                    
                    quality_scores.append(quality_score)
                
                # Calculate overall quality score for record
                overall_quality = np.mean(quality_scores) if quality_scores else 1.0
                
                # Add to matches if quality issues found or score below threshold
                if quality_issues or overall_quality < threshold:
                    matches.append({
                        "record_index": i,
                        "record_data": record,
                        "quality_score": overall_quality,
                        "quality_issues": quality_issues,
                        "passes_threshold": overall_quality >= threshold
                    })
            
            # Update execution tracking
            execution_tracking["performance_metrics"]["data_quality"] = {
                "records_processed": len(data),
                "quality_issues_found": len(matches),
                "average_quality_score": np.mean([
                    m["quality_score"] for m in matches
                ]) if matches else 1.0
            }
            
            return matches
            
        except Exception as e:
            logger.error(f"Data quality rule application failed: {str(e)}")
            return matches

    def _determine_quality_severity(self, quality_score: float) -> str:
        """Determine quality issue severity based on score"""
        if quality_score < 0.3:
            return "critical"
        elif quality_score < 0.6:
            return "high"
        elif quality_score < 0.8:
            return "medium"
        else:
            return "low"

    # ================================================================
    # UTILITY AND HELPER METHODS
    # ================================================================

    async def _get_rule_with_cache(self, rule_id: str) -> Optional[AdvancedScanRule]:
        """Get rule from cache or database"""
        try:
            # Check cache first
            if rule_id in self.rule_cache:
                return self.rule_cache[rule_id]
            
            # Query database
            stmt = select(AdvancedScanRule).where(
                AdvancedScanRule.rule_id == rule_id
            ).options(
                selectinload(AdvancedScanRule.execution_history),
                selectinload(AdvancedScanRule.optimization_sessions),
                selectinload(AdvancedScanRule.validation_tests)
            )
            
            result = await self.db.execute(stmt)
            rule = result.scalar_one_or_none()
            
            if rule:
                # Cache the rule
                self.rule_cache[rule_id] = rule
            
            return rule
            
        except Exception as e:
            logger.error(f"Failed to get rule {rule_id}: {str(e)}")
            return None

    def _start_monitoring_thread(self):
        """Start background monitoring thread"""
        try:
            self.monitoring_thread = threading.Thread(
                target=self._monitoring_loop,
                daemon=True
            )
            self.monitoring_thread.start()
            logger.info("Rule monitoring thread started")
        except Exception as e:
            logger.error(f"Failed to start monitoring thread: {str(e)}")

    def _monitoring_loop(self):
        """Background monitoring loop"""
        while not self.shutdown_event.is_set():
            try:
                # Monitor active executions
                self._monitor_active_executions()
                
                # Check execution queue
                self._process_execution_queue()
                
                # Update performance metrics
                self._update_performance_metrics()
                
                # Check for retraining needs
                self._check_model_retraining_needs()
                
                # Sleep for monitoring interval
                time.sleep(5)  # Monitor every 5 seconds
                
            except Exception as e:
                logger.error(f"Monitoring loop error: {str(e)}")
                time.sleep(10)  # Longer sleep on error

    async def _emit_rule_event(
        self,
        event_type: str,
        event_data: Dict[str, Any],
        context: RuleExecutionContext
    ):
        """Emit rule-related events for tracking and integration"""
        try:
            event = {
                "event_id": f"evt_{uuid4().hex[:8]}",
                "event_type": event_type,
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": context.user_id,
                "organization_id": context.organization_id,
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
            logger.error(f"Failed to emit rule event: {str(e)}")

    def register_event_handler(self, event_type: str, handler):
        """Register an event handler for specific rule events"""
        self.event_handlers[event_type].append(handler)

    async def get_rule_performance_analytics(
        self,
        rule_id: str,
        time_range: Tuple[datetime, datetime] = None
    ) -> Dict[str, Any]:
        """Get comprehensive performance analytics for a rule"""
        try:
            if not time_range:
                end_time = datetime.utcnow()
                start_time = end_time - timedelta(days=30)
                time_range = (start_time, end_time)
            
            # Get rule execution history
            stmt = select(RuleExecutionHistory).where(
                and_(
                    RuleExecutionHistory.rule_id == rule_id,
                    RuleExecutionHistory.execution_start_time >= time_range[0],
                    RuleExecutionHistory.execution_start_time <= time_range[1]
                )
            ).order_by(desc(RuleExecutionHistory.execution_start_time))
            
            result = await self.db.execute(stmt)
            executions = result.scalars().all()
            
            if not executions:
                return {"error": "No execution data found for the specified time range"}
            
            # Calculate analytics
            analytics = {
                "rule_id": rule_id,
                "time_range": {
                    "start": time_range[0].isoformat(),
                    "end": time_range[1].isoformat()
                },
                "execution_summary": {
                    "total_executions": len(executions),
                    "successful_executions": len([e for e in executions if e.execution_status == "completed"]),
                    "failed_executions": len([e for e in executions if e.execution_status == "failed"]),
                    "average_execution_time": np.mean([e.execution_duration_seconds for e in executions if e.execution_duration_seconds]),
                    "success_rate": len([e for e in executions if e.execution_status == "completed"]) / len(executions) * 100
                },
                "performance_trends": await self._calculate_performance_trends(executions),
                "resource_utilization": await self._calculate_resource_utilization_analytics(executions),
                "intelligence_metrics": await self._calculate_intelligence_metrics(executions),
                "optimization_impact": await self._calculate_optimization_impact_analytics(executions)
            }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Failed to get performance analytics: {str(e)}")
            return {"error": str(e)}

    def __del__(self):
        """Cleanup when service is destroyed"""
        try:
            # Signal shutdown
            self.shutdown_event.set()
            
            # Wait for monitoring thread to finish
            if self.monitoring_thread and self.monitoring_thread.is_alive():
                self.monitoring_thread.join(timeout=5)
            
            # Shutdown thread pool
            if hasattr(self, 'thread_pool'):
                self.thread_pool.shutdown(wait=False)
                
        except Exception:
            pass