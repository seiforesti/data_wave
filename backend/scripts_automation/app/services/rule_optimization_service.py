"""
⚡ RULE OPTIMIZATION SERVICE
Advanced AI-powered rule optimization engine that provides intelligent rule tuning,
performance optimization, and adaptive rule management for enterprise-level scanning operations.
"""

from typing import List, Dict, Any, Optional, Union, Set, Tuple
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import json
import logging
import numpy as np
from dataclasses import dataclass
from collections import defaultdict, Counter
import hashlib
from scipy.optimize import minimize, differential_evolution
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from sqlalchemy import and_, or_, func
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..models.scan_models import (
    Scan, ScanStatus, DataSource, ScanResult
)
from ..models.advanced_scan_rule_models import (
    IntelligentScanRule, RuleExecutionHistory, ScanRulePerformance,
    RuleOptimizationConfig, OptimizationResult
)
from ..models.scan_orchestration_models import (
    ScanOrchestrationJob, ScanWorkflow
)
from ..core.database import get_session
from .enterprise_scan_rule_service import EnterpriseScanRuleService
from .intelligent_pattern_service import IntelligentPatternService

logger = logging.getLogger(__name__)

class OptimizationStrategy(str, Enum):
    """Rule optimization strategies"""
    PERFORMANCE = "performance"           # Optimize for execution speed
    ACCURACY = "accuracy"                # Optimize for detection accuracy
    RESOURCE_EFFICIENCY = "resource_efficiency"  # Optimize for resource usage
    BALANCED = "balanced"                # Balance all factors
    COST_EFFECTIVE = "cost_effective"    # Optimize for cost efficiency
    LATENCY = "latency"                  # Optimize for low latency
    THROUGHPUT = "throughput"            # Optimize for high throughput

class OptimizationObjective(str, Enum):
    """Optimization objectives"""
    MINIMIZE_EXECUTION_TIME = "minimize_execution_time"
    MAXIMIZE_ACCURACY = "maximize_accuracy"
    MINIMIZE_FALSE_POSITIVES = "minimize_false_positives"
    MINIMIZE_RESOURCE_USAGE = "minimize_resource_usage"
    MAXIMIZE_THROUGHPUT = "maximize_throughput"
    MINIMIZE_COST = "minimize_cost"
    MAXIMIZE_COVERAGE = "maximize_coverage"

class RuleComplexity(str, Enum):
    """Rule complexity levels"""
    VERY_LOW = "very_low"     # Simple patterns
    LOW = "low"               # Basic regex patterns
    MEDIUM = "medium"         # Moderate complexity
    HIGH = "high"             # Complex patterns with multiple conditions
    VERY_HIGH = "very_high"   # Highly complex nested patterns

@dataclass
class OptimizationMetrics:
    """Metrics for rule optimization"""
    execution_time: float
    accuracy_score: float
    false_positive_rate: float
    false_negative_rate: float
    resource_usage: Dict[str, float]
    throughput: float
    cost_score: float
    coverage_score: float
    complexity_score: float

@dataclass
class OptimizationCandidate:
    """Candidate rule configuration for optimization"""
    rule_id: str
    configuration: Dict[str, Any]
    predicted_metrics: OptimizationMetrics
    confidence: float
    optimization_score: float

class PerformancePredictor:
    """Machine learning-based performance predictor for rule optimization"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_columns = [
            'rule_complexity', 'pattern_length', 'condition_count',
            'data_source_size', 'data_type_variety', 'historical_performance',
            'resource_availability', 'concurrent_rules'
        ]
        self.trained = False
        
    async def train_performance_models(
        self,
        training_data: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """Train ML models to predict rule performance"""
        
        if not training_data:
            return {"error": "No training data available"}
        
        # Prepare feature matrix and target variables
        features = []
        targets = {
            'execution_time': [],
            'accuracy_score': [],
            'resource_usage': [],
            'throughput': []
        }
        
        for data in training_data:
            feature_vector = self._extract_features(data)
            features.append(feature_vector)
            
            targets['execution_time'].append(data.get('execution_time', 0))
            targets['accuracy_score'].append(data.get('accuracy_score', 0))
            targets['resource_usage'].append(data.get('resource_usage', {}).get('total', 0))
            targets['throughput'].append(data.get('throughput', 0))
        
        features = np.array(features)
        
        # Scale features
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        self.scalers['main'] = scaler
        
        # Train models for each target
        model_scores = {}
        for target_name, target_values in targets.items():
            if not target_values:
                continue
                
            target_array = np.array(target_values)
            
            # Try different models and select the best
            models = {
                'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
                'gradient_boosting': GradientBoostingRegressor(n_estimators=100, random_state=42)
            }
            
            best_model = None
            best_score = -np.inf
            
            for model_name, model in models.items():
                try:
                    # Cross-validation
                    scores = cross_val_score(model, features_scaled, target_array, cv=5, scoring='r2')
                    avg_score = np.mean(scores)
                    
                    if avg_score > best_score:
                        best_score = avg_score
                        best_model = model
                        
                    logger.info(f"Model {model_name} for {target_name}: R² = {avg_score:.3f}")
                    
                except Exception as e:
                    logger.error(f"Error training {model_name} for {target_name}: {str(e)}")
                    continue
            
            if best_model is not None:
                # Train the best model on full dataset
                best_model.fit(features_scaled, target_array)
                self.models[target_name] = best_model
                model_scores[target_name] = best_score
        
        self.trained = True
        return model_scores
    
    def _extract_features(self, data: Dict[str, Any]) -> List[float]:
        """Extract features from rule execution data"""
        
        return [
            data.get('rule_complexity', 0),
            data.get('pattern_length', 0),
            data.get('condition_count', 0),
            data.get('data_source_size', 0),
            data.get('data_type_variety', 0),
            data.get('historical_performance', 0),
            data.get('resource_availability', 0),
            data.get('concurrent_rules', 0)
        ]
    
    async def predict_performance(
        self,
        rule_config: Dict[str, Any]
    ) -> OptimizationMetrics:
        """Predict performance metrics for a rule configuration"""
        
        if not self.trained:
            # Return default metrics if not trained
            return OptimizationMetrics(
                execution_time=1.0,
                accuracy_score=0.8,
                false_positive_rate=0.1,
                false_negative_rate=0.1,
                resource_usage={'cpu': 10, 'memory': 100},
                throughput=100.0,
                cost_score=1.0,
                coverage_score=0.8,
                complexity_score=0.5
            )
        
        # Extract features
        feature_vector = self._extract_features(rule_config)
        features = np.array([feature_vector])
        
        # Scale features
        if 'main' in self.scalers:
            features_scaled = self.scalers['main'].transform(features)
        else:
            features_scaled = features
        
        # Predict using trained models
        predictions = {}
        for target_name, model in self.models.items():
            try:
                prediction = model.predict(features_scaled)[0]
                predictions[target_name] = max(0, prediction)  # Ensure non-negative
            except Exception as e:
                logger.error(f"Error predicting {target_name}: {str(e)}")
                predictions[target_name] = 0.5  # Default value
        
        # Calculate derived metrics
        false_positive_rate = max(0, min(1, 1 - predictions.get('accuracy_score', 0.8)))
        false_negative_rate = false_positive_rate * 0.5  # Estimate
        
        return OptimizationMetrics(
            execution_time=predictions.get('execution_time', 1.0),
            accuracy_score=predictions.get('accuracy_score', 0.8),
            false_positive_rate=false_positive_rate,
            false_negative_rate=false_negative_rate,
            resource_usage={
                'cpu': predictions.get('resource_usage', 10) * 0.6,
                'memory': predictions.get('resource_usage', 100),
                'network': predictions.get('resource_usage', 10) * 0.3,
                'storage': predictions.get('resource_usage', 50)
            },
            throughput=predictions.get('throughput', 100.0),
            cost_score=predictions.get('resource_usage', 1.0) * 0.01,
            coverage_score=min(1.0, predictions.get('accuracy_score', 0.8) * 1.2),
            complexity_score=rule_config.get('rule_complexity', 0.5)
        )

class RuleOptimizer:
    """Advanced rule optimizer using mathematical optimization techniques"""
    
    def __init__(self, performance_predictor: PerformancePredictor):
        self.performance_predictor = performance_predictor
        self.optimization_history = []
        
    async def optimize_rule_configuration(
        self,
        rule: IntelligentScanRule,
        strategy: OptimizationStrategy,
        constraints: Optional[Dict[str, Any]] = None
    ) -> OptimizationCandidate:
        """Optimize rule configuration using advanced optimization algorithms"""
        
        # Define optimization bounds and parameters
        param_bounds = await self._get_parameter_bounds(rule)
        
        # Set up optimization objective
        objective_func = await self._create_objective_function(strategy, constraints)
        
        # Run optimization
        best_candidate = None
        
        try:
            # Try multiple optimization algorithms
            algorithms = [
                ('differential_evolution', self._run_differential_evolution),
                ('gradient_descent', self._run_gradient_optimization),
                ('genetic_algorithm', self._run_genetic_algorithm)
            ]
            
            candidates = []
            
            for algo_name, algo_func in algorithms:
                try:
                    candidate = await algo_func(
                        rule, objective_func, param_bounds, strategy
                    )
                    if candidate:
                        candidates.append(candidate)
                        logger.info(f"Optimization algorithm {algo_name} completed for rule {rule.id}")
                except Exception as e:
                    logger.error(f"Optimization algorithm {algo_name} failed: {str(e)}")
                    continue
            
            # Select best candidate
            if candidates:
                best_candidate = max(candidates, key=lambda x: x.optimization_score)
            
        except Exception as e:
            logger.error(f"Rule optimization failed: {str(e)}")
            
        if not best_candidate:
            # Fallback to current configuration
            current_metrics = await self.performance_predictor.predict_performance(
                self._rule_to_config(rule)
            )
            best_candidate = OptimizationCandidate(
                rule_id=rule.id,
                configuration=self._rule_to_config(rule),
                predicted_metrics=current_metrics,
                confidence=0.5,
                optimization_score=0.5
            )
        
        # Record optimization attempt
        self.optimization_history.append({
            'rule_id': rule.id,
            'strategy': strategy,
            'timestamp': datetime.utcnow(),
            'optimization_score': best_candidate.optimization_score,
            'confidence': best_candidate.confidence
        })
        
        return best_candidate
    
    async def _get_parameter_bounds(
        self,
        rule: IntelligentScanRule
    ) -> Dict[str, Tuple[float, float]]:
        """Get parameter bounds for optimization"""
        
        return {
            'confidence_threshold': (0.1, 1.0),
            'timeout_seconds': (1.0, 300.0),
            'max_matches': (1, 10000),
            'sampling_rate': (0.01, 1.0),
            'priority_weight': (0.1, 10.0),
            'complexity_factor': (0.1, 2.0)
        }
    
    async def _create_objective_function(
        self,
        strategy: OptimizationStrategy,
        constraints: Optional[Dict[str, Any]]
    ):
        """Create optimization objective function"""
        
        async def objective_function(params: Dict[str, float]) -> float:
            """Multi-objective optimization function"""
            
            # Predict metrics for given parameters
            config = {
                'rule_complexity': params.get('complexity_factor', 1.0),
                'pattern_length': params.get('timeout_seconds', 60) / 10,
                'condition_count': int(params.get('max_matches', 100) / 100),
                'confidence_threshold': params.get('confidence_threshold', 0.7),
                'resource_availability': 0.8,  # Assume good availability
                'concurrent_rules': 5  # Typical concurrent rule count
            }
            
            metrics = await self.performance_predictor.predict_performance(config)
            
            # Calculate objective based on strategy
            if strategy == OptimizationStrategy.PERFORMANCE:
                score = 1.0 / (1.0 + metrics.execution_time)  # Minimize execution time
            elif strategy == OptimizationStrategy.ACCURACY:
                score = metrics.accuracy_score  # Maximize accuracy
            elif strategy == OptimizationStrategy.RESOURCE_EFFICIENCY:
                total_resources = sum(metrics.resource_usage.values())
                score = 1.0 / (1.0 + total_resources / 100)  # Minimize resource usage
            elif strategy == OptimizationStrategy.BALANCED:
                # Weighted combination of factors
                score = (
                    0.3 * metrics.accuracy_score +
                    0.2 * (1.0 / (1.0 + metrics.execution_time)) +
                    0.2 * (1.0 - metrics.false_positive_rate) +
                    0.15 * metrics.throughput / 1000 +
                    0.15 * (1.0 / (1.0 + metrics.cost_score))
                )
            elif strategy == OptimizationStrategy.COST_EFFECTIVE:
                score = metrics.accuracy_score / (1.0 + metrics.cost_score)
            elif strategy == OptimizationStrategy.LATENCY:
                score = 1.0 / (1.0 + metrics.execution_time)
            elif strategy == OptimizationStrategy.THROUGHPUT:
                score = metrics.throughput / 1000
            else:
                score = 0.5  # Default
            
            # Apply constraints
            if constraints:
                penalty = 0.0
                
                if 'max_execution_time' in constraints:
                    if metrics.execution_time > constraints['max_execution_time']:
                        penalty += (metrics.execution_time - constraints['max_execution_time']) * 0.1
                
                if 'min_accuracy' in constraints:
                    if metrics.accuracy_score < constraints['min_accuracy']:
                        penalty += (constraints['min_accuracy'] - metrics.accuracy_score) * 2.0
                
                if 'max_false_positive_rate' in constraints:
                    if metrics.false_positive_rate > constraints['max_false_positive_rate']:
                        penalty += (metrics.false_positive_rate - constraints['max_false_positive_rate']) * 1.5
                
                score = max(0.0, score - penalty)
            
            return score
        
        return objective_function
    
    async def _run_differential_evolution(
        self,
        rule: IntelligentScanRule,
        objective_func,
        param_bounds: Dict[str, Tuple[float, float]],
        strategy: OptimizationStrategy
    ) -> Optional[OptimizationCandidate]:
        """Run differential evolution optimization"""
        
        try:
            # Convert bounds to list format
            bounds = list(param_bounds.values())
            param_names = list(param_bounds.keys())
            
            def objective_wrapper(x):
                params = dict(zip(param_names, x))
                return -asyncio.run(objective_func(params))  # Minimize negative
            
            # Run optimization
            result = differential_evolution(
                objective_wrapper,
                bounds,
                maxiter=50,
                seed=42,
                atol=1e-4,
                tol=1e-4
            )
            
            if result.success:
                optimal_params = dict(zip(param_names, result.x))
                
                # Predict metrics for optimal configuration
                config = self._params_to_config(optimal_params, rule)
                predicted_metrics = await self.performance_predictor.predict_performance(config)
                
                return OptimizationCandidate(
                    rule_id=rule.id,
                    configuration=config,
                    predicted_metrics=predicted_metrics,
                    confidence=0.9,
                    optimization_score=-result.fun  # Convert back to positive
                )
            
        except Exception as e:
            logger.error(f"Differential evolution optimization failed: {str(e)}")
            
        return None
    
    async def _run_gradient_optimization(
        self,
        rule: IntelligentScanRule,
        objective_func,
        param_bounds: Dict[str, Tuple[float, float]],
        strategy: OptimizationStrategy
    ) -> Optional[OptimizationCandidate]:
        """Run gradient-based optimization"""
        
        try:
            # Start with current rule configuration
            current_config = self._rule_to_config(rule)
            x0 = [current_config.get(param, (bounds[0] + bounds[1]) / 2) 
                  for param, bounds in param_bounds.items()]
            
            bounds_list = list(param_bounds.values())
            param_names = list(param_bounds.keys())
            
            def objective_wrapper(x):
                params = dict(zip(param_names, x))
                return -asyncio.run(objective_func(params))  # Minimize negative
            
            # Run optimization
            result = minimize(
                objective_wrapper,
                x0,
                method='L-BFGS-B',
                bounds=bounds_list,
                options={'maxiter': 100}
            )
            
            if result.success:
                optimal_params = dict(zip(param_names, result.x))
                
                config = self._params_to_config(optimal_params, rule)
                predicted_metrics = await self.performance_predictor.predict_performance(config)
                
                return OptimizationCandidate(
                    rule_id=rule.id,
                    configuration=config,
                    predicted_metrics=predicted_metrics,
                    confidence=0.8,
                    optimization_score=-result.fun
                )
            
        except Exception as e:
            logger.error(f"Gradient optimization failed: {str(e)}")
            
        return None
    
    async def _run_genetic_algorithm(
        self,
        rule: IntelligentScanRule,
        objective_func,
        param_bounds: Dict[str, Tuple[float, float]],
        strategy: OptimizationStrategy
    ) -> Optional[OptimizationCandidate]:
        """Run genetic algorithm optimization"""
        
        # This would implement a custom genetic algorithm
        # For now, return None to use other algorithms
        return None
    
    def _rule_to_config(self, rule: IntelligentScanRule) -> Dict[str, Any]:
        """Convert rule to configuration dictionary"""
        
        return {
            'rule_complexity': self._calculate_rule_complexity(rule),
            'pattern_length': len(rule.pattern) if rule.pattern else 0,
            'condition_count': len(rule.conditions) if hasattr(rule, 'conditions') and rule.conditions else 1,
            'confidence_threshold': rule.confidence_threshold,
            'timeout_seconds': getattr(rule, 'timeout_seconds', 60),
            'max_matches': getattr(rule, 'max_matches', 1000),
            'sampling_rate': getattr(rule, 'sampling_rate', 1.0),
            'priority_weight': getattr(rule, 'priority_weight', 1.0)
        }
    
    def _params_to_config(
        self, 
        params: Dict[str, float], 
        rule: IntelligentScanRule
    ) -> Dict[str, Any]:
        """Convert optimization parameters to configuration"""
        
        base_config = self._rule_to_config(rule)
        base_config.update(params)
        return base_config
    
    def _calculate_rule_complexity(self, rule: IntelligentScanRule) -> float:
        """Calculate rule complexity score"""
        
        complexity = 0.0
        
        if rule.pattern:
            # Pattern complexity factors
            pattern = rule.pattern
            complexity += len(pattern) * 0.01
            complexity += pattern.count('(') * 0.1  # Grouping
            complexity += pattern.count('[') * 0.05  # Character classes
            complexity += pattern.count('{') * 0.05  # Quantifiers
            complexity += pattern.count('|') * 0.1   # Alternation
            complexity += pattern.count('\\') * 0.02 # Escapes
        
        # Condition complexity
        if hasattr(rule, 'conditions') and rule.conditions:
            complexity += len(rule.conditions) * 0.2
        
        # Normalize to 0-1 range
        return min(1.0, complexity)

class AdaptiveRuleManager:
    """Adaptive rule management system that learns and optimizes rules over time"""
    
    def __init__(self, rule_optimizer: RuleOptimizer):
        self.rule_optimizer = rule_optimizer
        self.performance_history = defaultdict(list)
        self.adaptation_rules = {}
        self.learning_rate = 0.1
        
    async def monitor_rule_performance(
        self,
        rule_id: str,
        execution_metrics: Dict[str, Any]
    ):
        """Monitor and record rule performance"""
        
        timestamp = datetime.utcnow()
        
        performance_record = {
            'timestamp': timestamp,
            'execution_time': execution_metrics.get('execution_time', 0),
            'accuracy_score': execution_metrics.get('accuracy_score', 0),
            'false_positive_rate': execution_metrics.get('false_positive_rate', 0),
            'resource_usage': execution_metrics.get('resource_usage', {}),
            'throughput': execution_metrics.get('throughput', 0),
            'error_count': execution_metrics.get('error_count', 0)
        }
        
        self.performance_history[rule_id].append(performance_record)
        
        # Keep only recent history (last 1000 records)
        if len(self.performance_history[rule_id]) > 1000:
            self.performance_history[rule_id] = self.performance_history[rule_id][-1000:]
        
        # Check if adaptation is needed
        await self._check_adaptation_triggers(rule_id)
    
    async def _check_adaptation_triggers(self, rule_id: str):
        """Check if rule needs adaptation based on performance trends"""
        
        history = self.performance_history[rule_id]
        
        if len(history) < 10:  # Need sufficient data
            return
        
        # Analyze recent trend (last 10 executions)
        recent_performance = history[-10:]
        older_performance = history[-20:-10] if len(history) >= 20 else history[:-10]
        
        if not older_performance:
            return
        
        # Calculate performance changes
        recent_avg_time = np.mean([r['execution_time'] for r in recent_performance])
        older_avg_time = np.mean([r['execution_time'] for r in older_performance])
        
        recent_avg_accuracy = np.mean([r['accuracy_score'] for r in recent_performance])
        older_avg_accuracy = np.mean([r['accuracy_score'] for r in older_performance])
        
        # Trigger adaptation if significant degradation
        time_degradation = (recent_avg_time - older_avg_time) / older_avg_time if older_avg_time > 0 else 0
        accuracy_degradation = (older_avg_accuracy - recent_avg_accuracy) / older_avg_accuracy if older_avg_accuracy > 0 else 0
        
        if time_degradation > 0.2 or accuracy_degradation > 0.1:  # 20% time increase or 10% accuracy decrease
            logger.info(f"Performance degradation detected for rule {rule_id}, triggering adaptation")
            await self._trigger_rule_adaptation(rule_id)
    
    async def _trigger_rule_adaptation(self, rule_id: str):
        """Trigger adaptive optimization for a rule"""
        
        with get_session() as session:
            rule = session.query(IntelligentScanRule).filter(
                IntelligentScanRule.id == rule_id
            ).first()
            
            if not rule:
                return
            
            # Determine optimal strategy based on performance issues
            strategy = self._determine_adaptation_strategy(rule_id)
            
            # Run optimization
            try:
                optimized_candidate = await self.rule_optimizer.optimize_rule_configuration(
                    rule, strategy
                )
                
                # Apply optimization if improvement is significant
                if optimized_candidate.optimization_score > 0.7:  # Threshold for applying changes
                    await self._apply_rule_optimization(rule, optimized_candidate, session)
                    logger.info(f"Applied adaptive optimization to rule {rule_id}")
                
            except Exception as e:
                logger.error(f"Adaptive optimization failed for rule {rule_id}: {str(e)}")
    
    def _determine_adaptation_strategy(self, rule_id: str) -> OptimizationStrategy:
        """Determine the best optimization strategy based on performance history"""
        
        history = self.performance_history[rule_id]
        
        if not history:
            return OptimizationStrategy.BALANCED
        
        # Analyze primary performance issues
        recent_records = history[-20:] if len(history) >= 20 else history
        
        avg_execution_time = np.mean([r['execution_time'] for r in recent_records])
        avg_accuracy = np.mean([r['accuracy_score'] for r in recent_records])
        avg_fp_rate = np.mean([r['false_positive_rate'] for r in recent_records])
        
        # Determine primary issue
        if avg_execution_time > 10.0:  # Slow execution
            return OptimizationStrategy.PERFORMANCE
        elif avg_accuracy < 0.7:  # Low accuracy
            return OptimizationStrategy.ACCURACY
        elif avg_fp_rate > 0.2:  # High false positives
            return OptimizationStrategy.ACCURACY
        else:
            return OptimizationStrategy.BALANCED
    
    async def _apply_rule_optimization(
        self,
        rule: IntelligentScanRule,
        candidate: OptimizationCandidate,
        session: Session
    ):
        """Apply optimization results to the rule"""
        
        # Update rule configuration
        config = candidate.configuration
        
        if 'confidence_threshold' in config:
            rule.confidence_threshold = config['confidence_threshold']
        
        # Update metadata with optimization info
        if not rule.metadata:
            rule.metadata = {}
        
        rule.metadata.update({
            'last_optimization': datetime.utcnow().isoformat(),
            'optimization_strategy': candidate.configuration.get('strategy'),
            'optimization_score': candidate.optimization_score,
            'predicted_metrics': {
                'execution_time': candidate.predicted_metrics.execution_time,
                'accuracy_score': candidate.predicted_metrics.accuracy_score,
                'false_positive_rate': candidate.predicted_metrics.false_positive_rate
            }
        })
        
        rule.updated_at = datetime.utcnow()
        session.commit()

class RuleOptimizationService:
    """
    ⚡ RULE OPTIMIZATION SERVICE
    
    Advanced AI-powered rule optimization engine that provides intelligent rule tuning,
    performance optimization, and adaptive rule management for enterprise-level
    scanning operations with machine learning capabilities.
    """
    
    def __init__(self):
        self.performance_predictor = PerformancePredictor()
        self.rule_optimizer = RuleOptimizer(self.performance_predictor)
        self.adaptive_manager = AdaptiveRuleManager(self.rule_optimizer)
        self.enterprise_rule_service = EnterpriseScanRuleService()
        self.pattern_service = IntelligentPatternService()
        self.optimization_cache = {}
        
    async def initialize_optimization_models(self) -> Dict[str, Any]:
        """Initialize and train optimization models"""
        
        # Collect training data from rule execution history
        training_data = await self._collect_training_data()
        
        if not training_data:
            logger.warning("No training data available for optimization models")
            return {"status": "no_data", "message": "Insufficient training data"}
        
        # Train performance prediction models
        model_scores = await self.performance_predictor.train_performance_models(training_data)
        
        logger.info(f"Optimization models trained with {len(training_data)} samples")
        
        return {
            "status": "success",
            "training_samples": len(training_data),
            "model_scores": model_scores,
            "trained_at": datetime.utcnow()
        }
    
    async def optimize_rule(
        self,
        rule_id: str,
        strategy: OptimizationStrategy = OptimizationStrategy.BALANCED,
        constraints: Optional[Dict[str, Any]] = None
    ) -> OptimizationResult:
        """Optimize a specific rule using AI-powered optimization"""
        
        with get_session() as session:
            rule = session.query(IntelligentScanRule).filter(
                IntelligentScanRule.id == rule_id
            ).first()
            
            if not rule:
                raise HTTPException(status_code=404, detail="Rule not found")
            
            try:
                # Check cache first
                cache_key = f"{rule_id}_{strategy}_{hash(str(constraints))}"
                if cache_key in self.optimization_cache:
                    cached_result = self.optimization_cache[cache_key]
                    if (datetime.utcnow() - cached_result['timestamp']).seconds < 3600:  # 1 hour cache
                        return cached_result['result']
                
                # Run optimization
                logger.info(f"Starting optimization for rule {rule_id} with strategy {strategy}")
                
                start_time = datetime.utcnow()
                
                # Get current performance baseline
                baseline_metrics = await self._get_rule_baseline_metrics(rule)
                
                # Optimize rule configuration
                optimized_candidate = await self.rule_optimizer.optimize_rule_configuration(
                    rule, strategy, constraints
                )
                
                optimization_time = (datetime.utcnow() - start_time).total_seconds()
                
                # Calculate improvement metrics
                improvement = await self._calculate_improvement(
                    baseline_metrics, optimized_candidate.predicted_metrics
                )
                
                # Create optimization result
                result = OptimizationResult(
                    rule_id=rule_id,
                    strategy=strategy,
                    baseline_metrics=baseline_metrics.__dict__,
                    optimized_metrics=optimized_candidate.predicted_metrics.__dict__,
                    improvement_percentage=improvement,
                    optimization_confidence=optimized_candidate.confidence,
                    optimization_time=optimization_time,
                    recommended_config=optimized_candidate.configuration,
                    constraints_applied=constraints or {},
                    timestamp=datetime.utcnow()
                )
                
                # Cache result
                self.optimization_cache[cache_key] = {
                    'result': result,
                    'timestamp': datetime.utcnow()
                }
                
                logger.info(f"Optimization completed for rule {rule_id}: {improvement:.1f}% improvement")
                
                return result
                
            except Exception as e:
                logger.error(f"Rule optimization failed for {rule_id}: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")
    
    async def batch_optimize_rules(
        self,
        rule_ids: List[str],
        strategy: OptimizationStrategy = OptimizationStrategy.BALANCED,
        constraints: Optional[Dict[str, Any]] = None
    ) -> List[OptimizationResult]:
        """Optimize multiple rules in batch"""
        
        results = []
        
        # Process rules in parallel (with concurrency limit)
        semaphore = asyncio.Semaphore(5)  # Limit to 5 concurrent optimizations
        
        async def optimize_single_rule(rule_id: str) -> OptimizationResult:
            async with semaphore:
                try:
                    return await self.optimize_rule(rule_id, strategy, constraints)
                except Exception as e:
                    logger.error(f"Batch optimization failed for rule {rule_id}: {str(e)}")
                    return None
        
        # Run optimizations
        tasks = [optimize_single_rule(rule_id) for rule_id in rule_ids]
        optimization_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter successful results
        for result in optimization_results:
            if isinstance(result, OptimizationResult):
                results.append(result)
        
        logger.info(f"Batch optimization completed: {len(results)}/{len(rule_ids)} successful")
        
        return results
    
    async def apply_optimization(
        self,
        rule_id: str,
        optimization_result: OptimizationResult
    ) -> bool:
        """Apply optimization results to a rule"""
        
        with get_session() as session:
            rule = session.query(IntelligentScanRule).filter(
                IntelligentScanRule.id == rule_id
            ).first()
            
            if not rule:
                raise HTTPException(status_code=404, detail="Rule not found")
            
            try:
                # Backup current configuration
                backup_config = {
                    'confidence_threshold': rule.confidence_threshold,
                    'metadata': rule.metadata.copy() if rule.metadata else {},
                    'updated_at': rule.updated_at
                }
                
                # Apply optimized configuration
                recommended_config = optimization_result.recommended_config
                
                if 'confidence_threshold' in recommended_config:
                    rule.confidence_threshold = recommended_config['confidence_threshold']
                
                # Update metadata
                if not rule.metadata:
                    rule.metadata = {}
                
                rule.metadata.update({
                    'optimization_applied': datetime.utcnow().isoformat(),
                    'optimization_strategy': optimization_result.strategy,
                    'expected_improvement': optimization_result.improvement_percentage,
                    'optimization_confidence': optimization_result.optimization_confidence,
                    'backup_config': backup_config
                })
                
                rule.updated_at = datetime.utcnow()
                
                session.commit()
                
                logger.info(f"Applied optimization to rule {rule_id}")
                return True
                
            except Exception as e:
                logger.error(f"Failed to apply optimization to rule {rule_id}: {str(e)}")
                session.rollback()
                return False
    
    async def monitor_rule_performance(
        self,
        rule_id: str,
        execution_metrics: Dict[str, Any]
    ):
        """Monitor rule performance and trigger adaptive optimization if needed"""
        
        await self.adaptive_manager.monitor_rule_performance(rule_id, execution_metrics)
    
    async def get_optimization_recommendations(
        self,
        data_source_id: Optional[int] = None,
        performance_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Get optimization recommendations for rules"""
        
        recommendations = []
        
        with get_session() as session:
            # Get rules to analyze
            query = session.query(IntelligentScanRule)
            if data_source_id:
                # Filter by data source if specified
                query = query.filter(
                    IntelligentScanRule.metadata.contains(f'"data_source_id": {data_source_id}')
                )
            
            rules = query.filter(IntelligentScanRule.is_active == True).all()
            
            # Analyze each rule
            for rule in rules:
                try:
                    # Get performance history
                    if rule.id in self.adaptive_manager.performance_history:
                        history = self.adaptive_manager.performance_history[rule.id]
                        
                        if len(history) >= 5:  # Need sufficient data
                            recent_performance = history[-10:]
                            avg_score = np.mean([
                                r.get('accuracy_score', 0) * 0.4 +
                                (1.0 / (1.0 + r.get('execution_time', 1))) * 0.3 +
                                (1.0 - r.get('false_positive_rate', 0)) * 0.3
                                for r in recent_performance
                            ])
                            
                            if avg_score < performance_threshold:
                                # Generate recommendation
                                strategy = self.adaptive_manager._determine_adaptation_strategy(rule.id)
                                
                                recommendation = {
                                    'rule_id': rule.id,
                                    'rule_name': rule.name,
                                    'current_performance_score': avg_score,
                                    'recommended_strategy': strategy,
                                    'priority': 'high' if avg_score < 0.5 else 'medium',
                                    'expected_improvement': '15-30%',
                                    'performance_issues': self._identify_performance_issues(recent_performance)
                                }
                                
                                recommendations.append(recommendation)
                
                except Exception as e:
                    logger.error(f"Error analyzing rule {rule.id}: {str(e)}")
                    continue
        
        # Sort by priority and performance score
        recommendations.sort(key=lambda x: (x['priority'] == 'high', -x['current_performance_score']))
        
        return recommendations
    
    def _identify_performance_issues(self, performance_history: List[Dict[str, Any]]) -> List[str]:
        """Identify specific performance issues from history"""
        
        issues = []
        
        avg_execution_time = np.mean([r.get('execution_time', 0) for r in performance_history])
        avg_accuracy = np.mean([r.get('accuracy_score', 0) for r in performance_history])
        avg_fp_rate = np.mean([r.get('false_positive_rate', 0) for r in performance_history])
        error_rate = np.mean([r.get('error_count', 0) for r in performance_history])
        
        if avg_execution_time > 5.0:
            issues.append(f"Slow execution time (avg: {avg_execution_time:.1f}s)")
        
        if avg_accuracy < 0.7:
            issues.append(f"Low accuracy (avg: {avg_accuracy:.1%})")
        
        if avg_fp_rate > 0.15:
            issues.append(f"High false positive rate (avg: {avg_fp_rate:.1%})")
        
        if error_rate > 0.05:
            issues.append(f"Frequent errors (rate: {error_rate:.1%})")
        
        return issues
    
    async def _collect_training_data(self) -> List[Dict[str, Any]]:
        """Collect training data from rule execution history"""
        
        training_data = []
        
        with get_session() as session:
            # Get rule execution history
            history_records = session.query(RuleExecutionHistory).filter(
                RuleExecutionHistory.created_at >= datetime.utcnow() - timedelta(days=30)
            ).all()
            
            for record in history_records:
                try:
                    # Extract features and targets
                    training_sample = {
                        'rule_complexity': record.metadata.get('rule_complexity', 0.5),
                        'pattern_length': len(record.pattern) if record.pattern else 0,
                        'condition_count': record.metadata.get('condition_count', 1),
                        'data_source_size': record.metadata.get('data_source_size', 1000),
                        'data_type_variety': record.metadata.get('data_type_variety', 3),
                        'historical_performance': record.performance_score or 0.5,
                        'resource_availability': 0.8,  # Default
                        'concurrent_rules': record.metadata.get('concurrent_rules', 5),
                        'execution_time': record.execution_time or 1.0,
                        'accuracy_score': record.accuracy_score or 0.5,
                        'resource_usage': record.metadata.get('resource_usage', {'total': 10}),
                        'throughput': record.metadata.get('throughput', 100)
                    }
                    
                    training_data.append(training_sample)
                    
                except Exception as e:
                    logger.error(f"Error processing training record {record.id}: {str(e)}")
                    continue
        
        logger.info(f"Collected {len(training_data)} training samples")
        return training_data
    
    async def _get_rule_baseline_metrics(
        self,
        rule: IntelligentScanRule
    ) -> OptimizationMetrics:
        """Get baseline performance metrics for a rule"""
        
        # Use performance predictor to get current metrics
        current_config = self.rule_optimizer._rule_to_config(rule)
        return await self.performance_predictor.predict_performance(current_config)
    
    async def _calculate_improvement(
        self,
        baseline: OptimizationMetrics,
        optimized: OptimizationMetrics
    ) -> float:
        """Calculate overall improvement percentage"""
        
        improvements = []
        
        # Execution time improvement (lower is better)
        if baseline.execution_time > 0:
            time_improvement = (baseline.execution_time - optimized.execution_time) / baseline.execution_time
            improvements.append(time_improvement * 0.3)
        
        # Accuracy improvement (higher is better)
        accuracy_improvement = (optimized.accuracy_score - baseline.accuracy_score) / max(baseline.accuracy_score, 0.1)
        improvements.append(accuracy_improvement * 0.4)
        
        # False positive rate improvement (lower is better)
        if baseline.false_positive_rate > 0:
            fp_improvement = (baseline.false_positive_rate - optimized.false_positive_rate) / baseline.false_positive_rate
            improvements.append(fp_improvement * 0.3)
        
        # Calculate weighted average improvement
        overall_improvement = sum(improvements) * 100  # Convert to percentage
        
        return max(-50.0, min(100.0, overall_improvement))  # Clamp between -50% and 100%
    
    async def get_optimization_analytics(self) -> Dict[str, Any]:
        """Get comprehensive optimization analytics"""
        
        total_optimizations = len(self.rule_optimizer.optimization_history)
        
        if total_optimizations == 0:
            return {
                "total_optimizations": 0,
                "message": "No optimizations performed yet"
            }
        
        # Calculate statistics
        optimization_scores = [opt['optimization_score'] for opt in self.rule_optimizer.optimization_history]
        confidence_scores = [opt['confidence'] for opt in self.rule_optimizer.optimization_history]
        
        strategy_counts = Counter([opt['strategy'] for opt in self.rule_optimizer.optimization_history])
        
        # Performance prediction model status
        model_status = {
            'trained': self.performance_predictor.trained,
            'models_count': len(self.performance_predictor.models),
            'training_features': len(self.performance_predictor.feature_columns)
        }
        
        return {
            "total_optimizations": total_optimizations,
            "average_optimization_score": np.mean(optimization_scores),
            "average_confidence": np.mean(confidence_scores),
            "strategy_distribution": dict(strategy_counts),
            "model_status": model_status,
            "cache_entries": len(self.optimization_cache),
            "adaptive_rules_monitored": len(self.adaptive_manager.performance_history),
            "last_optimization": max([opt['timestamp'] for opt in self.rule_optimizer.optimization_history]) if self.rule_optimizer.optimization_history else None
        }


# Global service instance
rule_optimization_service = RuleOptimizationService()