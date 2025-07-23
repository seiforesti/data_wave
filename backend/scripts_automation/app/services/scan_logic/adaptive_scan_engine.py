"""
Advanced Adaptive Scan Engine Service
Provides AI-powered scan strategy optimization, resource-aware scheduling, and intelligent workload distribution.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple
from dataclasses import dataclass, field
from enum import Enum
import json
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
import psutil
import math

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlmodel import SQLModel

from ...core.database import get_async_session
from ...models.scan_models import (
    ScanJob, ScanJobStatus, ScanJobPriority, ScanJobType,
    OrchestrationStrategy, ResourceAllocationMode, ScanExecutionMode
)
from ...models.policy_models import ScanPolicy
from ...models.asset_models import DataAsset
from ...models.quality_models import QualityProfile

logger = logging.getLogger(__name__)

class ScanningStrategy(str, Enum):
    ADAPTIVE = "adaptive"
    AGGRESSIVE = "aggressive"
    CONSERVATIVE = "conservative"
    INTELLIGENT = "intelligent"
    PREDICTIVE = "predictive"

class ResourceUtilizationLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ScanComplexityLevel(str, Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    VERY_COMPLEX = "very_complex"

@dataclass
class ScanContext:
    """Context information for scan execution"""
    asset_types: Set[str] = field(default_factory=set)
    data_volumes: Dict[str, int] = field(default_factory=dict)
    schema_complexity: Dict[str, int] = field(default_factory=dict)
    historical_performance: Dict[str, float] = field(default_factory=dict)
    resource_constraints: Dict[str, Any] = field(default_factory=dict)
    business_priority: int = 1
    compliance_requirements: List[str] = field(default_factory=list)

@dataclass
class ScanStrategy:
    """AI-optimized scan strategy"""
    strategy_type: ScanningStrategy
    resource_allocation: Dict[str, float]
    parallelism_level: int
    batch_size: int
    scan_depth: int
    timeout_settings: Dict[str, int]
    optimization_params: Dict[str, Any]
    expected_duration: timedelta
    confidence_score: float

@dataclass
class ResourceMetrics:
    """Current system resource metrics"""
    cpu_usage: float
    memory_usage: float
    disk_io: float
    network_io: float
    available_workers: int
    queue_length: int
    timestamp: datetime

class AdaptiveScanEngine:
    """
    Advanced adaptive scan engine that uses AI to optimize scanning strategies,
    manage resources intelligently, and coordinate scan execution across the system.
    """
    
    def __init__(self):
        self.active_scans: Dict[str, ScanJob] = {}
        self.resource_monitor = ResourceMonitor()
        self.strategy_optimizer = ScanStrategyOptimizer()
        self.workload_balancer = WorkloadBalancer()
        self.performance_predictor = PerformancePredictor()
        self.scan_coordinator = ScanCoordinator()
        self.thread_pool = ThreadPoolExecutor(max_workers=10)
        
    async def initialize_scan_engine(self) -> bool:
        """Initialize the adaptive scan engine with all components"""
        try:
            logger.info("Initializing Adaptive Scan Engine...")
            
            # Initialize components
            await self.resource_monitor.initialize()
            await self.strategy_optimizer.initialize()
            await self.workload_balancer.initialize()
            await self.performance_predictor.initialize()
            await self.scan_coordinator.initialize()
            
            # Start monitoring tasks
            asyncio.create_task(self._resource_monitoring_loop())
            asyncio.create_task(self._strategy_optimization_loop())
            asyncio.create_task(self._workload_balancing_loop())
            
            logger.info("Adaptive Scan Engine initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize adaptive scan engine: {str(e)}")
            return False
    
    async def optimize_scan_strategy(
        self,
        scan_context: ScanContext,
        constraints: Optional[Dict[str, Any]] = None
    ) -> ScanStrategy:
        """
        Use AI to optimize scan strategy based on context and constraints
        """
        try:
            # Analyze current system state
            resource_metrics = await self.resource_monitor.get_current_metrics()
            active_workload = await self._analyze_active_workload()
            
            # Generate strategy options
            strategy_options = await self.strategy_optimizer.generate_strategies(
                scan_context, resource_metrics, active_workload, constraints
            )
            
            # Evaluate and select best strategy
            optimal_strategy = await self._select_optimal_strategy(
                strategy_options, scan_context, resource_metrics
            )
            
            # Validate strategy feasibility
            validated_strategy = await self._validate_strategy(
                optimal_strategy, resource_metrics
            )
            
            logger.info(f"Optimized scan strategy: {validated_strategy.strategy_type}")
            return validated_strategy
            
        except Exception as e:
            logger.error(f"Failed to optimize scan strategy: {str(e)}")
            # Return conservative fallback strategy
            return self._get_fallback_strategy(scan_context)
    
    async def execute_adaptive_scan(
        self,
        assets: List[DataAsset],
        scan_policies: List[ScanPolicy],
        strategy: Optional[ScanStrategy] = None
    ) -> Dict[str, Any]:
        """
        Execute adaptive scan with intelligent resource management and coordination
        """
        try:
            scan_id = f"adaptive_scan_{datetime.now().isoformat()}"
            logger.info(f"Starting adaptive scan: {scan_id}")
            
            # Create scan context
            scan_context = await self._create_scan_context(assets, scan_policies)
            
            # Optimize strategy if not provided
            if not strategy:
                strategy = await self.optimize_scan_strategy(scan_context)
            
            # Create and schedule scan jobs
            scan_jobs = await self._create_scan_jobs(
                assets, scan_policies, strategy, scan_id
            )
            
            # Execute coordinated scan
            execution_results = await self.scan_coordinator.execute_coordinated_scan(
                scan_jobs, strategy
            )
            
            # Monitor and adapt during execution
            final_results = await self._monitor_and_adapt_execution(
                scan_id, execution_results, strategy
            )
            
            logger.info(f"Adaptive scan completed: {scan_id}")
            return final_results
            
        except Exception as e:
            logger.error(f"Failed to execute adaptive scan: {str(e)}")
            raise
    
    async def predict_scan_performance(
        self,
        scan_context: ScanContext,
        strategy: ScanStrategy
    ) -> Dict[str, Any]:
        """
        Predict scan performance using AI models
        """
        try:
            # Get historical performance data
            historical_data = await self._get_historical_performance_data(scan_context)
            
            # Use performance predictor
            predictions = await self.performance_predictor.predict_performance(
                scan_context, strategy, historical_data
            )
            
            # Generate performance insights
            insights = await self._generate_performance_insights(
                predictions, scan_context, strategy
            )
            
            return {
                "predictions": predictions,
                "insights": insights,
                "confidence_level": predictions.get("confidence", 0.7),
                "risk_factors": await self._identify_risk_factors(scan_context, strategy)
            }
            
        except Exception as e:
            logger.error(f"Failed to predict scan performance: {str(e)}")
            return {"error": str(e)}
    
    async def manage_scan_resources(
        self,
        active_scans: List[str],
        resource_constraints: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Intelligently manage resources across active scans
        """
        try:
            # Get current resource utilization
            current_metrics = await self.resource_monitor.get_current_metrics()
            
            # Analyze resource requirements for active scans
            scan_requirements = await self._analyze_scan_requirements(active_scans)
            
            # Optimize resource allocation
            allocation_plan = await self.workload_balancer.optimize_resource_allocation(
                scan_requirements, current_metrics, resource_constraints
            )
            
            # Apply resource adjustments
            adjustment_results = await self._apply_resource_adjustments(
                allocation_plan, active_scans
            )
            
            return {
                "allocation_plan": allocation_plan,
                "adjustments_applied": adjustment_results,
                "resource_utilization": current_metrics,
                "optimization_score": allocation_plan.get("optimization_score", 0.8)
            }
            
        except Exception as e:
            logger.error(f"Failed to manage scan resources: {str(e)}")
            return {"error": str(e)}
    
    async def _resource_monitoring_loop(self):
        """Continuous resource monitoring loop"""
        while True:
            try:
                await self.resource_monitor.update_metrics()
                await self._check_resource_thresholds()
                await asyncio.sleep(30)  # Update every 30 seconds
            except Exception as e:
                logger.error(f"Resource monitoring error: {str(e)}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def _strategy_optimization_loop(self):
        """Continuous strategy optimization loop"""
        while True:
            try:
                await self.strategy_optimizer.update_optimization_models()
                await self._optimize_active_strategies()
                await asyncio.sleep(300)  # Update every 5 minutes
            except Exception as e:
                logger.error(f"Strategy optimization error: {str(e)}")
                await asyncio.sleep(600)  # Wait longer on error
    
    async def _workload_balancing_loop(self):
        """Continuous workload balancing loop"""
        while True:
            try:
                await self.workload_balancer.rebalance_workloads()
                await asyncio.sleep(120)  # Rebalance every 2 minutes
            except Exception as e:
                logger.error(f"Workload balancing error: {str(e)}")
                await asyncio.sleep(300)  # Wait longer on error
    
    async def _create_scan_context(
        self,
        assets: List[DataAsset],
        policies: List[ScanPolicy]
    ) -> ScanContext:
        """Create comprehensive scan context from assets and policies"""
        context = ScanContext()
        
        # Analyze asset characteristics
        for asset in assets:
            context.asset_types.add(asset.asset_type)
            context.data_volumes[asset.id] = getattr(asset, 'data_volume', 0)
            context.schema_complexity[asset.id] = await self._calculate_schema_complexity(asset)
        
        # Analyze policy requirements
        for policy in policies:
            if hasattr(policy, 'compliance_frameworks'):
                context.compliance_requirements.extend(policy.compliance_frameworks)
            context.business_priority = max(context.business_priority, getattr(policy, 'priority', 1))
        
        # Get historical performance data
        context.historical_performance = await self._get_asset_performance_history(assets)
        
        return context
    
    async def _calculate_schema_complexity(self, asset: DataAsset) -> int:
        """Calculate schema complexity score for an asset"""
        try:
            # Mock complexity calculation based on asset metadata
            base_complexity = 1
            
            if hasattr(asset, 'schema') and asset.schema:
                # Count fields, nested objects, relationships
                schema_data = json.loads(asset.schema) if isinstance(asset.schema, str) else asset.schema
                field_count = len(schema_data.get('fields', []))
                nested_count = sum(1 for field in schema_data.get('fields', []) 
                                 if field.get('type') in ['object', 'array'])
                base_complexity = field_count + (nested_count * 2)
            
            return min(base_complexity, 100)  # Cap at 100
            
        except Exception:
            return 5  # Default complexity
    
    def _get_fallback_strategy(self, scan_context: ScanContext) -> ScanStrategy:
        """Generate conservative fallback strategy"""
        return ScanStrategy(
            strategy_type=ScanningStrategy.CONSERVATIVE,
            resource_allocation={"cpu": 0.3, "memory": 0.4, "workers": 2},
            parallelism_level=2,
            batch_size=50,
            scan_depth=3,
            timeout_settings={"scan": 3600, "batch": 300},
            optimization_params={},
            expected_duration=timedelta(hours=2),
            confidence_score=0.6
        )


class ResourceMonitor:
    """Monitors system resources and provides metrics"""
    
    def __init__(self):
        self.current_metrics: Optional[ResourceMetrics] = None
        self.metrics_history: List[ResourceMetrics] = []
    
    async def initialize(self):
        """Initialize resource monitoring"""
        await self.update_metrics()
    
    async def get_current_metrics(self) -> ResourceMetrics:
        """Get current resource metrics"""
        if not self.current_metrics:
            await self.update_metrics()
        return self.current_metrics
    
    async def update_metrics(self):
        """Update current resource metrics"""
        try:
            # Get system metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk_io = psutil.disk_io_counters()
            net_io = psutil.net_io_counters()
            
            # Calculate derived metrics
            disk_io_rate = getattr(disk_io, 'read_bytes', 0) + getattr(disk_io, 'write_bytes', 0)
            net_io_rate = getattr(net_io, 'bytes_sent', 0) + getattr(net_io, 'bytes_recv', 0)
            
            self.current_metrics = ResourceMetrics(
                cpu_usage=cpu_percent,
                memory_usage=memory.percent,
                disk_io=disk_io_rate,
                network_io=net_io_rate,
                available_workers=max(1, psutil.cpu_count() - int(cpu_percent / 25)),
                queue_length=0,  # Will be updated by scan coordinator
                timestamp=datetime.now()
            )
            
            # Store in history (keep last 100 entries)
            self.metrics_history.append(self.current_metrics)
            if len(self.metrics_history) > 100:
                self.metrics_history.pop(0)
                
        except Exception as e:
            logger.error(f"Failed to update resource metrics: {str(e)}")


class ScanStrategyOptimizer:
    """AI-powered scan strategy optimization"""
    
    def __init__(self):
        self.optimization_models = {}
        self.strategy_cache: Dict[str, ScanStrategy] = {}
    
    async def initialize(self):
        """Initialize strategy optimization models"""
        # Initialize ML models for strategy optimization
        pass
    
    async def generate_strategies(
        self,
        scan_context: ScanContext,
        resource_metrics: ResourceMetrics,
        active_workload: Dict[str, Any],
        constraints: Optional[Dict[str, Any]] = None
    ) -> List[ScanStrategy]:
        """Generate multiple strategy options using AI"""
        strategies = []
        
        # Generate adaptive strategy
        adaptive_strategy = await self._generate_adaptive_strategy(
            scan_context, resource_metrics, active_workload
        )
        strategies.append(adaptive_strategy)
        
        # Generate performance-optimized strategy
        performance_strategy = await self._generate_performance_strategy(
            scan_context, resource_metrics
        )
        strategies.append(performance_strategy)
        
        # Generate resource-conservative strategy
        conservative_strategy = await self._generate_conservative_strategy(
            scan_context, resource_metrics
        )
        strategies.append(conservative_strategy)
        
        return strategies
    
    async def _generate_adaptive_strategy(
        self,
        scan_context: ScanContext,
        resource_metrics: ResourceMetrics,
        active_workload: Dict[str, Any]
    ) -> ScanStrategy:
        """Generate adaptive strategy based on current conditions"""
        
        # Calculate optimal resource allocation
        available_cpu = max(0.1, (100 - resource_metrics.cpu_usage) / 100)
        available_memory = max(0.1, (100 - resource_metrics.memory_usage) / 100)
        
        # Determine parallelism based on available workers and workload
        base_parallelism = min(resource_metrics.available_workers, len(scan_context.asset_types) * 2)
        adjusted_parallelism = max(1, int(base_parallelism * available_cpu))
        
        # Calculate batch size based on data volumes
        avg_data_volume = np.mean(list(scan_context.data_volumes.values())) if scan_context.data_volumes else 1000
        batch_size = max(10, min(200, int(math.sqrt(avg_data_volume))))
        
        # Estimate duration based on complexity and resources
        complexity_factor = np.mean(list(scan_context.schema_complexity.values())) if scan_context.schema_complexity else 5
        duration_hours = max(0.5, complexity_factor * len(scan_context.asset_types) / adjusted_parallelism / 10)
        
        return ScanStrategy(
            strategy_type=ScanningStrategy.ADAPTIVE,
            resource_allocation={
                "cpu": min(0.7, available_cpu * 0.8),
                "memory": min(0.6, available_memory * 0.7),
                "workers": adjusted_parallelism
            },
            parallelism_level=adjusted_parallelism,
            batch_size=batch_size,
            scan_depth=5,
            timeout_settings={
                "scan": int(duration_hours * 3600 * 1.5),
                "batch": min(600, int(batch_size * 10))
            },
            optimization_params={
                "adaptive_batching": True,
                "dynamic_resource_adjustment": True,
                "intelligent_retry": True
            },
            expected_duration=timedelta(hours=duration_hours),
            confidence_score=0.85
        )
    
    async def _generate_performance_strategy(
        self,
        scan_context: ScanContext,
        resource_metrics: ResourceMetrics
    ) -> ScanStrategy:
        """Generate performance-optimized strategy"""
        
        # Aggressive resource utilization for maximum performance
        return ScanStrategy(
            strategy_type=ScanningStrategy.AGGRESSIVE,
            resource_allocation={
                "cpu": 0.8,
                "memory": 0.75,
                "workers": resource_metrics.available_workers
            },
            parallelism_level=resource_metrics.available_workers,
            batch_size=max(50, len(scan_context.asset_types) * 5),
            scan_depth=7,
            timeout_settings={"scan": 7200, "batch": 300},
            optimization_params={
                "high_performance_mode": True,
                "aggressive_caching": True,
                "parallel_processing": True
            },
            expected_duration=timedelta(hours=1),
            confidence_score=0.75
        )
    
    async def _generate_conservative_strategy(
        self,
        scan_context: ScanContext,
        resource_metrics: ResourceMetrics
    ) -> ScanStrategy:
        """Generate resource-conservative strategy"""
        
        return ScanStrategy(
            strategy_type=ScanningStrategy.CONSERVATIVE,
            resource_allocation={
                "cpu": 0.3,
                "memory": 0.4,
                "workers": max(1, resource_metrics.available_workers // 3)
            },
            parallelism_level=max(1, resource_metrics.available_workers // 3),
            batch_size=25,
            scan_depth=3,
            timeout_settings={"scan": 10800, "batch": 600},
            optimization_params={
                "conservative_mode": True,
                "resource_throttling": True,
                "gradual_scaling": True
            },
            expected_duration=timedelta(hours=4),
            confidence_score=0.9
        )


class WorkloadBalancer:
    """Intelligent workload balancing and resource allocation"""
    
    def __init__(self):
        self.workload_assignments: Dict[str, Dict[str, Any]] = {}
    
    async def initialize(self):
        """Initialize workload balancer"""
        pass
    
    async def optimize_resource_allocation(
        self,
        scan_requirements: Dict[str, Dict[str, Any]],
        current_metrics: ResourceMetrics,
        constraints: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Optimize resource allocation across multiple scans"""
        
        total_scans = len(scan_requirements)
        if total_scans == 0:
            return {"optimization_score": 1.0, "allocations": {}}
        
        # Calculate base allocation per scan
        base_cpu_per_scan = (100 - current_metrics.cpu_usage) / 100 / total_scans
        base_memory_per_scan = (100 - current_metrics.memory_usage) / 100 / total_scans
        base_workers_per_scan = max(1, current_metrics.available_workers // total_scans)
        
        allocations = {}
        total_priority = sum(req.get("priority", 1) for req in scan_requirements.values())
        
        for scan_id, requirements in scan_requirements.items():
            priority = requirements.get("priority", 1)
            priority_multiplier = priority / total_priority * total_scans
            
            allocations[scan_id] = {
                "cpu_allocation": min(0.8, base_cpu_per_scan * priority_multiplier),
                "memory_allocation": min(0.7, base_memory_per_scan * priority_multiplier),
                "worker_allocation": max(1, int(base_workers_per_scan * priority_multiplier)),
                "priority_score": priority_multiplier
            }
        
        # Calculate optimization score
        resource_efficiency = self._calculate_resource_efficiency(allocations, current_metrics)
        load_balance_score = self._calculate_load_balance_score(allocations)
        optimization_score = (resource_efficiency + load_balance_score) / 2
        
        return {
            "allocations": allocations,
            "optimization_score": optimization_score,
            "resource_efficiency": resource_efficiency,
            "load_balance_score": load_balance_score
        }
    
    async def rebalance_workloads(self):
        """Continuously rebalance workloads based on current conditions"""
        # Implementation for continuous workload rebalancing
        pass
    
    def _calculate_resource_efficiency(
        self,
        allocations: Dict[str, Dict[str, Any]],
        current_metrics: ResourceMetrics
    ) -> float:
        """Calculate resource utilization efficiency"""
        total_cpu_allocated = sum(alloc["cpu_allocation"] for alloc in allocations.values())
        total_memory_allocated = sum(alloc["memory_allocation"] for alloc in allocations.values())
        
        # Efficiency is higher when we use more resources without overallocation
        cpu_efficiency = min(1.0, total_cpu_allocated / 0.8)  # Target 80% max utilization
        memory_efficiency = min(1.0, total_memory_allocated / 0.7)  # Target 70% max utilization
        
        return (cpu_efficiency + memory_efficiency) / 2
    
    def _calculate_load_balance_score(self, allocations: Dict[str, Dict[str, Any]]) -> float:
        """Calculate how well balanced the workload distribution is"""
        if not allocations:
            return 1.0
        
        cpu_allocations = [alloc["cpu_allocation"] for alloc in allocations.values()]
        memory_allocations = [alloc["memory_allocation"] for alloc in allocations.values()]
        
        # Lower standard deviation means better balance
        cpu_std = np.std(cpu_allocations) if len(cpu_allocations) > 1 else 0
        memory_std = np.std(memory_allocations) if len(memory_allocations) > 1 else 0
        
        # Convert to score (lower std = higher score)
        cpu_balance_score = max(0, 1 - cpu_std * 2)
        memory_balance_score = max(0, 1 - memory_std * 2)
        
        return (cpu_balance_score + memory_balance_score) / 2


class PerformancePredictor:
    """AI-powered performance prediction for scan operations"""
    
    def __init__(self):
        self.prediction_models = {}
        self.performance_history: List[Dict[str, Any]] = []
    
    async def initialize(self):
        """Initialize performance prediction models"""
        # Initialize ML models for performance prediction
        pass
    
    async def predict_performance(
        self,
        scan_context: ScanContext,
        strategy: ScanStrategy,
        historical_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Predict scan performance using AI models"""
        
        # Extract features for prediction
        features = self._extract_prediction_features(scan_context, strategy)
        
        # Make predictions using different models
        duration_prediction = await self._predict_duration(features, historical_data)
        resource_prediction = await self._predict_resource_usage(features, historical_data)
        success_prediction = await self._predict_success_probability(features, historical_data)
        
        return {
            "estimated_duration": duration_prediction,
            "resource_usage": resource_prediction,
            "success_probability": success_prediction,
            "confidence": self._calculate_prediction_confidence(features, historical_data),
            "risk_factors": await self._identify_risk_factors(scan_context, strategy)
        }
    
    def _extract_prediction_features(
        self,
        scan_context: ScanContext,
        strategy: ScanStrategy
    ) -> Dict[str, float]:
        """Extract numerical features for ML prediction"""
        
        return {
            "asset_count": len(scan_context.asset_types),
            "total_data_volume": sum(scan_context.data_volumes.values()),
            "avg_schema_complexity": np.mean(list(scan_context.schema_complexity.values())) if scan_context.schema_complexity else 5,
            "parallelism_level": strategy.parallelism_level,
            "batch_size": strategy.batch_size,
            "scan_depth": strategy.scan_depth,
            "cpu_allocation": strategy.resource_allocation.get("cpu", 0.5),
            "memory_allocation": strategy.resource_allocation.get("memory", 0.5),
            "business_priority": scan_context.business_priority,
            "compliance_count": len(scan_context.compliance_requirements)
        }
    
    async def _predict_duration(
        self,
        features: Dict[str, float],
        historical_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Predict scan duration"""
        
        # Simple heuristic-based prediction (can be replaced with ML model)
        base_duration = features["asset_count"] * features["avg_schema_complexity"] * 60  # seconds
        complexity_factor = features["total_data_volume"] / 1000000 if features["total_data_volume"] > 0 else 1
        efficiency_factor = features["parallelism_level"] * features["cpu_allocation"]
        
        estimated_seconds = max(300, base_duration * complexity_factor / max(0.1, efficiency_factor))
        
        return {
            "estimated_seconds": estimated_seconds,
            "estimated_minutes": estimated_seconds / 60,
            "estimated_hours": estimated_seconds / 3600,
            "confidence_range": {
                "min_seconds": estimated_seconds * 0.7,
                "max_seconds": estimated_seconds * 1.5
            }
        }
    
    async def _predict_resource_usage(
        self,
        features: Dict[str, float],
        historical_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Predict resource usage patterns"""
        
        return {
            "peak_cpu_usage": min(95, features["cpu_allocation"] * 100 * 1.2),
            "peak_memory_usage": min(90, features["memory_allocation"] * 100 * 1.1),
            "avg_cpu_usage": features["cpu_allocation"] * 100 * 0.8,
            "avg_memory_usage": features["memory_allocation"] * 100 * 0.7,
            "disk_io_intensity": "medium" if features["total_data_volume"] > 1000000 else "low",
            "network_usage": "low"
        }
    
    async def _predict_success_probability(
        self,
        features: Dict[str, float],
        historical_data: List[Dict[str, Any]]
    ) -> float:
        """Predict probability of successful scan completion"""
        
        # Factor in complexity, resources, and historical success rates
        base_success_rate = 0.9
        
        # Adjust based on complexity
        complexity_penalty = min(0.2, features["avg_schema_complexity"] / 50)
        
        # Adjust based on resource allocation
        resource_bonus = (features["cpu_allocation"] + features["memory_allocation"]) / 2 * 0.1
        
        # Adjust based on data volume
        volume_penalty = min(0.15, features["total_data_volume"] / 10000000)
        
        success_probability = base_success_rate - complexity_penalty + resource_bonus - volume_penalty
        return max(0.5, min(0.99, success_probability))
    
    def _calculate_prediction_confidence(
        self,
        features: Dict[str, float],
        historical_data: List[Dict[str, Any]]
    ) -> float:
        """Calculate confidence in predictions"""
        
        # Higher confidence with more historical data and simpler scans
        base_confidence = 0.7
        
        # Boost confidence with historical data
        history_boost = min(0.2, len(historical_data) / 100)
        
        # Reduce confidence for complex scans
        complexity_penalty = min(0.15, features["avg_schema_complexity"] / 100)
        
        confidence = base_confidence + history_boost - complexity_penalty
        return max(0.5, min(0.95, confidence))


class ScanCoordinator:
    """Coordinates and orchestrates complex scan operations"""
    
    def __init__(self):
        self.active_coordinated_scans: Dict[str, Dict[str, Any]] = {}
    
    async def initialize(self):
        """Initialize scan coordinator"""
        pass
    
    async def execute_coordinated_scan(
        self,
        scan_jobs: List[ScanJob],
        strategy: ScanStrategy
    ) -> Dict[str, Any]:
        """Execute coordinated scan with intelligent orchestration"""
        
        coordination_id = f"coord_{datetime.now().isoformat()}"
        
        try:
            # Phase 1: Preparation and validation
            preparation_results = await self._prepare_coordinated_scan(scan_jobs, strategy)
            
            # Phase 2: Staged execution based on strategy
            execution_results = await self._execute_staged_scan(
                scan_jobs, strategy, coordination_id
            )
            
            # Phase 3: Results aggregation and optimization
            final_results = await self._aggregate_and_optimize_results(
                execution_results, strategy
            )
            
            return {
                "coordination_id": coordination_id,
                "preparation": preparation_results,
                "execution": execution_results,
                "final_results": final_results,
                "strategy_used": strategy.strategy_type,
                "total_duration": execution_results.get("total_duration"),
                "success_rate": final_results.get("success_rate", 0.0)
            }
            
        except Exception as e:
            logger.error(f"Coordinated scan failed: {str(e)}")
            return {"error": str(e), "coordination_id": coordination_id}
    
    async def _prepare_coordinated_scan(
        self,
        scan_jobs: List[ScanJob],
        strategy: ScanStrategy
    ) -> Dict[str, Any]:
        """Prepare coordinated scan execution"""
        
        # Validate scan jobs
        validation_results = await self._validate_scan_jobs(scan_jobs)
        
        # Optimize job ordering
        optimized_order = await self._optimize_job_execution_order(scan_jobs, strategy)
        
        # Prepare resource allocations
        resource_allocations = await self._prepare_resource_allocations(scan_jobs, strategy)
        
        return {
            "validation": validation_results,
            "execution_order": optimized_order,
            "resource_allocations": resource_allocations,
            "preparation_time": datetime.now().isoformat()
        }
    
    async def _execute_staged_scan(
        self,
        scan_jobs: List[ScanJob],
        strategy: ScanStrategy,
        coordination_id: str
    ) -> Dict[str, Any]:
        """Execute scan in coordinated stages"""
        
        start_time = datetime.now()
        stage_results = []
        
        # Group jobs into stages based on strategy
        job_stages = await self._create_execution_stages(scan_jobs, strategy)
        
        for stage_num, stage_jobs in enumerate(job_stages):
            stage_start = datetime.now()
            
            # Execute stage with parallelism control
            stage_result = await self._execute_scan_stage(
                stage_jobs, strategy, f"{coordination_id}_stage_{stage_num}"
            )
            
            stage_duration = (datetime.now() - stage_start).total_seconds()
            stage_result["stage_duration"] = stage_duration
            stage_results.append(stage_result)
            
            # Adaptive strategy adjustment between stages
            if stage_num < len(job_stages) - 1:  # Not the last stage
                strategy = await self._adapt_strategy_between_stages(
                    strategy, stage_result, job_stages[stage_num + 1]
                )
        
        total_duration = (datetime.now() - start_time).total_seconds()
        
        return {
            "stages": stage_results,
            "total_duration": total_duration,
            "coordination_id": coordination_id,
            "adaptive_adjustments": len([s for s in stage_results if s.get("strategy_adjusted")])
        }
    
    async def _execute_scan_stage(
        self,
        stage_jobs: List[ScanJob],
        strategy: ScanStrategy,
        stage_id: str
    ) -> Dict[str, Any]:
        """Execute a single scan stage with controlled parallelism"""
        
        # Create semaphore for parallelism control
        semaphore = asyncio.Semaphore(strategy.parallelism_level)
        
        # Execute jobs concurrently within parallelism limits
        tasks = []
        for job in stage_jobs:
            task = asyncio.create_task(
                self._execute_single_scan_job(job, strategy, semaphore)
            )
            tasks.append(task)
        
        # Wait for all tasks to complete
        job_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Analyze stage results
        successful_jobs = sum(1 for result in job_results if not isinstance(result, Exception))
        failed_jobs = len(job_results) - successful_jobs
        
        return {
            "stage_id": stage_id,
            "total_jobs": len(stage_jobs),
            "successful_jobs": successful_jobs,
            "failed_jobs": failed_jobs,
            "success_rate": successful_jobs / len(stage_jobs) if stage_jobs else 0,
            "job_results": [r for r in job_results if not isinstance(r, Exception)],
            "errors": [str(r) for r in job_results if isinstance(r, Exception)]
        }
    
    async def _execute_single_scan_job(
        self,
        job: ScanJob,
        strategy: ScanStrategy,
        semaphore: asyncio.Semaphore
    ) -> Dict[str, Any]:
        """Execute a single scan job with resource control"""
        
        async with semaphore:
            try:
                job_start = datetime.now()
                
                # Simulate scan job execution (replace with actual scan logic)
                execution_time = await self._simulate_scan_execution(job, strategy)
                
                job_duration = (datetime.now() - job_start).total_seconds()
                
                return {
                    "job_id": job.id,
                    "status": "completed",
                    "duration": job_duration,
                    "estimated_duration": execution_time,
                    "resource_usage": await self._measure_job_resource_usage(job)
                }
                
            except Exception as e:
                return {
                    "job_id": job.id,
                    "status": "failed",
                    "error": str(e),
                    "duration": (datetime.now() - job_start).total_seconds()
                }
    
    async def _simulate_scan_execution(self, job: ScanJob, strategy: ScanStrategy) -> float:
        """Simulate scan execution (replace with actual scan logic)"""
        # Simulate varying execution times based on job complexity
        base_time = 30  # Base 30 seconds
        complexity_factor = strategy.scan_depth * 0.1
        random_factor = np.random.uniform(0.8, 1.2)
        
        execution_time = base_time * (1 + complexity_factor) * random_factor
        await asyncio.sleep(min(5, execution_time / 10))  # Simulate work (capped at 5 seconds)
        
        return execution_time

    async def _analyze_active_workload(self) -> Dict[str, Any]:
        """Analyze current active workload across the system"""
        try:
            async with get_async_session() as session:
                # Get active scan jobs
                active_jobs_result = await session.execute(
                    select(ScanJob).where(
                        ScanJob.status.in_([ScanJobStatus.RUNNING, ScanJobStatus.PENDING])
                    )
                )
                active_jobs = active_jobs_result.scalars().all()
                
                workload_analysis = {
                    "total_active_jobs": len(active_jobs),
                    "job_types": {},
                    "resource_demand": {"cpu": 0, "memory": 0, "workers": 0},
                    "priority_distribution": {},
                    "estimated_completion_times": []
                }
                
                for job in active_jobs:
                    # Count job types
                    job_type = job.job_type.value if job.job_type else "unknown"
                    workload_analysis["job_types"][job_type] = workload_analysis["job_types"].get(job_type, 0) + 1
                    
                    # Estimate resource demand (mock calculation)
                    workload_analysis["resource_demand"]["cpu"] += 0.2
                    workload_analysis["resource_demand"]["memory"] += 0.15
                    workload_analysis["resource_demand"]["workers"] += 1
                    
                    # Track priority distribution
                    priority = job.priority.value if job.priority else "medium"
                    workload_analysis["priority_distribution"][priority] = workload_analysis["priority_distribution"].get(priority, 0) + 1
                
                return workload_analysis
                
        except Exception as e:
            logger.error(f"Failed to analyze active workload: {str(e)}")
            return {"total_active_jobs": 0, "job_types": {}, "resource_demand": {"cpu": 0, "memory": 0, "workers": 0}}
    
    async def _select_optimal_strategy(
        self,
        strategy_options: List[ScanStrategy],
        scan_context: ScanContext,
        resource_metrics: ResourceMetrics
    ) -> ScanStrategy:
        """Select the optimal strategy from available options"""
        if not strategy_options:
            return self._get_fallback_strategy(scan_context)
        
        # Score each strategy based on multiple factors
        strategy_scores = []
        for strategy in strategy_options:
            score = await self._calculate_strategy_score(strategy, scan_context, resource_metrics)
            strategy_scores.append((strategy, score))
        
        # Select strategy with highest score
        best_strategy, best_score = max(strategy_scores, key=lambda x: x[1])
        logger.info(f"Selected strategy {best_strategy.strategy_type} with score {best_score:.3f}")
        
        return best_strategy
    
    async def _calculate_strategy_score(
        self,
        strategy: ScanStrategy,
        scan_context: ScanContext,
        resource_metrics: ResourceMetrics
    ) -> float:
        """Calculate comprehensive score for a strategy"""
        # Performance score (higher parallelism and resource allocation = better)
        performance_score = (
            strategy.parallelism_level / 10 +
            strategy.resource_allocation.get("cpu", 0) +
            strategy.resource_allocation.get("memory", 0)
        ) / 3
        
        # Resource efficiency score (avoid overallocation)
        cpu_efficiency = min(1.0, strategy.resource_allocation.get("cpu", 0) / max(0.1, (100 - resource_metrics.cpu_usage) / 100))
        memory_efficiency = min(1.0, strategy.resource_allocation.get("memory", 0) / max(0.1, (100 - resource_metrics.memory_usage) / 100))
        resource_score = (cpu_efficiency + memory_efficiency) / 2
        
        # Risk score (lower risk = higher score)
        risk_factors = len(scan_context.compliance_requirements) * 0.1 + sum(scan_context.schema_complexity.values()) * 0.01
        risk_score = max(0, 1 - risk_factors / 10)
        
        # Confidence score from the strategy itself
        confidence_score = strategy.confidence_score
        
        # Weighted final score
        final_score = (
            performance_score * 0.3 +
            resource_score * 0.3 +
            risk_score * 0.2 +
            confidence_score * 0.2
        )
        
        return final_score
    
    async def _validate_strategy(
        self,
        strategy: ScanStrategy,
        resource_metrics: ResourceMetrics
    ) -> ScanStrategy:
        """Validate and adjust strategy if needed"""
        # Check resource constraints
        max_cpu = (100 - resource_metrics.cpu_usage) / 100
        max_memory = (100 - resource_metrics.memory_usage) / 100
        max_workers = resource_metrics.available_workers
        
        # Adjust if exceeding limits
        adjusted_strategy = ScanStrategy(
            strategy_type=strategy.strategy_type,
            resource_allocation={
                "cpu": min(strategy.resource_allocation.get("cpu", 0), max_cpu),
                "memory": min(strategy.resource_allocation.get("memory", 0), max_memory),
                "workers": min(strategy.resource_allocation.get("workers", 1), max_workers)
            },
            parallelism_level=min(strategy.parallelism_level, max_workers),
            batch_size=strategy.batch_size,
            scan_depth=strategy.scan_depth,
            timeout_settings=strategy.timeout_settings,
            optimization_params=strategy.optimization_params,
            expected_duration=strategy.expected_duration,
            confidence_score=strategy.confidence_score * 0.9 if (
                strategy.resource_allocation.get("cpu", 0) > max_cpu or
                strategy.resource_allocation.get("memory", 0) > max_memory
            ) else strategy.confidence_score
        )
        
        return adjusted_strategy
    
    async def _create_scan_jobs(
        self,
        assets: List[DataAsset],
        policies: List[ScanPolicy],
        strategy: ScanStrategy,
        scan_id: str
    ) -> List[ScanJob]:
        """Create scan jobs based on assets, policies, and strategy"""
        scan_jobs = []
        
        try:
            async with get_async_session() as session:
                for i, asset in enumerate(assets):
                    # Create scan job for each asset
                    job = ScanJob(
                        id=f"{scan_id}_job_{i}",
                        asset_id=asset.id,
                        job_type=ScanJobType.FULL_SCAN,
                        status=ScanJobStatus.PENDING,
                        priority=ScanJobPriority.MEDIUM,
                        configuration={
                            "scan_depth": strategy.scan_depth,
                            "batch_size": strategy.batch_size,
                            "timeout": strategy.timeout_settings.get("scan", 3600),
                            "policies": [p.id for p in policies if hasattr(p, 'id')]
                        },
                        created_at=datetime.now(),
                        updated_at=datetime.now()
                    )
                    
                    scan_jobs.append(job)
                    session.add(job)
                
                await session.commit()
                
        except Exception as e:
            logger.error(f"Failed to create scan jobs: {str(e)}")
            raise
        
        return scan_jobs
    
    async def _monitor_and_adapt_execution(
        self,
        scan_id: str,
        execution_results: Dict[str, Any],
        strategy: ScanStrategy
    ) -> Dict[str, Any]:
        """Monitor execution and adapt as needed"""
        try:
            # Analyze execution performance
            performance_analysis = await self._analyze_execution_performance(execution_results)
            
            # Generate insights and recommendations
            insights = await self._generate_execution_insights(performance_analysis, strategy)
            
            # Apply any real-time optimizations
            optimizations = await self._apply_runtime_optimizations(scan_id, performance_analysis)
            
            return {
                "scan_id": scan_id,
                "execution_results": execution_results,
                "performance_analysis": performance_analysis,
                "insights": insights,
                "optimizations_applied": optimizations,
                "final_status": "completed"
            }
            
        except Exception as e:
            logger.error(f"Failed to monitor and adapt execution: {str(e)}")
            return {"error": str(e), "scan_id": scan_id}
    
    async def _analyze_execution_performance(self, execution_results: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the performance of scan execution"""
        stages = execution_results.get("stages", [])
        total_duration = execution_results.get("total_duration", 0)
        
        if not stages:
            return {"error": "No stages found in execution results"}
        
        # Calculate performance metrics
        total_jobs = sum(stage.get("total_jobs", 0) for stage in stages)
        successful_jobs = sum(stage.get("successful_jobs", 0) for stage in stages)
        failed_jobs = sum(stage.get("failed_jobs", 0) for stage in stages)
        
        overall_success_rate = successful_jobs / total_jobs if total_jobs > 0 else 0
        average_stage_duration = np.mean([stage.get("stage_duration", 0) for stage in stages])
        
        # Identify bottlenecks
        bottlenecks = []
        stage_durations = [stage.get("stage_duration", 0) for stage in stages]
        if stage_durations:
            max_duration = max(stage_durations)
            avg_duration = np.mean(stage_durations)
            
            for i, duration in enumerate(stage_durations):
                if duration > avg_duration * 1.5:
                    bottlenecks.append({
                        "stage_index": i,
                        "duration": duration,
                        "deviation_factor": duration / avg_duration
                    })
        
        return {
            "total_jobs": total_jobs,
            "successful_jobs": successful_jobs,
            "failed_jobs": failed_jobs,
            "overall_success_rate": overall_success_rate,
            "total_duration": total_duration,
            "average_stage_duration": average_stage_duration,
            "bottlenecks": bottlenecks,
            "performance_rating": self._calculate_performance_rating(overall_success_rate, total_duration, len(bottlenecks))
        }
    
    def _calculate_performance_rating(self, success_rate: float, duration: float, bottleneck_count: int) -> str:
        """Calculate overall performance rating"""
        # Base score from success rate
        score = success_rate * 100
        
        # Penalty for long duration (assuming 1 hour is baseline)
        if duration > 3600:
            score -= min(20, (duration - 3600) / 3600 * 10)
        
        # Penalty for bottlenecks
        score -= bottleneck_count * 5
        
        if score >= 90:
            return "excellent"
        elif score >= 80:
            return "good"
        elif score >= 70:
            return "fair"
        elif score >= 60:
            return "poor"
        else:
            return "critical"
    
    async def _generate_execution_insights(
        self,
        performance_analysis: Dict[str, Any],
        strategy: ScanStrategy
    ) -> List[Dict[str, Any]]:
        """Generate insights and recommendations from execution analysis"""
        insights = []
        
        # Success rate insight
        success_rate = performance_analysis.get("overall_success_rate", 0)
        if success_rate < 0.8:
            insights.append({
                "type": "warning",
                "category": "success_rate",
                "message": f"Low success rate ({success_rate:.1%}). Consider reducing parallelism or increasing timeouts.",
                "recommendation": "Adjust strategy to be more conservative"
            })
        elif success_rate > 0.95:
            insights.append({
                "type": "success",
                "category": "success_rate",
                "message": f"Excellent success rate ({success_rate:.1%}). Strategy is well-optimized.",
                "recommendation": "Current strategy is performing well"
            })
        
        # Duration insight
        total_duration = performance_analysis.get("total_duration", 0)
        expected_duration = strategy.expected_duration.total_seconds()
        duration_ratio = total_duration / expected_duration if expected_duration > 0 else 1
        
        if duration_ratio > 1.5:
            insights.append({
                "type": "warning",
                "category": "duration",
                "message": f"Execution took {duration_ratio:.1f}x longer than expected.",
                "recommendation": "Consider increasing resource allocation or optimizing scan depth"
            })
        elif duration_ratio < 0.7:
            insights.append({
                "type": "info",
                "category": "duration",
                "message": f"Execution completed {1/duration_ratio:.1f}x faster than expected.",
                "recommendation": "Strategy may be over-resourced, consider optimizing for efficiency"
            })
        
        # Bottleneck insights
        bottlenecks = performance_analysis.get("bottlenecks", [])
        if bottlenecks:
            insights.append({
                "type": "warning",
                "category": "bottlenecks",
                "message": f"Found {len(bottlenecks)} bottleneck stages.",
                "recommendation": "Analyze bottleneck stages for resource constraints or data complexity issues"
            })
        
        return insights
    
    async def _apply_runtime_optimizations(
        self,
        scan_id: str,
        performance_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Apply runtime optimizations based on performance analysis"""
        optimizations = []
        
        # Check if we can apply immediate optimizations
        success_rate = performance_analysis.get("overall_success_rate", 1.0)
        bottlenecks = performance_analysis.get("bottlenecks", [])
        
        if success_rate < 0.9 and len(bottlenecks) > 0:
            # Reduce parallelism for future similar scans
            optimization = {
                "type": "strategy_adjustment",
                "action": "reduce_parallelism",
                "reason": "High failure rate with bottlenecks detected",
                "applied_at": datetime.now().isoformat()
            }
            optimizations.append(optimization)
        
        if len(bottlenecks) == 0 and success_rate > 0.95:
            # Increase parallelism for future similar scans
            optimization = {
                "type": "strategy_adjustment",
                "action": "increase_parallelism",
                "reason": "Excellent performance with no bottlenecks",
                "applied_at": datetime.now().isoformat()
            }
            optimizations.append(optimization)
        
        return optimizations
    
    async def _get_historical_performance_data(self, scan_context: ScanContext) -> List[Dict[str, Any]]:
        """Get historical performance data for similar scans"""
        try:
            # Mock historical data retrieval (replace with actual database query)
            historical_data = []
            
            # Simulate some historical data points
            for i in range(10):
                historical_data.append({
                    "asset_count": len(scan_context.asset_types) + np.random.randint(-2, 3),
                    "duration_seconds": 1800 + np.random.randint(-600, 600),
                    "success_rate": 0.85 + np.random.uniform(-0.15, 0.15),
                    "resource_usage": {
                        "cpu": 0.4 + np.random.uniform(-0.2, 0.3),
                        "memory": 0.3 + np.random.uniform(-0.1, 0.2)
                    }
                })
            
            return historical_data
            
        except Exception as e:
            logger.error(f"Failed to get historical performance data: {str(e)}")
            return []
    
    async def _generate_performance_insights(
        self,
        predictions: Dict[str, Any],
        scan_context: ScanContext,
        strategy: ScanStrategy
    ) -> List[str]:
        """Generate performance insights from predictions"""
        insights = []
        
        estimated_duration = predictions.get("estimated_duration", {})
        resource_usage = predictions.get("resource_usage", {})
        success_probability = predictions.get("success_probability", 0.8)
        
        # Duration insights
        hours = estimated_duration.get("estimated_hours", 0)
        if hours > 4:
            insights.append(f"Long scan duration expected ({hours:.1f} hours). Consider breaking into smaller batches.")
        elif hours < 0.5:
            insights.append(f"Quick scan expected ({hours*60:.0f} minutes). Resources may be over-allocated.")
        
        # Resource insights
        peak_cpu = resource_usage.get("peak_cpu_usage", 0)
        if peak_cpu > 80:
            insights.append(f"High CPU usage expected ({peak_cpu:.0f}%). Monitor for system impact.")
        
        # Success probability insights
        if success_probability < 0.8:
            insights.append(f"Lower success probability ({success_probability:.1%}). Consider more conservative settings.")
        
        return insights
    
    async def _identify_risk_factors(
        self,
        scan_context: ScanContext,
        strategy: ScanStrategy
    ) -> List[Dict[str, Any]]:
        """Identify potential risk factors for the scan"""
        risk_factors = []
        
        # High complexity risk
        if scan_context.schema_complexity:
            max_complexity = max(scan_context.schema_complexity.values())
            if max_complexity > 50:
                risk_factors.append({
                    "type": "high_complexity",
                    "severity": "medium",
                    "description": f"Complex schema detected (complexity: {max_complexity})",
                    "mitigation": "Consider reducing scan depth or increasing timeouts"
                })
        
        # Large data volume risk
        if scan_context.data_volumes:
            total_volume = sum(scan_context.data_volumes.values())
            if total_volume > 10000000:  # 10M+ records
                risk_factors.append({
                    "type": "large_volume",
                    "severity": "high",
                    "description": f"Large data volume detected ({total_volume:,} records)",
                    "mitigation": "Use larger batch sizes and ensure adequate resources"
                })
        
        # Resource constraint risk
        cpu_allocation = strategy.resource_allocation.get("cpu", 0)
        if cpu_allocation > 0.7:
            risk_factors.append({
                "type": "high_resource_usage",
                "severity": "medium",
                "description": f"High CPU allocation ({cpu_allocation:.1%})",
                "mitigation": "Monitor system performance and reduce if necessary"
            })
        
        return risk_factors
    
    async def _analyze_scan_requirements(self, active_scans: List[str]) -> Dict[str, Dict[str, Any]]:
        """Analyze resource requirements for active scans"""
        requirements = {}
        
        try:
            async with get_async_session() as session:
                for scan_id in active_scans:
                    # Get scan job details
                    job_result = await session.execute(
                        select(ScanJob).where(ScanJob.id.like(f"{scan_id}%"))
                    )
                    jobs = job_result.scalars().all()
                    
                    if jobs:
                        # Analyze requirements based on job configuration
                        total_jobs = len(jobs)
                        avg_complexity = 5  # Default complexity
                        priority = 1  # Default priority
                        
                        requirements[scan_id] = {
                            "job_count": total_jobs,
                            "estimated_cpu": min(0.8, total_jobs * 0.1),
                            "estimated_memory": min(0.6, total_jobs * 0.08),
                            "estimated_workers": min(8, total_jobs),
                            "priority": priority,
                            "complexity": avg_complexity
                        }
                
        except Exception as e:
            logger.error(f"Failed to analyze scan requirements: {str(e)}")
        
        return requirements
    
    async def _apply_resource_adjustments(
        self,
        allocation_plan: Dict[str, Any],
        active_scans: List[str]
    ) -> Dict[str, Any]:
        """Apply resource adjustments based on allocation plan"""
        adjustments = {
            "successful_adjustments": [],
            "failed_adjustments": [],
            "total_adjustments": 0
        }
        
        allocations = allocation_plan.get("allocations", {})
        
        for scan_id, allocation in allocations.items():
            if scan_id in active_scans:
                try:
                    # Mock resource adjustment (replace with actual implementation)
                    adjustment = {
                        "scan_id": scan_id,
                        "cpu_adjustment": allocation.get("cpu_allocation", 0),
                        "memory_adjustment": allocation.get("memory_allocation", 0),
                        "worker_adjustment": allocation.get("worker_allocation", 1),
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    # Simulate successful adjustment
                    adjustments["successful_adjustments"].append(adjustment)
                    adjustments["total_adjustments"] += 1
                    
                except Exception as e:
                    adjustments["failed_adjustments"].append({
                        "scan_id": scan_id,
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    })
        
        return adjustments
    
    async def _check_resource_thresholds(self):
        """Check if resource usage exceeds thresholds and take action"""
        try:
            metrics = await self.resource_monitor.get_current_metrics()
            
            # Check CPU threshold
            if metrics.cpu_usage > 90:
                logger.warning(f"High CPU usage detected: {metrics.cpu_usage:.1f}%")
                await self._handle_high_resource_usage("cpu", metrics.cpu_usage)
            
            # Check memory threshold
            if metrics.memory_usage > 85:
                logger.warning(f"High memory usage detected: {metrics.memory_usage:.1f}%")
                await self._handle_high_resource_usage("memory", metrics.memory_usage)
                
        except Exception as e:
            logger.error(f"Failed to check resource thresholds: {str(e)}")
    
    async def _handle_high_resource_usage(self, resource_type: str, usage_level: float):
        """Handle high resource usage by adjusting active scans"""
        try:
            # Get active scans that can be throttled
            throttable_scans = list(self.active_scans.keys())
            
            if throttable_scans:
                # Reduce resource allocation for active scans
                reduction_factor = min(0.5, (usage_level - 80) / 20)  # Reduce by up to 50%
                
                for scan_id in throttable_scans[:3]:  # Throttle up to 3 scans
                    logger.info(f"Throttling scan {scan_id} due to high {resource_type} usage")
                    # Mock throttling implementation
                    
        except Exception as e:
            logger.error(f"Failed to handle high resource usage: {str(e)}")
    
    async def _optimize_active_strategies(self):
        """Optimize strategies for currently active scans"""
        try:
            for scan_id, scan_job in self.active_scans.items():
                # Check if scan can be optimized
                current_metrics = await self.resource_monitor.get_current_metrics()
                
                # Mock optimization logic
                if current_metrics.cpu_usage < 50 and current_metrics.memory_usage < 50:
                    # Can potentially increase resource allocation
                    logger.info(f"Considering resource increase for scan {scan_id}")
                elif current_metrics.cpu_usage > 80 or current_metrics.memory_usage > 80:
                    # Should reduce resource allocation
                    logger.info(f"Considering resource reduction for scan {scan_id}")
                    
        except Exception as e:
            logger.error(f"Failed to optimize active strategies: {str(e)}")
    
    async def _get_asset_performance_history(self, assets: List[DataAsset]) -> Dict[str, float]:
        """Get historical performance data for assets"""
        performance_history = {}
        
        for asset in assets:
            # Mock performance history (replace with actual database query)
            base_performance = 1.0
            complexity_factor = 0.1 if hasattr(asset, 'schema') and asset.schema else 0
            
            performance_history[asset.id] = max(0.1, base_performance - complexity_factor)
        
        return performance_history


# Additional supporting classes for ScanCoordinator

    async def _validate_scan_jobs(self, scan_jobs: List[ScanJob]) -> Dict[str, Any]:
        """Validate scan jobs before execution"""
        validation_results = {
            "total_jobs": len(scan_jobs),
            "valid_jobs": 0,
            "invalid_jobs": 0,
            "validation_errors": []
        }
        
        for job in scan_jobs:
            try:
                # Basic validation
                if not job.asset_id:
                    validation_results["validation_errors"].append({
                        "job_id": job.id,
                        "error": "Missing asset_id"
                    })
                    validation_results["invalid_jobs"] += 1
                    continue
                
                if not job.job_type:
                    validation_results["validation_errors"].append({
                        "job_id": job.id,
                        "error": "Missing job_type"
                    })
                    validation_results["invalid_jobs"] += 1
                    continue
                
                validation_results["valid_jobs"] += 1
                
            except Exception as e:
                validation_results["validation_errors"].append({
                    "job_id": getattr(job, 'id', 'unknown'),
                    "error": str(e)
                })
                validation_results["invalid_jobs"] += 1
        
        return validation_results
    
    async def _optimize_job_execution_order(
        self,
        scan_jobs: List[ScanJob],
        strategy: ScanStrategy
    ) -> List[str]:
        """Optimize the order of job execution"""
        # Sort jobs by priority and complexity
        job_priorities = []
        
        for job in scan_jobs:
            priority_score = 1  # Default priority
            if hasattr(job, 'priority'):
                priority_map = {
                    ScanJobPriority.LOW: 1,
                    ScanJobPriority.MEDIUM: 2,
                    ScanJobPriority.HIGH: 3,
                    ScanJobPriority.CRITICAL: 4
                }
                priority_score = priority_map.get(job.priority, 2)
            
            # Add complexity factor
            complexity_score = 1
            if hasattr(job, 'configuration') and job.configuration:
                complexity_score = job.configuration.get('scan_depth', 1)
            
            job_priorities.append((job.id, priority_score * 10 - complexity_score))
        
        # Sort by combined score (higher priority, lower complexity first)
        job_priorities.sort(key=lambda x: x[1], reverse=True)
        
        return [job_id for job_id, _ in job_priorities]
    
    async def _prepare_resource_allocations(
        self,
        scan_jobs: List[ScanJob],
        strategy: ScanStrategy
    ) -> Dict[str, Dict[str, Any]]:
        """Prepare resource allocations for scan jobs"""
        allocations = {}
        total_jobs = len(scan_jobs)
        
        if total_jobs == 0:
            return allocations
        
        # Distribute resources among jobs
        cpu_per_job = strategy.resource_allocation.get("cpu", 0.5) / total_jobs
        memory_per_job = strategy.resource_allocation.get("memory", 0.4) / total_jobs
        workers_per_job = max(1, strategy.resource_allocation.get("workers", 2) // total_jobs)
        
        for job in scan_jobs:
            allocations[job.id] = {
                "cpu_allocation": min(0.8, cpu_per_job),
                "memory_allocation": min(0.6, memory_per_job),
                "worker_allocation": workers_per_job,
                "timeout": strategy.timeout_settings.get("scan", 3600)
            }
        
        return allocations
    
    async def _create_execution_stages(
        self,
        scan_jobs: List[ScanJob],
        strategy: ScanStrategy
    ) -> List[List[ScanJob]]:
        """Create execution stages based on strategy and job characteristics"""
        if not scan_jobs:
            return []
        
        # For adaptive strategy, create balanced stages
        if strategy.strategy_type == ScanningStrategy.ADAPTIVE:
            stage_size = max(1, min(strategy.parallelism_level, len(scan_jobs) // 3))
        elif strategy.strategy_type == ScanningStrategy.AGGRESSIVE:
            stage_size = strategy.parallelism_level
        else:  # Conservative
            stage_size = max(1, strategy.parallelism_level // 2)
        
        stages = []
        for i in range(0, len(scan_jobs), stage_size):
            stage_jobs = scan_jobs[i:i + stage_size]
            stages.append(stage_jobs)
        
        return stages
    
    async def _adapt_strategy_between_stages(
        self,
        current_strategy: ScanStrategy,
        stage_result: Dict[str, Any],
        next_stage_jobs: List[ScanJob]
    ) -> ScanStrategy:
        """Adapt strategy between execution stages based on results"""
        try:
            success_rate = stage_result.get("success_rate", 1.0)
            stage_duration = stage_result.get("stage_duration", 0)
            
            # Create adapted strategy
            adapted_strategy = ScanStrategy(
                strategy_type=current_strategy.strategy_type,
                resource_allocation=current_strategy.resource_allocation.copy(),
                parallelism_level=current_strategy.parallelism_level,
                batch_size=current_strategy.batch_size,
                scan_depth=current_strategy.scan_depth,
                timeout_settings=current_strategy.timeout_settings.copy(),
                optimization_params=current_strategy.optimization_params.copy(),
                expected_duration=current_strategy.expected_duration,
                confidence_score=current_strategy.confidence_score
            )
            
            # Adjust based on stage performance
            if success_rate < 0.8:
                # Reduce parallelism and increase timeouts
                adapted_strategy.parallelism_level = max(1, adapted_strategy.parallelism_level // 2)
                adapted_strategy.timeout_settings["scan"] = int(adapted_strategy.timeout_settings.get("scan", 3600) * 1.5)
                adapted_strategy.confidence_score *= 0.9
                
            elif success_rate > 0.95 and stage_duration < current_strategy.expected_duration.total_seconds() / 4:
                # Can potentially increase parallelism
                current_metrics = await self.resource_monitor.get_current_metrics()
                if current_metrics.cpu_usage < 60 and current_metrics.memory_usage < 60:
                    adapted_strategy.parallelism_level = min(
                        current_metrics.available_workers,
                        adapted_strategy.parallelism_level + 1
                    )
            
            return adapted_strategy
            
        except Exception as e:
            logger.error(f"Failed to adapt strategy between stages: {str(e)}")
            return current_strategy
    
    async def _aggregate_and_optimize_results(
        self,
        execution_results: Dict[str, Any],
        strategy: ScanStrategy
    ) -> Dict[str, Any]:
        """Aggregate and optimize final results"""
        try:
            stages = execution_results.get("stages", [])
            total_duration = execution_results.get("total_duration", 0)
            
            # Aggregate metrics
            total_jobs = sum(stage.get("total_jobs", 0) for stage in stages)
            successful_jobs = sum(stage.get("successful_jobs", 0) for stage in stages)
            failed_jobs = sum(stage.get("failed_jobs", 0) for stage in stages)
            
            # Calculate performance metrics
            success_rate = successful_jobs / total_jobs if total_jobs > 0 else 0
            jobs_per_second = total_jobs / total_duration if total_duration > 0 else 0
            
            # Collect all job results
            all_job_results = []
            all_errors = []
            
            for stage in stages:
                all_job_results.extend(stage.get("job_results", []))
                all_errors.extend(stage.get("errors", []))
            
            # Generate final insights
            final_insights = await self._generate_final_insights(
                success_rate, total_duration, strategy, len(all_errors)
            )
            
            return {
                "summary": {
                    "total_jobs": total_jobs,
                    "successful_jobs": successful_jobs,
                    "failed_jobs": failed_jobs,
                    "success_rate": success_rate,
                    "total_duration": total_duration,
                    "jobs_per_second": jobs_per_second
                },
                "job_results": all_job_results,
                "errors": all_errors,
                "insights": final_insights,
                "strategy_effectiveness": self._calculate_strategy_effectiveness(
                    success_rate, total_duration, strategy
                )
            }
            
        except Exception as e:
            logger.error(f"Failed to aggregate and optimize results: {str(e)}")
            return {"error": str(e)}
    
    async def _generate_final_insights(
        self,
        success_rate: float,
        total_duration: float,
        strategy: ScanStrategy,
        error_count: int
    ) -> List[str]:
        """Generate final insights from scan execution"""
        insights = []
        
        # Success rate insights
        if success_rate >= 0.95:
            insights.append(f"Excellent execution with {success_rate:.1%} success rate")
        elif success_rate >= 0.8:
            insights.append(f"Good execution with {success_rate:.1%} success rate")
        else:
            insights.append(f"Execution issues detected - {success_rate:.1%} success rate with {error_count} errors")
        
        # Duration insights
        expected_seconds = strategy.expected_duration.total_seconds()
        if total_duration < expected_seconds * 0.8:
            insights.append(f"Completed faster than expected ({total_duration/3600:.1f}h vs {expected_seconds/3600:.1f}h)")
        elif total_duration > expected_seconds * 1.2:
            insights.append(f"Took longer than expected ({total_duration/3600:.1f}h vs {expected_seconds/3600:.1f}h)")
        
        # Strategy insights
        insights.append(f"Strategy '{strategy.strategy_type}' with {strategy.parallelism_level} parallel workers")
        
        return insights
    
    def _calculate_strategy_effectiveness(
        self,
        success_rate: float,
        actual_duration: float,
        strategy: ScanStrategy
    ) -> Dict[str, Any]:
        """Calculate how effective the chosen strategy was"""
        expected_duration = strategy.expected_duration.total_seconds()
        
        # Duration effectiveness (1.0 = perfect, <1.0 = slower, >1.0 = faster)
        duration_effectiveness = expected_duration / actual_duration if actual_duration > 0 else 0
        
        # Success effectiveness (1.0 = perfect success rate)
        success_effectiveness = success_rate
        
        # Confidence accuracy (how well our confidence matched reality)
        confidence_accuracy = 1.0 - abs(strategy.confidence_score - success_rate)
        
        # Overall effectiveness
        overall_effectiveness = (
            duration_effectiveness * 0.3 +
            success_effectiveness * 0.5 +
            confidence_accuracy * 0.2
        )
        
        return {
            "overall_score": overall_effectiveness,
            "duration_effectiveness": duration_effectiveness,
            "success_effectiveness": success_effectiveness,
            "confidence_accuracy": confidence_accuracy,
            "rating": "excellent" if overall_effectiveness > 0.9 else
                     "good" if overall_effectiveness > 0.8 else
                     "fair" if overall_effectiveness > 0.7 else "poor"
        }
    
    async def _measure_job_resource_usage(self, job: ScanJob) -> Dict[str, Any]:
        """Measure resource usage for a specific job"""
        # Mock resource usage measurement (replace with actual monitoring)
        return {
            "cpu_usage": np.random.uniform(20, 60),
            "memory_usage": np.random.uniform(15, 45),
            "disk_io": np.random.uniform(100, 500),
            "network_io": np.random.uniform(50, 200),
            "duration": np.random.uniform(30, 300)
        }


# Add missing methods to ScanStrategyOptimizer
ScanStrategyOptimizer.update_optimization_models = lambda self: asyncio.sleep(0.1)  # Mock implementation

# Add missing methods to WorkloadBalancer  
async def rebalance_workloads_impl(self):
    """Continuously rebalance workloads based on current conditions"""
    # Mock rebalancing logic
    pass

WorkloadBalancer.rebalance_workloads = rebalance_workloads_impl