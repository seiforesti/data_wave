"""
Enterprise Orchestration Service for Advanced Scan Rule Management

This service provides enterprise-grade orchestration capabilities for scan rule workflows,
including intelligent scheduling, resource optimization, and multi-system coordination.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import uuid
from collections import defaultdict, deque
from dataclasses import dataclass
from enum import Enum

from sqlmodel import Session, select, and_, or_, func
from fastapi import HTTPException

# Core imports
from app.core.database import get_session
from app.utils.rate_limiter import check_rate_limit
from app.utils.cache import cache_get, cache_set, cache_delete
from app.core.settings import settings
from app.core.logging_config import get_logger

# Model imports
from app.models.Scan-Rule-Sets-completed-models.orchestration_models import (
    OrchestrationJob, JobExecution, ExecutionStep, JobDependency,
    OrchestrationResource, OrchestrationResourceAllocation, WorkflowTemplate,
    OrchestrationStatus, JobPriority, TriggerType, DependencyType, ResourceState,
    OrchestrationJobRequest, OrchestrationJobResponse, JobExecutionRequest,
    JobExecutionStatusResponse, OrchestrationMetrics
)
from app.models.Scan-Rule-Sets-completed-models.rule_execution_models import (
    RuleExecutionWorkflow, RuleExecutionInstance, ExecutionStatus,
    WorkflowExecutionRequest, WorkflowExecutionResponse
)

# Initialize logger
logger = get_logger(__name__)

# ===================================
# ORCHESTRATION STRATEGIES
# ===================================

class ExecutionStrategy(str, Enum):
    """Execution strategies for orchestration."""
    FIFO = "fifo"
    PRIORITY_BASED = "priority_based"
    RESOURCE_OPTIMIZED = "resource_optimized"
    DEADLINE_AWARE = "deadline_aware"
    COST_OPTIMIZED = "cost_optimized"
    LOAD_BALANCED = "load_balanced"

@dataclass
class ResourceRequirement:
    """Resource requirement specification."""
    resource_type: str
    amount: float
    unit: str
    is_critical: bool = True
    alternatives: List[str] = None

@dataclass
class ExecutionPlan:
    """Execution plan for jobs."""
    job_id: str
    execution_order: int
    estimated_start_time: datetime
    estimated_duration_minutes: int
    resource_allocations: List[ResourceRequirement]
    dependencies: List[str]
    risk_score: float

# ===================================
# ENTERPRISE ORCHESTRATION SERVICE
# ===================================

class EnterpriseOrchestrationService:
    """
    Enterprise-grade orchestration service for scan rule workflows.
    
    Features:
    - Intelligent job scheduling and execution
    - Advanced resource management and optimization
    - Multi-system coordination and dependency management
    - Real-time monitoring and failure recovery
    - Performance optimization and cost control
    """

    def __init__(self):
        self.execution_strategies = {
            ExecutionStrategy.FIFO: self._fifo_strategy,
            ExecutionStrategy.PRIORITY_BASED: self._priority_strategy,
            ExecutionStrategy.RESOURCE_OPTIMIZED: self._resource_optimized_strategy,
            ExecutionStrategy.DEADLINE_AWARE: self._deadline_aware_strategy,
            ExecutionStrategy.COST_OPTIMIZED: self._cost_optimized_strategy,
            ExecutionStrategy.LOAD_BALANCED: self._load_balanced_strategy
        }
        self.active_executions = {}
        self.resource_monitor = ResourceMonitor()
        self.dependency_resolver = DependencyResolver()
        self.performance_optimizer = PerformanceOptimizer()
        self.executor = ThreadPoolExecutor(max_workers=10)

    # ===================================
    # JOB MANAGEMENT
    # ===================================

    async def create_orchestration_job(
        self,
        session: Session,
        job_request: OrchestrationJobRequest,
        created_by: str
    ) -> OrchestrationJobResponse:
        """Create a new orchestration job with enterprise features."""
        try:
            # Rate limiting
            await check_rate_limit(f"create_job:{created_by}", max_requests=50, window_seconds=3600)
            
            # Validate workflow definition
            workflow_validation = await self._validate_workflow_definition(job_request.workflow_definition)
            if not workflow_validation["valid"]:
                raise HTTPException(status_code=400, detail=f"Invalid workflow: {workflow_validation['errors']}")
            
            # Create orchestration job
            job = OrchestrationJob(
                job_name=job_request.job_name,
                job_description=job_request.job_description,
                job_type=job_request.job_type,
                priority=job_request.priority,
                trigger_type=job_request.trigger_type,
                schedule_expression=job_request.schedule_expression,
                workflow_definition=job_request.workflow_definition,
                resource_requirements=job_request.resource_requirements or {},
                notification_settings=job_request.notification_settings or {},
                created_by=created_by,
                status=OrchestrationStatus.DRAFT
            )
            
            # Analyze resource requirements
            if job_request.resource_requirements:
                resource_analysis = await self._analyze_resource_requirements(
                    job_request.resource_requirements
                )
                job.resource_constraints = resource_analysis
            
            # Process dependencies if any
            if "dependencies" in job_request.workflow_definition:
                await self._process_job_dependencies(
                    session, job, job_request.workflow_definition["dependencies"]
                )
            
            # Calculate initial metrics
            job.total_steps = len(job_request.workflow_definition.get("steps", []))
            
            session.add(job)
            session.commit()
            session.refresh(job)
            
            # Cache job for quick access
            await cache_set(f"orchestration_job:{job.job_id}", job.dict(), ttl=3600)
            
            logger.info(f"Created orchestration job {job.job_id} by {created_by}")
            
            return OrchestrationJobResponse(
                job_id=job.job_id,
                job_name=job.job_name,
                status=job.status,
                priority=job.priority,
                next_scheduled_at=job.next_scheduled_at,
                created_at=job.created_at,
                message="Orchestration job created successfully"
            )
            
        except Exception as e:
            logger.error(f"Error creating orchestration job: {str(e)}")
            session.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")

    async def execute_job(
        self,
        session: Session,
        execution_request: JobExecutionRequest,
        triggered_by: str
    ) -> JobExecutionStatusResponse:
        """Execute an orchestration job with intelligent coordination."""
        try:
            # Get job
            job = session.get(OrchestrationJob, execution_request.job_id)
            if not job:
                raise HTTPException(status_code=404, detail="Job not found")
            
            if not job.is_active:
                raise HTTPException(status_code=400, detail="Job is not active")
            
            # Check resource availability
            resource_check = await self._check_resource_availability(session, job)
            if not resource_check["available"]:
                raise HTTPException(
                    status_code=409, 
                    detail=f"Insufficient resources: {resource_check['missing']}"
                )
            
            # Create execution instance
            execution = JobExecution(
                job_id=job.job_id,
                execution_number=job.total_executions + 1,
                priority=execution_request.priority_override or job.priority,
                trigger_type=execution_request.trigger_type,
                triggered_by=triggered_by,
                trigger_data=execution_request.execution_context,
                input_parameters=execution_request.input_parameters or {},
                execution_context=execution_request.execution_context or {}
            )
            
            # Resolve dependencies
            dependency_status = await self.dependency_resolver.resolve_dependencies(
                session, job.job_id
            )
            
            if not dependency_status["ready"]:
                execution.status = OrchestrationStatus.QUEUED
                execution.error_message = f"Waiting for dependencies: {dependency_status['waiting_for']}"
            else:
                # Allocate resources
                allocation_result = await self._allocate_resources(session, job, execution)
                if allocation_result["success"]:
                    execution.status = OrchestrationStatus.RUNNING
                    execution.started_at = datetime.utcnow()
                    execution.allocated_resources = allocation_result["allocations"]
                    
                    # Start execution
                    asyncio.create_task(self._execute_job_async(session, job, execution))
                else:
                    execution.status = OrchestrationStatus.QUEUED
                    execution.error_message = f"Resource allocation failed: {allocation_result['error']}"
            
            session.add(execution)
            session.commit()
            session.refresh(execution)
            
            # Update job metrics
            job.total_executions += 1
            job.last_executed_at = datetime.utcnow()
            session.commit()
            
            # Track active execution
            self.active_executions[execution.execution_id] = {
                "job_id": job.job_id,
                "status": execution.status,
                "started_at": execution.started_at
            }
            
            logger.info(f"Started execution {execution.execution_id} for job {job.job_id}")
            
            return JobExecutionStatusResponse(
                execution_id=execution.execution_id,
                job_id=job.job_id,
                status=execution.status,
                progress_percentage=execution.progress_percentage,
                current_step=execution.current_step,
                started_at=execution.started_at,
                resource_usage=execution.allocated_resources,
                error_message=execution.error_message
            )
            
        except Exception as e:
            logger.error(f"Error executing job: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to execute job: {str(e)}")

    # ===================================
    # EXECUTION STRATEGIES
    # ===================================

    async def _fifo_strategy(self, jobs: List[OrchestrationJob]) -> List[ExecutionPlan]:
        """First In, First Out execution strategy."""
        plans = []
        current_time = datetime.utcnow()
        
        for i, job in enumerate(sorted(jobs, key=lambda x: x.created_at)):
            plan = ExecutionPlan(
                job_id=job.job_id,
                execution_order=i + 1,
                estimated_start_time=current_time + timedelta(minutes=i * 5),
                estimated_duration_minutes=self._estimate_duration(job),
                resource_allocations=self._parse_resource_requirements(job.resource_requirements),
                dependencies=job.prerequisite_jobs,
                risk_score=10.0  # Low risk for FIFO
            )
            plans.append(plan)
            
        return plans

    async def _priority_strategy(self, jobs: List[OrchestrationJob]) -> List[ExecutionPlan]:
        """Priority-based execution strategy."""
        plans = []
        current_time = datetime.utcnow()
        
        # Sort by priority (CRITICAL, HIGH, MEDIUM, LOW, BACKGROUND)
        priority_order = {
            JobPriority.CRITICAL: 1,
            JobPriority.HIGH: 2,
            JobPriority.MEDIUM: 3,
            JobPriority.LOW: 4,
            JobPriority.BACKGROUND: 5
        }
        
        sorted_jobs = sorted(jobs, key=lambda x: priority_order.get(x.priority, 6))
        
        for i, job in enumerate(sorted_jobs):
            # Higher priority jobs get earlier start times
            delay_minutes = i * 2 if job.priority in [JobPriority.CRITICAL, JobPriority.HIGH] else i * 5
            
            plan = ExecutionPlan(
                job_id=job.job_id,
                execution_order=i + 1,
                estimated_start_time=current_time + timedelta(minutes=delay_minutes),
                estimated_duration_minutes=self._estimate_duration(job),
                resource_allocations=self._parse_resource_requirements(job.resource_requirements),
                dependencies=job.prerequisite_jobs,
                risk_score=5.0 if job.priority == JobPriority.CRITICAL else 15.0
            )
            plans.append(plan)
            
        return plans

    async def _resource_optimized_strategy(self, jobs: List[OrchestrationJob]) -> List[ExecutionPlan]:
        """Resource-optimized execution strategy."""
        plans = []
        current_time = datetime.utcnow()
        
        # Analyze resource utilization patterns
        resource_utilization = await self._analyze_resource_utilization()
        
        # Group jobs by resource requirements
        resource_groups = defaultdict(list)
        for job in jobs:
            resource_signature = self._get_resource_signature(job.resource_requirements)
            resource_groups[resource_signature].append(job)
        
        execution_order = 0
        for resource_signature, group_jobs in resource_groups.items():
            # Sort jobs within group by efficiency score
            group_jobs.sort(key=lambda x: self._calculate_efficiency_score(x), reverse=True)
            
            for job in group_jobs:
                execution_order += 1
                optimal_time = await self._find_optimal_execution_time(
                    job, resource_utilization, current_time
                )
                
                plan = ExecutionPlan(
                    job_id=job.job_id,
                    execution_order=execution_order,
                    estimated_start_time=optimal_time,
                    estimated_duration_minutes=self._estimate_duration(job),
                    resource_allocations=self._parse_resource_requirements(job.resource_requirements),
                    dependencies=job.prerequisite_jobs,
                    risk_score=self._calculate_resource_risk(job.resource_requirements)
                )
                plans.append(plan)
        
        return sorted(plans, key=lambda x: x.estimated_start_time)

    async def _deadline_aware_strategy(self, jobs: List[OrchestrationJob]) -> List[ExecutionPlan]:
        """Deadline-aware execution strategy."""
        plans = []
        current_time = datetime.utcnow()
        
        # Extract deadlines from job metadata
        jobs_with_deadlines = []
        for job in jobs:
            deadline = self._extract_deadline(job)
            urgency_score = self._calculate_urgency_score(deadline, current_time)
            jobs_with_deadlines.append((job, deadline, urgency_score))
        
        # Sort by urgency score (most urgent first)
        jobs_with_deadlines.sort(key=lambda x: x[2], reverse=True)
        
        for i, (job, deadline, urgency_score) in enumerate(jobs_with_deadlines):
            # Schedule high-urgency jobs immediately
            delay_minutes = 0 if urgency_score > 80 else i * 3
            
            plan = ExecutionPlan(
                job_id=job.job_id,
                execution_order=i + 1,
                estimated_start_time=current_time + timedelta(minutes=delay_minutes),
                estimated_duration_minutes=self._estimate_duration(job),
                resource_allocations=self._parse_resource_requirements(job.resource_requirements),
                dependencies=job.prerequisite_jobs,
                risk_score=100 - urgency_score  # Higher urgency = lower risk tolerance
            )
            plans.append(plan)
            
        return plans

    async def _cost_optimized_strategy(self, jobs: List[OrchestrationJob]) -> List[ExecutionPlan]:
        """Cost-optimized execution strategy."""
        plans = []
        current_time = datetime.utcnow()
        
        # Calculate cost efficiency for each job
        job_costs = []
        for job in jobs:
            cost_estimate = await self._estimate_execution_cost(job)
            efficiency_ratio = self._calculate_value_cost_ratio(job, cost_estimate)
            job_costs.append((job, cost_estimate, efficiency_ratio))
        
        # Sort by cost efficiency (best value first)
        job_costs.sort(key=lambda x: x[2], reverse=True)
        
        # Find cost-optimal execution windows
        cost_calendar = await self._get_resource_cost_calendar()
        
        for i, (job, cost_estimate, efficiency_ratio) in enumerate(job_costs):
            optimal_time = await self._find_cost_optimal_time(
                job, cost_calendar, current_time
            )
            
            plan = ExecutionPlan(
                job_id=job.job_id,
                execution_order=i + 1,
                estimated_start_time=optimal_time,
                estimated_duration_minutes=self._estimate_duration(job),
                resource_allocations=self._parse_resource_requirements(job.resource_requirements),
                dependencies=job.prerequisite_jobs,
                risk_score=20.0 + (50.0 / max(efficiency_ratio, 1.0))  # Risk based on efficiency
            )
            plans.append(plan)
            
        return sorted(plans, key=lambda x: x.estimated_start_time)

    async def _load_balanced_strategy(self, jobs: List[OrchestrationJob]) -> List[ExecutionPlan]:
        """Load-balanced execution strategy."""
        plans = []
        current_time = datetime.utcnow()
        
        # Get current system load
        system_load = await self._get_current_system_load()
        
        # Distribute jobs across available execution slots
        execution_slots = await self._calculate_execution_slots(system_load)
        
        for i, job in enumerate(jobs):
            # Find the least loaded slot
            slot_index = i % len(execution_slots)
            slot = execution_slots[slot_index]
            
            plan = ExecutionPlan(
                job_id=job.job_id,
                execution_order=i + 1,
                estimated_start_time=slot["start_time"],
                estimated_duration_minutes=self._estimate_duration(job),
                resource_allocations=self._parse_resource_requirements(job.resource_requirements),
                dependencies=job.prerequisite_jobs,
                risk_score=slot["load_factor"] * 30.0  # Risk increases with load
            )
            plans.append(plan)
            
            # Update slot load
            slot["load_factor"] += self._calculate_job_load_impact(job)
            slot["start_time"] += timedelta(minutes=plan.estimated_duration_minutes // len(execution_slots))
        
        return sorted(plans, key=lambda x: x.estimated_start_time)

    # ===================================
    # RESOURCE MANAGEMENT
    # ===================================

    async def _check_resource_availability(
        self,
        session: Session,
        job: OrchestrationJob
    ) -> Dict[str, Any]:
        """Check if required resources are available for job execution."""
        try:
            required_resources = self._parse_resource_requirements(job.resource_requirements)
            available_resources = await self._get_available_resources(session)
            
            missing_resources = []
            allocation_plan = {}
            
            for req in required_resources:
                available_amount = available_resources.get(req.resource_type, 0)
                
                if available_amount >= req.amount:
                    allocation_plan[req.resource_type] = {
                        "amount": req.amount,
                        "unit": req.unit,
                        "available": available_amount
                    }
                else:
                    missing_resources.append({
                        "resource_type": req.resource_type,
                        "required": req.amount,
                        "available": available_amount,
                        "deficit": req.amount - available_amount
                    })
            
            return {
                "available": len(missing_resources) == 0,
                "missing": missing_resources,
                "allocation_plan": allocation_plan
            }
            
        except Exception as e:
            logger.error(f"Error checking resource availability: {str(e)}")
            return {"available": False, "error": str(e)}

    async def _allocate_resources(
        self,
        session: Session,
        job: OrchestrationJob,
        execution: JobExecution
    ) -> Dict[str, Any]:
        """Allocate resources for job execution."""
        try:
            required_resources = self._parse_resource_requirements(job.resource_requirements)
            allocations = {}
            allocation_records = []
            
            for req in required_resources:
                # Find best matching resource
                resource = await self._find_best_resource(session, req)
                
                if resource:
                    # Create allocation record
                    allocation = OrchestrationResourceAllocation(
                        job_id=job.job_id,
                        resource_id=resource.resource_id,
                        allocated_amount=req.amount,
                        priority=execution.priority,
                        allocation_reason=f"Job execution: {job.job_name}",
                        allocated_by=execution.triggered_by
                    )
                    
                    session.add(allocation)
                    allocation_records.append(allocation)
                    
                    # Update resource availability
                    resource.available_capacity -= req.amount
                    
                    allocations[req.resource_type] = {
                        "resource_id": resource.resource_id,
                        "amount": req.amount,
                        "unit": req.unit
                    }
                else:
                    # Resource allocation failed
                    return {
                        "success": False,
                        "error": f"No available resource for {req.resource_type}"
                    }
            
            session.commit()
            
            return {
                "success": True,
                "allocations": allocations,
                "allocation_records": [alloc.allocation_id for alloc in allocation_records]
            }
            
        except Exception as e:
            logger.error(f"Error allocating resources: {str(e)}")
            session.rollback()
            return {"success": False, "error": str(e)}

    # ===================================
    # EXECUTION ENGINE
    # ===================================

    async def _execute_job_async(
        self,
        session: Session,
        job: OrchestrationJob,
        execution: JobExecution
    ):
        """Execute job asynchronously with monitoring and recovery."""
        try:
            logger.info(f"Starting async execution of job {job.job_id}")
            
            # Parse workflow steps
            workflow_steps = job.workflow_definition.get("steps", [])
            execution.total_steps = len(workflow_steps)
            
            # Execute steps sequentially or in parallel based on configuration
            execution_mode = job.workflow_definition.get("execution_mode", "sequential")
            
            if execution_mode == "parallel":
                await self._execute_steps_parallel(session, job, execution, workflow_steps)
            else:
                await self._execute_steps_sequential(session, job, execution, workflow_steps)
            
            # Mark execution as completed
            execution.status = OrchestrationStatus.COMPLETED
            execution.completed_at = datetime.utcnow()
            execution.execution_time_seconds = (
                execution.completed_at - execution.started_at
            ).total_seconds()
            execution.progress_percentage = 100.0
            
            # Update job success metrics
            job.successful_executions += 1
            self._update_job_performance_metrics(job, execution)
            
            # Release resources
            await self._release_job_resources(session, execution)
            
            session.commit()
            
            # Remove from active executions
            if execution.execution_id in self.active_executions:
                del self.active_executions[execution.execution_id]
            
            logger.info(f"Completed execution {execution.execution_id}")
            
        except Exception as e:
            logger.error(f"Error in async job execution: {str(e)}")
            
            # Mark execution as failed
            execution.status = OrchestrationStatus.FAILED
            execution.completed_at = datetime.utcnow()
            execution.error_message = str(e)
            execution.error_details = {"error_type": type(e).__name__, "traceback": str(e)}
            
            # Update job failure metrics
            job.failed_executions += 1
            
            # Release resources
            await self._release_job_resources(session, execution)
            
            session.commit()
            
            # Remove from active executions
            if execution.execution_id in self.active_executions:
                del self.active_executions[execution.execution_id]

    async def _execute_steps_sequential(
        self,
        session: Session,
        job: OrchestrationJob,
        execution: JobExecution,
        steps: List[Dict[str, Any]]
    ):
        """Execute workflow steps sequentially."""
        for i, step_config in enumerate(steps):
            step = ExecutionStep(
                execution_id=execution.execution_id,
                step_name=step_config.get("name", f"Step {i+1}"),
                step_type=step_config.get("type", "generic"),
                step_order=i + 1,
                step_definition=step_config,
                is_critical=step_config.get("critical", False)
            )
            
            session.add(step)
            session.commit()
            session.refresh(step)
            
            # Execute step
            await self._execute_single_step(session, execution, step)
            
            # Update execution progress
            execution.steps_completed += 1
            execution.progress_percentage = (execution.steps_completed / execution.total_steps) * 100
            execution.current_step = step.step_name
            session.commit()
            
            # Check if step failed and it's critical
            if step.status == OrchestrationStatus.FAILED and step.is_critical:
                raise Exception(f"Critical step failed: {step.error_message}")

    async def _execute_steps_parallel(
        self,
        session: Session,
        job: OrchestrationJob,
        execution: JobExecution,
        steps: List[Dict[str, Any]]
    ):
        """Execute workflow steps in parallel where possible."""
        # Create all step records
        step_objects = []
        for i, step_config in enumerate(steps):
            step = ExecutionStep(
                execution_id=execution.execution_id,
                step_name=step_config.get("name", f"Step {i+1}"),
                step_type=step_config.get("type", "generic"),
                step_order=i + 1,
                step_definition=step_config,
                is_critical=step_config.get("critical", False),
                depends_on_steps=step_config.get("depends_on", [])
            )
            step_objects.append(step)
            session.add(step)
        
        session.commit()
        
        # Execute steps based on dependencies
        completed_steps = set()
        
        while len(completed_steps) < len(step_objects):
            # Find steps ready to execute
            ready_steps = [
                step for step in step_objects
                if step.step_id not in completed_steps
                and all(dep in completed_steps for dep in step.depends_on_steps)
                and step.status == OrchestrationStatus.QUEUED
            ]
            
            if not ready_steps:
                # Check for circular dependencies or other issues
                remaining_steps = [s for s in step_objects if s.step_id not in completed_steps]
                if remaining_steps:
                    raise Exception("Circular dependency or unresolvable dependencies detected")
                break
            
            # Execute ready steps in parallel
            tasks = [
                asyncio.create_task(self._execute_single_step(session, execution, step))
                for step in ready_steps
            ]
            
            # Wait for all tasks to complete
            await asyncio.gather(*tasks, return_exceptions=True)
            
            # Update completed steps
            for step in ready_steps:
                completed_steps.add(step.step_id)
                execution.steps_completed += 1
            
            # Update progress
            execution.progress_percentage = (execution.steps_completed / execution.total_steps) * 100
            session.commit()

    async def _execute_single_step(
        self,
        session: Session,
        execution: JobExecution,
        step: ExecutionStep
    ):
        """Execute a single workflow step."""
        try:
            step.status = OrchestrationStatus.RUNNING
            step.started_at = datetime.utcnow()
            session.commit()
            
            # Execute step based on type
            step_type = step.step_type
            step_definition = step.step_definition
            
            if step_type == "rule_execution":
                await self._execute_rule_step(step_definition, step)
            elif step_type == "validation":
                await self._execute_validation_step(step_definition, step)
            elif step_type == "notification":
                await self._execute_notification_step(step_definition, step)
            elif step_type == "data_processing":
                await self._execute_data_processing_step(step_definition, step)
            else:
                # Generic step execution
                await self._execute_generic_step(step_definition, step)
            
            step.status = OrchestrationStatus.COMPLETED
            step.completed_at = datetime.utcnow()
            step.execution_time_seconds = (
                step.completed_at - step.started_at
            ).total_seconds()
            
        except Exception as e:
            step.status = OrchestrationStatus.FAILED
            step.completed_at = datetime.utcnow()
            step.error_message = str(e)
            step.error_details = {"error_type": type(e).__name__}
            
            # Retry logic
            if step.can_retry and step.retry_count < step.max_retry_attempts:
                step.retry_count += 1
                step.status = OrchestrationStatus.RETRYING
                await asyncio.sleep(2 ** step.retry_count)  # Exponential backoff
                await self._execute_single_step(session, execution, step)
        
        finally:
            session.commit()

    # ===================================
    # UTILITY METHODS
    # ===================================

    def _estimate_duration(self, job: OrchestrationJob) -> int:
        """Estimate job execution duration in minutes."""
        # Base estimation on job complexity and historical data
        base_duration = 30  # Default 30 minutes
        
        # Adjust based on workflow complexity
        steps_count = len(job.workflow_definition.get("steps", []))
        complexity_factor = 1 + (steps_count * 0.1)
        
        # Adjust based on resource requirements
        resource_factor = 1.0
        if job.resource_requirements:
            resource_factor = 1 + (len(job.resource_requirements) * 0.05)
        
        # Use historical data if available
        if job.average_execution_time_seconds:
            historical_minutes = job.average_execution_time_seconds / 60
            return int(historical_minutes * complexity_factor * resource_factor)
        
        return int(base_duration * complexity_factor * resource_factor)

    def _parse_resource_requirements(self, requirements: Dict[str, Any]) -> List[ResourceRequirement]:
        """Parse resource requirements from job configuration."""
        parsed_requirements = []
        
        for resource_type, config in requirements.items():
            if isinstance(config, dict):
                req = ResourceRequirement(
                    resource_type=resource_type,
                    amount=config.get("amount", 1.0),
                    unit=config.get("unit", "units"),
                    is_critical=config.get("critical", True),
                    alternatives=config.get("alternatives", [])
                )
            else:
                # Simple numeric requirement
                req = ResourceRequirement(
                    resource_type=resource_type,
                    amount=float(config),
                    unit="units"
                )
            
            parsed_requirements.append(req)
        
        return parsed_requirements

    async def _validate_workflow_definition(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Validate workflow definition structure and content."""
        errors = []
        
        # Check required fields
        if "steps" not in workflow:
            errors.append("Workflow must contain 'steps' field")
        
        if workflow.get("steps"):
            for i, step in enumerate(workflow["steps"]):
                if not isinstance(step, dict):
                    errors.append(f"Step {i+1} must be a dictionary")
                    continue
                
                if "type" not in step:
                    errors.append(f"Step {i+1} missing 'type' field")
                
                if "name" not in step:
                    errors.append(f"Step {i+1} missing 'name' field")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }

    async def get_orchestration_metrics(self, session: Session) -> OrchestrationMetrics:
        """Get comprehensive orchestration metrics."""
        try:
            # Basic counts
            total_jobs = session.exec(select(func.count(OrchestrationJob.id))).first()
            active_jobs = session.exec(
                select(func.count(OrchestrationJob.id)).where(OrchestrationJob.is_active == True)
            ).first()
            
            # Today's executions
            today = datetime.utcnow().date()
            completed_today = session.exec(
                select(func.count(JobExecution.id)).where(
                    and_(
                        JobExecution.completed_at >= today,
                        JobExecution.status == OrchestrationStatus.COMPLETED
                    )
                )
            ).first()
            
            failed_today = session.exec(
                select(func.count(JobExecution.id)).where(
                    and_(
                        JobExecution.completed_at >= today,
                        JobExecution.status == OrchestrationStatus.FAILED
                    )
                )
            ).first()
            
            # Performance metrics
            avg_execution_time = session.exec(
                select(func.avg(JobExecution.execution_time_seconds)).where(
                    JobExecution.status == OrchestrationStatus.COMPLETED
                )
            ).first() or 0
            
            # Resource utilization
            resource_util = await self._calculate_current_resource_utilization(session)
            
            # Success rate
            total_executions = completed_today + failed_today
            success_rate = (completed_today / max(total_executions, 1)) * 100
            
            # Queue length
            queue_length = len(self.active_executions)
            
            # System health score (0-100)
            health_score = await self._calculate_system_health_score(session)
            
            return OrchestrationMetrics(
                total_jobs=total_jobs,
                active_jobs=active_jobs,
                completed_jobs_today=completed_today,
                failed_jobs_today=failed_today,
                average_execution_time_minutes=avg_execution_time / 60 if avg_execution_time else 0,
                resource_utilization_percentage=resource_util,
                success_rate_percentage=success_rate,
                queue_length=queue_length,
                system_health_score=health_score
            )
            
        except Exception as e:
            logger.error(f"Error getting orchestration metrics: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")

# ===================================
# HELPER CLASSES
# ===================================

class ResourceMonitor:
    """Monitor resource usage and availability."""
    
    async def get_resource_status(self, session: Session) -> Dict[str, Any]:
        """Get current resource status across the system."""
        # Implementation for resource monitoring
        return {"status": "monitoring_active"}

class DependencyResolver:
    """Resolve job dependencies and execution order."""
    
    async def resolve_dependencies(self, session: Session, job_id: str) -> Dict[str, Any]:
        """Resolve dependencies for a job."""
        # Implementation for dependency resolution
        return {"ready": True, "waiting_for": []}

class PerformanceOptimizer:
    """Optimize performance based on historical data and patterns."""
    
    async def optimize_execution_plan(self, jobs: List[OrchestrationJob]) -> Dict[str, Any]:
        """Optimize execution plan for maximum performance."""
        # Implementation for performance optimization
        return {"optimized": True, "improvements": []}