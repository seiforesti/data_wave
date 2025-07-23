"""
🎯 ENTERPRISE SCAN ORCHESTRATOR
Core orchestration engine that coordinates all scanning activities across the entire 
data governance ecosystem with advanced AI/ML integration, real-time monitoring, 
and comprehensive workflow management.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from uuid import UUID, uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_
from sqlalchemy.orm import selectinload
import json
import aiohttp
from concurrent.futures import ThreadPoolExecutor, as_completed
import numpy as np
from dataclasses import dataclass
from enum import Enum
import websockets
from contextlib import asynccontextmanager

# Import all the models we need
from ..models.scan_workflow_models import (
    ScanWorkflow, WorkflowExecution, StepExecution, WorkflowStep,
    WorkflowStatus, StepStatus, WorkflowType, ExecutionMode, WorkflowPriority
)
from ..models.scan_orchestration_models import (
    ScanRuleOrchestration, OrchestrationJob, RuleExecutionTracking,
    ResourceAllocation, WorkflowStateManagement, PerformanceMetrics,
    OrchestrationTemplate, OrchestrationStatus, ResourceType, ExecutionStrategy
)
from ..models.advanced_scan_rule_models import (
    AdvancedScanRule, RuleExecutionHistory, RuleOptimizationSession,
    RuleValidationTest, RulePerformanceAnalytics, RuleType, ComplexityLevel
)
from ..models.scan_performance_models import (
    ScanPerformanceProfile, PerformanceMetric, PerformanceAnalysis,
    PerformanceAlert, PerformanceMetricType, PerformanceLevel
)
from ..models.advanced_catalog_models import AdvancedCatalogEntry
from ..models.data_lineage_models import DataLineagePath

# Import existing services for integration
from .realtime_scan_monitor import RealtimeScanMonitor
from .scan_performance_service import ScanPerformanceService
from .rule_optimization_service import RuleOptimizationService

logger = logging.getLogger(__name__)

@dataclass
class OrchestrationContext:
    """Context information for orchestration operations"""
    orchestration_id: str
    user_id: str
    priority: WorkflowPriority
    resource_constraints: Dict[str, Any]
    business_context: Dict[str, Any]
    compliance_requirements: List[str]
    performance_targets: Dict[str, float]

@dataclass
class ExecutionPlan:
    """Comprehensive execution plan for scan operations"""
    plan_id: str
    workflow_ids: List[str]
    execution_order: List[str]
    resource_allocation: Dict[str, Any]
    estimated_duration: int
    risk_assessment: Dict[str, Any]
    contingency_plans: List[Dict[str, Any]]

class ResourceOptimizationType(str, Enum):
    """Types of resource optimization strategies"""
    LOAD_BALANCING = "load_balancing"
    PRIORITY_SCHEDULING = "priority_scheduling"
    RESOURCE_POOLING = "resource_pooling"
    DYNAMIC_SCALING = "dynamic_scaling"
    COST_OPTIMIZATION = "cost_optimization"

class OrchestrationMode(str, Enum):
    """Modes of orchestration operation"""
    AUTONOMOUS = "autonomous"
    SUPERVISED = "supervised"
    MANUAL = "manual"
    HYBRID = "hybrid"

class EnterpriseScanOrchestrator:
    """
    Enterprise-grade scan orchestrator that manages the complete lifecycle
    of scanning operations across all data sources and systems.
    """
    
    def __init__(
        self,
        db_session: AsyncSession,
        realtime_monitor: RealtimeScanMonitor,
        performance_service: ScanPerformanceService,
        optimization_service: RuleOptimizationService,
        websocket_manager: Any = None,
        thread_pool_size: int = 20
    ):
        self.db = db_session
        self.realtime_monitor = realtime_monitor
        self.performance_service = performance_service
        self.optimization_service = optimization_service
        self.websocket_manager = websocket_manager
        self.thread_pool = ThreadPoolExecutor(max_workers=thread_pool_size)
        
        # Advanced orchestration state
        self.active_orchestrations: Dict[str, OrchestrationContext] = {}
        self.resource_pools: Dict[str, Dict[str, Any]] = {}
        self.performance_baselines: Dict[str, Dict[str, float]] = {}
        self.ai_optimization_models: Dict[str, Any] = {}
        
        # Real-time monitoring and alerting
        self.alert_thresholds = {
            "cpu_utilization": 85.0,
            "memory_usage": 90.0,
            "error_rate": 5.0,
            "queue_size": 1000,
            "response_time": 30000  # milliseconds
        }
        
        # Initialize subsystems
        self._initialize_orchestration_engine()
    
    def _initialize_orchestration_engine(self):
        """Initialize the orchestration engine with advanced capabilities"""
        logger.info("Initializing Enterprise Scan Orchestrator...")
        
        # Initialize resource pools
        self.resource_pools = {
            "compute": {"available": 100, "allocated": 0, "reserved": 0},
            "memory": {"available": 32000, "allocated": 0, "reserved": 0},  # MB
            "network": {"available": 1000, "allocated": 0, "reserved": 0},  # Mbps
            "storage": {"available": 10000, "allocated": 0, "reserved": 0}  # GB
        }
        
        # Initialize AI optimization models (placeholders for ML models)
        self.ai_optimization_models = {
            "resource_predictor": None,  # Will load trained models
            "performance_optimizer": None,
            "bottleneck_detector": None,
            "cost_optimizer": None
        }
        
        logger.info("Enterprise Scan Orchestrator initialized successfully")

    # ================================================================
    # CORE ORCHESTRATION METHODS
    # ================================================================

    async def create_orchestration_plan(
        self,
        scan_requests: List[Dict[str, Any]],
        context: OrchestrationContext,
        optimization_strategy: ResourceOptimizationType = ResourceOptimizationType.LOAD_BALANCING
    ) -> ExecutionPlan:
        """
        Create a comprehensive orchestration plan for multiple scan operations
        with advanced resource optimization and risk assessment.
        """
        try:
            plan_id = f"plan_{uuid4().hex[:12]}"
            logger.info(f"Creating orchestration plan {plan_id} for {len(scan_requests)} scan requests")
            
            # Step 1: Analyze scan requests and dependencies
            analysis_result = await self._analyze_scan_requests(scan_requests, context)
            
            # Step 2: Generate execution workflows
            workflows = await self._generate_execution_workflows(
                scan_requests, analysis_result, context
            )
            
            # Step 3: Optimize resource allocation
            resource_allocation = await self._optimize_resource_allocation(
                workflows, optimization_strategy, context
            )
            
            # Step 4: Determine optimal execution order
            execution_order = await self._calculate_optimal_execution_order(
                workflows, resource_allocation, context
            )
            
            # Step 5: Perform risk assessment
            risk_assessment = await self._perform_risk_assessment(
                workflows, resource_allocation, context
            )
            
            # Step 6: Generate contingency plans
            contingency_plans = await self._generate_contingency_plans(
                workflows, risk_assessment, context
            )
            
            # Step 7: Estimate execution duration
            estimated_duration = await self._estimate_execution_duration(
                workflows, resource_allocation, execution_order
            )
            
            # Create execution plan
            execution_plan = ExecutionPlan(
                plan_id=plan_id,
                workflow_ids=[w.workflow_id for w in workflows],
                execution_order=execution_order,
                resource_allocation=resource_allocation,
                estimated_duration=estimated_duration,
                risk_assessment=risk_assessment,
                contingency_plans=contingency_plans
            )
            
            # Store orchestration context
            self.active_orchestrations[plan_id] = context
            
            # Create database record
            await self._create_orchestration_record(execution_plan, context)
            
            logger.info(f"Orchestration plan {plan_id} created successfully")
            return execution_plan
            
        except Exception as e:
            logger.error(f"Failed to create orchestration plan: {str(e)}")
            raise

    async def execute_orchestration_plan(
        self,
        execution_plan: ExecutionPlan,
        mode: OrchestrationMode = OrchestrationMode.AUTONOMOUS
    ) -> Dict[str, Any]:
        """
        Execute the orchestration plan with real-time monitoring,
        adaptive optimization, and comprehensive error handling.
        """
        try:
            logger.info(f"Executing orchestration plan {execution_plan.plan_id} in {mode} mode")
            
            # Initialize execution tracking
            execution_tracking = await self._initialize_execution_tracking(execution_plan)
            
            # Start real-time monitoring
            await self._start_realtime_monitoring(execution_plan.plan_id)
            
            # Execute workflows based on mode
            if mode == OrchestrationMode.AUTONOMOUS:
                result = await self._execute_autonomous_orchestration(execution_plan, execution_tracking)
            elif mode == OrchestrationMode.SUPERVISED:
                result = await self._execute_supervised_orchestration(execution_plan, execution_tracking)
            elif mode == OrchestrationMode.HYBRID:
                result = await self._execute_hybrid_orchestration(execution_plan, execution_tracking)
            else:
                result = await self._execute_manual_orchestration(execution_plan, execution_tracking)
            
            # Finalize execution and generate report
            final_report = await self._finalize_execution(execution_plan, result)
            
            # Clean up resources
            await self._cleanup_execution_resources(execution_plan.plan_id)
            
            logger.info(f"Orchestration plan {execution_plan.plan_id} completed successfully")
            return final_report
            
        except Exception as e:
            logger.error(f"Failed to execute orchestration plan {execution_plan.plan_id}: {str(e)}")
            await self._handle_orchestration_failure(execution_plan.plan_id, str(e))
            raise

    async def _execute_autonomous_orchestration(
        self,
        execution_plan: ExecutionPlan,
        execution_tracking: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute orchestration plan autonomously with AI-powered optimization"""
        
        results = {
            "completed_workflows": [],
            "failed_workflows": [],
            "performance_metrics": {},
            "optimization_actions": [],
            "alerts_generated": []
        }
        
        try:
            # Execute workflows in optimal order
            for workflow_id in execution_plan.execution_order:
                logger.info(f"Starting autonomous execution of workflow {workflow_id}")
                
                # Pre-execution optimization
                await self._perform_pre_execution_optimization(workflow_id, execution_plan)
                
                # Execute workflow with monitoring
                workflow_result = await self._execute_workflow_with_monitoring(
                    workflow_id, execution_plan, execution_tracking
                )
                
                if workflow_result["status"] == "completed":
                    results["completed_workflows"].append(workflow_result)
                    
                    # Adaptive optimization based on results
                    optimization_actions = await self._perform_adaptive_optimization(
                        workflow_result, execution_plan
                    )
                    results["optimization_actions"].extend(optimization_actions)
                    
                else:
                    results["failed_workflows"].append(workflow_result)
                    
                    # Handle failure and decide on continuation
                    should_continue = await self._handle_workflow_failure(
                        workflow_id, workflow_result, execution_plan
                    )
                    
                    if not should_continue:
                        logger.warning(f"Stopping orchestration due to critical workflow failure: {workflow_id}")
                        break
                
                # Real-time performance monitoring
                performance_metrics = await self._collect_realtime_performance_metrics(
                    workflow_id, execution_plan.plan_id
                )
                results["performance_metrics"][workflow_id] = performance_metrics
                
                # Check for alerts
                alerts = await self._check_performance_alerts(performance_metrics)
                results["alerts_generated"].extend(alerts)
                
                # Brief pause for system stability
                await asyncio.sleep(1)
            
            return results
            
        except Exception as e:
            logger.error(f"Error in autonomous orchestration: {str(e)}")
            results["error"] = str(e)
            return results

    async def _execute_workflow_with_monitoring(
        self,
        workflow_id: str,
        execution_plan: ExecutionPlan,
        execution_tracking: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a single workflow with comprehensive monitoring"""
        
        start_time = datetime.utcnow()
        workflow_result = {
            "workflow_id": workflow_id,
            "status": "running",
            "start_time": start_time,
            "steps_completed": 0,
            "steps_failed": 0,
            "performance_data": {},
            "errors": []
        }
        
        try:
            # Get workflow definition
            workflow = await self._get_workflow_definition(workflow_id)
            if not workflow:
                raise ValueError(f"Workflow {workflow_id} not found")
            
            # Create workflow execution record
            execution_record = await self._create_workflow_execution_record(
                workflow, execution_plan.plan_id
            )
            
            # Execute workflow steps
            for step in workflow.steps:
                step_start_time = datetime.utcnow()
                
                try:
                    # Check step conditions
                    conditions_met = await self._evaluate_step_conditions(step, execution_record)
                    if not conditions_met:
                        logger.info(f"Skipping step {step.step_id} - conditions not met")
                        continue
                    
                    # Execute step with resource allocation
                    step_result = await self._execute_workflow_step(
                        step, execution_record, execution_plan
                    )
                    
                    if step_result["status"] == "completed":
                        workflow_result["steps_completed"] += 1
                        
                        # Collect step performance data
                        step_duration = (datetime.utcnow() - step_start_time).total_seconds()
                        workflow_result["performance_data"][step.step_id] = {
                            "duration_seconds": step_duration,
                            "resource_usage": step_result.get("resource_usage", {}),
                            "throughput": step_result.get("throughput", 0)
                        }
                        
                    else:
                        workflow_result["steps_failed"] += 1
                        workflow_result["errors"].append({
                            "step_id": step.step_id,
                            "error": step_result.get("error", "Unknown error")
                        })
                        
                        # Handle step failure
                        if step.is_required:
                            workflow_result["status"] = "failed"
                            break
                
                except Exception as step_error:
                    logger.error(f"Error executing step {step.step_id}: {str(step_error)}")
                    workflow_result["steps_failed"] += 1
                    workflow_result["errors"].append({
                        "step_id": step.step_id,
                        "error": str(step_error)
                    })
                    
                    if step.is_required:
                        workflow_result["status"] = "failed"
                        break
            
            # Finalize workflow execution
            if workflow_result["status"] != "failed":
                workflow_result["status"] = "completed"
            
            workflow_result["end_time"] = datetime.utcnow()
            workflow_result["total_duration"] = (
                workflow_result["end_time"] - start_time
            ).total_seconds()
            
            # Update execution record
            await self._update_workflow_execution_record(execution_record.id, workflow_result)
            
            return workflow_result
            
        except Exception as e:
            logger.error(f"Error executing workflow {workflow_id}: {str(e)}")
            workflow_result["status"] = "failed"
            workflow_result["error"] = str(e)
            workflow_result["end_time"] = datetime.utcnow()
            return workflow_result

    # ================================================================
    # ADVANCED ANALYSIS AND OPTIMIZATION
    # ================================================================

    async def _analyze_scan_requests(
        self,
        scan_requests: List[Dict[str, Any]],
        context: OrchestrationContext
    ) -> Dict[str, Any]:
        """Perform advanced analysis of scan requests using AI/ML techniques"""
        
        analysis_result = {
            "request_count": len(scan_requests),
            "complexity_analysis": {},
            "dependency_graph": {},
            "resource_requirements": {},
            "optimization_opportunities": [],
            "risk_factors": []
        }
        
        try:
            # Analyze complexity of each request
            for i, request in enumerate(scan_requests):
                complexity = await self._analyze_request_complexity(request)
                analysis_result["complexity_analysis"][f"request_{i}"] = complexity
            
            # Build dependency graph
            dependency_graph = await self._build_dependency_graph(scan_requests)
            analysis_result["dependency_graph"] = dependency_graph
            
            # Calculate resource requirements
            resource_requirements = await self._calculate_resource_requirements(
                scan_requests, analysis_result["complexity_analysis"]
            )
            analysis_result["resource_requirements"] = resource_requirements
            
            # Identify optimization opportunities using AI
            optimization_opportunities = await self._identify_optimization_opportunities(
                scan_requests, analysis_result
            )
            analysis_result["optimization_opportunities"] = optimization_opportunities
            
            # Assess risk factors
            risk_factors = await self._assess_risk_factors(scan_requests, context)
            analysis_result["risk_factors"] = risk_factors
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing scan requests: {str(e)}")
            analysis_result["error"] = str(e)
            return analysis_result

    async def _analyze_request_complexity(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the complexity of a single scan request"""
        
        complexity_score = 0
        factors = []
        
        # Data source complexity
        data_sources = request.get("data_sources", [])
        if len(data_sources) > 10:
            complexity_score += 30
            factors.append("high_data_source_count")
        elif len(data_sources) > 5:
            complexity_score += 15
            factors.append("medium_data_source_count")
        
        # Rule complexity
        rules = request.get("rules", [])
        for rule in rules:
            rule_complexity = rule.get("complexity_level", "simple")
            if rule_complexity == "very_complex":
                complexity_score += 25
            elif rule_complexity == "complex":
                complexity_score += 15
            elif rule_complexity == "moderate":
                complexity_score += 8
        
        # Data volume estimation
        estimated_volume = request.get("estimated_data_volume_gb", 0)
        if estimated_volume > 1000:
            complexity_score += 40
            factors.append("high_data_volume")
        elif estimated_volume > 100:
            complexity_score += 20
            factors.append("medium_data_volume")
        
        # Compliance requirements
        compliance_reqs = request.get("compliance_requirements", [])
        complexity_score += len(compliance_reqs) * 5
        
        # Determine complexity level
        if complexity_score >= 80:
            level = "very_high"
        elif complexity_score >= 60:
            level = "high"
        elif complexity_score >= 40:
            level = "medium"
        elif complexity_score >= 20:
            level = "low"
        else:
            level = "very_low"
        
        return {
            "score": complexity_score,
            "level": level,
            "factors": factors,
            "estimated_duration_minutes": max(30, complexity_score * 2),
            "recommended_resources": {
                "cpu_cores": max(2, complexity_score // 20),
                "memory_gb": max(4, complexity_score // 10),
                "storage_gb": max(10, estimated_volume * 1.2)
            }
        }

    async def _optimize_resource_allocation(
        self,
        workflows: List[ScanWorkflow],
        optimization_strategy: ResourceOptimizationType,
        context: OrchestrationContext
    ) -> Dict[str, Any]:
        """Optimize resource allocation using advanced algorithms"""
        
        allocation_result = {
            "strategy": optimization_strategy,
            "workflow_allocations": {},
            "total_resources_needed": {},
            "optimization_score": 0.0,
            "cost_estimate": 0.0
        }
        
        try:
            if optimization_strategy == ResourceOptimizationType.LOAD_BALANCING:
                allocation_result = await self._optimize_load_balancing(workflows, context)
            elif optimization_strategy == ResourceOptimizationType.PRIORITY_SCHEDULING:
                allocation_result = await self._optimize_priority_scheduling(workflows, context)
            elif optimization_strategy == ResourceOptimizationType.COST_OPTIMIZATION:
                allocation_result = await self._optimize_cost_efficiency(workflows, context)
            else:
                # Default to dynamic scaling
                allocation_result = await self._optimize_dynamic_scaling(workflows, context)
            
            # Apply AI-based optimizations if available
            if self.ai_optimization_models.get("resource_predictor"):
                ai_optimizations = await self._apply_ai_resource_optimization(
                    allocation_result, workflows, context
                )
                allocation_result.update(ai_optimizations)
            
            return allocation_result
            
        except Exception as e:
            logger.error(f"Error optimizing resource allocation: {str(e)}")
            return allocation_result

    async def _optimize_load_balancing(
        self,
        workflows: List[ScanWorkflow],
        context: OrchestrationContext
    ) -> Dict[str, Any]:
        """Optimize resource allocation using load balancing strategy"""
        
        total_cpu_needed = 0
        total_memory_needed = 0
        total_storage_needed = 0
        workflow_allocations = {}
        
        # Calculate total resource needs
        for workflow in workflows:
            cpu_req = workflow.resource_requirements.get("cpu_cores", 2)
            memory_req = workflow.resource_requirements.get("memory_gb", 4)
            storage_req = workflow.resource_requirements.get("storage_gb", 10)
            
            total_cpu_needed += cpu_req
            total_memory_needed += memory_req
            total_storage_needed += storage_req
        
        # Distribute resources evenly with priority adjustments
        available_cpu = self.resource_pools["compute"]["available"]
        available_memory = self.resource_pools["memory"]["available"] / 1024  # Convert to GB
        available_storage = self.resource_pools["storage"]["available"]
        
        for workflow in workflows:
            base_cpu = workflow.resource_requirements.get("cpu_cores", 2)
            base_memory = workflow.resource_requirements.get("memory_gb", 4)
            base_storage = workflow.resource_requirements.get("storage_gb", 10)
            
            # Apply priority multipliers
            priority_multiplier = self._get_priority_multiplier(workflow.priority)
            
            allocated_cpu = min(base_cpu * priority_multiplier, available_cpu * 0.3)
            allocated_memory = min(base_memory * priority_multiplier, available_memory * 0.3)
            allocated_storage = min(base_storage * priority_multiplier, available_storage * 0.3)
            
            workflow_allocations[workflow.workflow_id] = {
                "cpu_cores": allocated_cpu,
                "memory_gb": allocated_memory,
                "storage_gb": allocated_storage,
                "priority_multiplier": priority_multiplier
            }
        
        # Calculate optimization score
        resource_utilization = (
            (total_cpu_needed / available_cpu) * 0.4 +
            (total_memory_needed / available_memory) * 0.3 +
            (total_storage_needed / available_storage) * 0.3
        )
        optimization_score = max(0, min(100, (1 - abs(resource_utilization - 0.8)) * 100))
        
        return {
            "strategy": "load_balancing",
            "workflow_allocations": workflow_allocations,
            "total_resources_needed": {
                "cpu_cores": total_cpu_needed,
                "memory_gb": total_memory_needed,
                "storage_gb": total_storage_needed
            },
            "optimization_score": optimization_score,
            "cost_estimate": self._estimate_resource_cost(
                total_cpu_needed, total_memory_needed, total_storage_needed
            )
        }

    def _get_priority_multiplier(self, priority: WorkflowPriority) -> float:
        """Get resource allocation multiplier based on priority"""
        multipliers = {
            WorkflowPriority.EMERGENCY: 2.0,
            WorkflowPriority.CRITICAL: 1.5,
            WorkflowPriority.HIGH: 1.2,
            WorkflowPriority.NORMAL: 1.0,
            WorkflowPriority.LOW: 0.8
        }
        return multipliers.get(priority, 1.0)

    def _estimate_resource_cost(self, cpu: float, memory: float, storage: float) -> float:
        """Estimate the cost of resource allocation"""
        # Cost per hour estimates (in USD)
        cpu_cost_per_core_hour = 0.05
        memory_cost_per_gb_hour = 0.01
        storage_cost_per_gb_hour = 0.001
        
        # Assume 1 hour execution for estimation
        total_cost = (
            cpu * cpu_cost_per_core_hour +
            memory * memory_cost_per_gb_hour +
            storage * storage_cost_per_gb_hour
        )
        
        return round(total_cost, 4)

    # ================================================================
    # REAL-TIME MONITORING AND ALERTING
    # ================================================================

    async def _start_realtime_monitoring(self, orchestration_id: str):
        """Start real-time monitoring for the orchestration"""
        try:
            # Initialize monitoring session
            await self.realtime_monitor.start_monitoring_session(
                session_id=orchestration_id,
                monitoring_config={
                    "metrics": [
                        "cpu_utilization",
                        "memory_usage",
                        "network_io",
                        "disk_io",
                        "queue_size",
                        "error_rate",
                        "throughput"
                    ],
                    "sampling_interval": 10,  # seconds
                    "alert_thresholds": self.alert_thresholds
                }
            )
            
            logger.info(f"Real-time monitoring started for orchestration {orchestration_id}")
            
        except Exception as e:
            logger.error(f"Failed to start real-time monitoring: {str(e)}")

    async def _collect_realtime_performance_metrics(
        self,
        workflow_id: str,
        orchestration_id: str
    ) -> Dict[str, Any]:
        """Collect real-time performance metrics for a workflow"""
        try:
            # Get current performance metrics
            metrics = await self.performance_service.get_current_metrics(
                workflow_id=workflow_id,
                orchestration_id=orchestration_id
            )
            
            # Enhance with real-time data
            realtime_data = await self.realtime_monitor.get_current_metrics(orchestration_id)
            metrics.update(realtime_data)
            
            # Calculate derived metrics
            metrics["efficiency_score"] = self._calculate_efficiency_score(metrics)
            metrics["performance_trend"] = await self._analyze_performance_trend(workflow_id)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting performance metrics: {str(e)}")
            return {}

    def _calculate_efficiency_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall efficiency score from metrics"""
        try:
            cpu_efficiency = 100 - metrics.get("cpu_utilization", 0)
            memory_efficiency = 100 - metrics.get("memory_usage", 0)
            throughput_score = min(100, metrics.get("throughput", 0) / 10)  # Normalize
            error_penalty = metrics.get("error_rate", 0) * 10
            
            efficiency_score = (
                cpu_efficiency * 0.3 +
                memory_efficiency * 0.3 +
                throughput_score * 0.3 -
                error_penalty * 0.1
            )
            
            return max(0, min(100, efficiency_score))
            
        except Exception:
            return 50.0  # Default score

    async def _check_performance_alerts(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check for performance alerts based on current metrics"""
        alerts = []
        
        for metric_name, threshold in self.alert_thresholds.items():
            current_value = metrics.get(metric_name, 0)
            
            if current_value > threshold:
                alert = {
                    "alert_id": f"alert_{uuid4().hex[:8]}",
                    "metric": metric_name,
                    "current_value": current_value,
                    "threshold": threshold,
                    "severity": self._determine_alert_severity(current_value, threshold),
                    "timestamp": datetime.utcnow().isoformat(),
                    "recommendations": self._generate_alert_recommendations(metric_name, current_value)
                }
                alerts.append(alert)
                
                # Send real-time alert if WebSocket is available
                if self.websocket_manager:
                    await self.websocket_manager.broadcast_alert(alert)
        
        return alerts

    def _determine_alert_severity(self, current_value: float, threshold: float) -> str:
        """Determine alert severity based on threshold breach"""
        breach_ratio = current_value / threshold
        
        if breach_ratio >= 2.0:
            return "critical"
        elif breach_ratio >= 1.5:
            return "high"
        elif breach_ratio >= 1.2:
            return "medium"
        else:
            return "low"

    def _generate_alert_recommendations(self, metric_name: str, current_value: float) -> List[str]:
        """Generate recommendations for alert resolution"""
        recommendations = []
        
        if metric_name == "cpu_utilization":
            recommendations = [
                "Scale up compute resources",
                "Optimize scanning algorithms",
                "Distribute workload across more workers",
                "Implement caching strategies"
            ]
        elif metric_name == "memory_usage":
            recommendations = [
                "Increase memory allocation",
                "Implement memory optimization",
                "Process data in smaller batches",
                "Clear unused data structures"
            ]
        elif metric_name == "error_rate":
            recommendations = [
                "Review error logs for patterns",
                "Implement retry mechanisms",
                "Validate data sources",
                "Check network connectivity"
            ]
        elif metric_name == "queue_size":
            recommendations = [
                "Increase processing capacity",
                "Implement queue prioritization",
                "Scale worker processes",
                "Optimize message processing"
            ]
        
        return recommendations

    # ================================================================
    # DATABASE OPERATIONS
    # ================================================================

    async def _create_orchestration_record(
        self,
        execution_plan: ExecutionPlan,
        context: OrchestrationContext
    ):
        """Create database record for orchestration"""
        try:
            orchestration_record = ScanRuleOrchestration(
                orchestration_id=execution_plan.plan_id,
                orchestration_name=f"Orchestration_{execution_plan.plan_id[:8]}",
                orchestration_type="enterprise_scan",
                workflow_ids=execution_plan.workflow_ids,
                execution_order=execution_plan.execution_order,
                resource_allocation=execution_plan.resource_allocation,
                estimated_duration_minutes=execution_plan.estimated_duration,
                business_context=context.business_context,
                compliance_requirements=context.compliance_requirements,
                performance_targets=context.performance_targets,
                risk_assessment=execution_plan.risk_assessment,
                contingency_plans=execution_plan.contingency_plans,
                created_by=context.user_id
            )
            
            self.db.add(orchestration_record)
            await self.db.commit()
            
        except Exception as e:
            logger.error(f"Error creating orchestration record: {str(e)}")
            await self.db.rollback()
            raise

    async def _get_workflow_definition(self, workflow_id: str) -> Optional[ScanWorkflow]:
        """Get workflow definition from database"""
        try:
            stmt = select(ScanWorkflow).where(
                ScanWorkflow.workflow_id == workflow_id
            ).options(selectinload(ScanWorkflow.steps))
            
            result = await self.db.execute(stmt)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error getting workflow definition: {str(e)}")
            return None

    async def _create_workflow_execution_record(
        self,
        workflow: ScanWorkflow,
        orchestration_id: str
    ) -> WorkflowExecution:
        """Create workflow execution record"""
        try:
            execution_record = WorkflowExecution(
                execution_id=f"exec_{uuid4().hex[:12]}",
                workflow_id=workflow.id,
                execution_type="orchestrated",
                execution_context={
                    "orchestration_id": orchestration_id,
                    "created_at": datetime.utcnow().isoformat()
                },
                total_steps=len(workflow.steps)
            )
            
            self.db.add(execution_record)
            await self.db.commit()
            await self.db.refresh(execution_record)
            
            return execution_record
            
        except Exception as e:
            logger.error(f"Error creating workflow execution record: {str(e)}")
            await self.db.rollback()
            raise

    # ================================================================
    # UTILITY METHODS
    # ================================================================

    async def get_orchestration_status(self, orchestration_id: str) -> Dict[str, Any]:
        """Get current status of an orchestration"""
        try:
            stmt = select(ScanRuleOrchestration).where(
                ScanRuleOrchestration.orchestration_id == orchestration_id
            )
            result = await self.db.execute(stmt)
            orchestration = result.scalar_one_or_none()
            
            if not orchestration:
                return {"error": "Orchestration not found"}
            
            # Get real-time metrics
            current_metrics = await self.realtime_monitor.get_current_metrics(orchestration_id)
            
            return {
                "orchestration_id": orchestration_id,
                "status": orchestration.status,
                "progress_percentage": orchestration.progress_percentage,
                "workflows_completed": orchestration.completed_workflows,
                "workflows_failed": orchestration.failed_workflows,
                "current_metrics": current_metrics,
                "estimated_completion": orchestration.estimated_completion_time,
                "last_updated": orchestration.updated_at
            }
            
        except Exception as e:
            logger.error(f"Error getting orchestration status: {str(e)}")
            return {"error": str(e)}

    async def cancel_orchestration(self, orchestration_id: str, reason: str = None) -> bool:
        """Cancel a running orchestration"""
        try:
            # Update orchestration status
            stmt = update(ScanRuleOrchestration).where(
                ScanRuleOrchestration.orchestration_id == orchestration_id
            ).values(
                status=OrchestrationStatus.CANCELLED,
                cancellation_reason=reason,
                cancelled_at=datetime.utcnow()
            )
            
            await self.db.execute(stmt)
            await self.db.commit()
            
            # Stop monitoring
            await self.realtime_monitor.stop_monitoring_session(orchestration_id)
            
            # Clean up resources
            await self._cleanup_execution_resources(orchestration_id)
            
            logger.info(f"Orchestration {orchestration_id} cancelled successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error cancelling orchestration: {str(e)}")
            return False

    async def get_orchestration_analytics(
        self,
        time_range: Tuple[datetime, datetime] = None
    ) -> Dict[str, Any]:
        """Get comprehensive analytics for orchestration operations"""
        try:
            if not time_range:
                end_time = datetime.utcnow()
                start_time = end_time - timedelta(days=7)
                time_range = (start_time, end_time)
            
            # Query orchestration data
            stmt = select(ScanRuleOrchestration).where(
                and_(
                    ScanRuleOrchestration.created_at >= time_range[0],
                    ScanRuleOrchestration.created_at <= time_range[1]
                )
            )
            
            result = await self.db.execute(stmt)
            orchestrations = result.scalars().all()
            
            # Calculate analytics
            total_orchestrations = len(orchestrations)
            completed_orchestrations = len([o for o in orchestrations if o.status == OrchestrationStatus.COMPLETED])
            failed_orchestrations = len([o for o in orchestrations if o.status == OrchestrationStatus.FAILED])
            
            success_rate = (completed_orchestrations / total_orchestrations * 100) if total_orchestrations > 0 else 0
            
            # Calculate average execution time
            completed_orchestrations_with_time = [
                o for o in orchestrations 
                if o.status == OrchestrationStatus.COMPLETED and o.actual_duration_minutes
            ]
            
            avg_execution_time = (
                sum(o.actual_duration_minutes for o in completed_orchestrations_with_time) / 
                len(completed_orchestrations_with_time)
            ) if completed_orchestrations_with_time else 0
            
            # Resource utilization analytics
            total_cpu_hours = sum(
                o.resource_utilization.get("cpu_hours", 0) for o in orchestrations
                if o.resource_utilization
            )
            
            total_cost = sum(
                o.actual_cost or 0 for o in orchestrations
            )
            
            return {
                "time_range": {
                    "start": time_range[0].isoformat(),
                    "end": time_range[1].isoformat()
                },
                "summary": {
                    "total_orchestrations": total_orchestrations,
                    "completed": completed_orchestrations,
                    "failed": failed_orchestrations,
                    "success_rate_percentage": round(success_rate, 2),
                    "average_execution_time_minutes": round(avg_execution_time, 2)
                },
                "resource_utilization": {
                    "total_cpu_hours": round(total_cpu_hours, 2),
                    "total_cost_usd": round(total_cost, 2),
                    "cost_per_orchestration": round(total_cost / total_orchestrations, 2) if total_orchestrations > 0 else 0
                },
                "performance_trends": await self._calculate_performance_trends(orchestrations),
                "top_bottlenecks": await self._identify_top_bottlenecks(orchestrations)
            }
            
        except Exception as e:
            logger.error(f"Error getting orchestration analytics: {str(e)}")
            return {"error": str(e)}

    async def _cleanup_execution_resources(self, orchestration_id: str):
        """Clean up resources after orchestration completion"""
        try:
            # Remove from active orchestrations
            if orchestration_id in self.active_orchestrations:
                del self.active_orchestrations[orchestration_id]
            
            # Free up allocated resources
            # (Implementation would depend on actual resource management system)
            
            # Stop any background tasks
            # (Implementation would depend on task management system)
            
            logger.info(f"Resources cleaned up for orchestration {orchestration_id}")
            
        except Exception as e:
            logger.error(f"Error cleaning up resources: {str(e)}")

    def __del__(self):
        """Cleanup when orchestrator is destroyed"""
        try:
            if hasattr(self, 'thread_pool'):
                self.thread_pool.shutdown(wait=False)
        except Exception:
            pass