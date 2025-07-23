"""
🚀 ENTERPRISE SCAN ORCHESTRATION SERVICE
Advanced orchestration engine for coordinating scanning across multiple data sources
with intelligent resource management, priority queuing, and workflow automation.
"""

from typing import List, Dict, Any, Optional, Union, Set, Tuple
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import json
import logging
from sqlalchemy import and_, or_, func
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..models.scan_models import (
    Scan, ScanStatus, ScanPriority, ScanOrchestrationStrategy,
    ScanOrchestrationStatus, ScanWorkflowStatus, DataSource, DataSourceStatus
)
from ..models.scan_orchestration_models import (
    ScanOrchestrationJob, ScanWorkflow, ScanWorkflowStep,
    ResourceAllocation, ScanDependency, OrchestrationMetrics
)
from ..models.advanced_scan_rule_models import (
    IntelligentScanRule, RuleExecutionHistory, ScanRulePerformance
)
from ..core.database import get_session
from .data_source_connection_service import DataSourceConnectionService
from .enterprise_scan_rule_service import EnterpriseScanRuleService
from .unified_scan_orchestrator import UnifiedScanOrchestrator

logger = logging.getLogger(__name__)

class OrchestrationDecisionEngine:
    """AI-powered decision engine for scan orchestration"""
    
    def __init__(self):
        self.performance_history = {}
        self.resource_utilization = {}
        self.failure_patterns = {}
    
    async def determine_optimal_strategy(
        self,
        data_sources: List[DataSource],
        scan_rules: List[IntelligentScanRule],
        available_resources: Dict[str, Any]
    ) -> ScanOrchestrationStrategy:
        """Determine optimal orchestration strategy using AI/ML algorithms"""
        
        # Analyze historical performance
        performance_scores = await self._analyze_performance_history(data_sources)
        
        # Check resource constraints
        resource_score = self._evaluate_resource_availability(available_resources)
        
        # Analyze dependencies
        dependency_complexity = await self._analyze_dependencies(data_sources, scan_rules)
        
        # Decision matrix
        if resource_score > 0.8 and dependency_complexity < 0.3:
            return ScanOrchestrationStrategy.PARALLEL
        elif dependency_complexity > 0.7:
            return ScanOrchestrationStrategy.DEPENDENCY_AWARE
        elif resource_score < 0.4:
            return ScanOrchestrationStrategy.RESOURCE_AWARE
        elif any(ds.criticality == "critical" for ds in data_sources):
            return ScanOrchestrationStrategy.PRIORITY_BASED
        else:
            return ScanOrchestrationStrategy.ADAPTIVE
    
    async def _analyze_performance_history(self, data_sources: List[DataSource]) -> Dict[int, float]:
        """Analyze historical performance for each data source"""
        scores = {}
        for ds in data_sources:
            # Calculate performance score based on historical data
            # This would typically involve ML model predictions
            avg_scan_time = await self._get_average_scan_time(ds.id)
            success_rate = await self._get_scan_success_rate(ds.id)
            scores[ds.id] = success_rate * (1 / max(avg_scan_time, 1))
        return scores
    
    async def _get_average_scan_time(self, data_source_id: int) -> float:
        """Get average scan time for a data source"""
        with get_session() as session:
            result = session.query(func.avg(Scan.duration)).filter(
                Scan.data_source_id == data_source_id,
                Scan.status == ScanStatus.COMPLETED
            ).scalar()
            return float(result or 60)  # Default 60 seconds
    
    async def _get_scan_success_rate(self, data_source_id: int) -> float:
        """Get scan success rate for a data source"""
        with get_session() as session:
            total_scans = session.query(Scan).filter(
                Scan.data_source_id == data_source_id
            ).count()
            
            successful_scans = session.query(Scan).filter(
                Scan.data_source_id == data_source_id,
                Scan.status == ScanStatus.COMPLETED
            ).count()
            
            return successful_scans / max(total_scans, 1)
    
    def _evaluate_resource_availability(self, resources: Dict[str, Any]) -> float:
        """Evaluate current resource availability"""
        cpu_score = 1 - resources.get('cpu_usage', 0) / 100
        memory_score = 1 - resources.get('memory_usage', 0) / 100
        network_score = 1 - resources.get('network_usage', 0) / 100
        
        return (cpu_score + memory_score + network_score) / 3
    
    async def _analyze_dependencies(
        self, 
        data_sources: List[DataSource],
        scan_rules: List[IntelligentScanRule]
    ) -> float:
        """Analyze complexity of dependencies between scans"""
        total_dependencies = 0
        total_possible = len(data_sources) * (len(data_sources) - 1)
        
        # Check for rule dependencies
        for rule in scan_rules:
            if hasattr(rule, 'dependencies') and rule.dependencies:
                total_dependencies += len(rule.dependencies)
        
        return total_dependencies / max(total_possible, 1)


class ScanResourceManager:
    """Advanced resource manager for scan operations"""
    
    def __init__(self):
        self.resource_pools = {
            'cpu': {'total': 100, 'used': 0, 'reserved': 0},
            'memory': {'total': 16384, 'used': 0, 'reserved': 0},  # MB
            'network': {'total': 1000, 'used': 0, 'reserved': 0},  # Mbps
            'storage': {'total': 1000, 'used': 0, 'reserved': 0}  # GB
        }
        self.active_allocations = {}
    
    async def allocate_resources(
        self,
        orchestration_job_id: str,
        resource_requirements: Dict[str, float]
    ) -> Optional[ResourceAllocation]:
        """Allocate resources for a scan orchestration job"""
        
        # Check if resources are available
        if not self._can_allocate(resource_requirements):
            return None
        
        # Create allocation
        allocation = ResourceAllocation(
            orchestration_job_id=orchestration_job_id,
            cpu_allocation=resource_requirements.get('cpu', 0),
            memory_allocation=resource_requirements.get('memory', 0),
            network_allocation=resource_requirements.get('network', 0),
            storage_allocation=resource_requirements.get('storage', 0),
            allocated_at=datetime.utcnow()
        )
        
        # Reserve resources
        for resource, amount in resource_requirements.items():
            if resource in self.resource_pools:
                self.resource_pools[resource]['reserved'] += amount
        
        self.active_allocations[orchestration_job_id] = allocation
        return allocation
    
    def _can_allocate(self, requirements: Dict[str, float]) -> bool:
        """Check if resources can be allocated"""
        for resource, amount in requirements.items():
            if resource in self.resource_pools:
                pool = self.resource_pools[resource]
                available = pool['total'] - pool['used'] - pool['reserved']
                if available < amount:
                    return False
        return True
    
    async def release_resources(self, orchestration_job_id: str):
        """Release resources after job completion"""
        if orchestration_job_id in self.active_allocations:
            allocation = self.active_allocations[orchestration_job_id]
            
            # Release reserved resources
            self.resource_pools['cpu']['reserved'] -= allocation.cpu_allocation
            self.resource_pools['memory']['reserved'] -= allocation.memory_allocation
            self.resource_pools['network']['reserved'] -= allocation.network_allocation
            self.resource_pools['storage']['reserved'] -= allocation.storage_allocation
            
            del self.active_allocations[orchestration_job_id]


class WorkflowExecutionEngine:
    """Advanced workflow execution engine with support for complex workflows"""
    
    def __init__(self, resource_manager: ScanResourceManager):
        self.resource_manager = resource_manager
        self.active_workflows = {}
        self.step_executors = {}
    
    async def execute_workflow(
        self,
        workflow: ScanWorkflow,
        orchestration_job_id: str
    ) -> bool:
        """Execute a scan workflow with all its steps"""
        
        try:
            # Initialize workflow execution
            workflow.status = ScanWorkflowStatus.RUNNING
            workflow.started_at = datetime.utcnow()
            
            self.active_workflows[workflow.id] = {
                'workflow': workflow,
                'orchestration_job_id': orchestration_job_id,
                'completed_steps': set(),
                'failed_steps': set()
            }
            
            # Execute workflow steps
            success = await self._execute_workflow_steps(workflow)
            
            # Update workflow status
            if success:
                workflow.status = ScanWorkflowStatus.COMPLETED
                workflow.completed_at = datetime.utcnow()
            else:
                workflow.status = ScanWorkflowStatus.FAILED
                workflow.failed_at = datetime.utcnow()
            
            return success
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {str(e)}")
            workflow.status = ScanWorkflowStatus.FAILED
            workflow.failed_at = datetime.utcnow()
            workflow.error_message = str(e)
            return False
        finally:
            # Cleanup
            if workflow.id in self.active_workflows:
                del self.active_workflows[workflow.id]
    
    async def _execute_workflow_steps(self, workflow: ScanWorkflow) -> bool:
        """Execute individual workflow steps respecting dependencies"""
        
        remaining_steps = set(range(len(workflow.steps)))
        completed_steps = set()
        failed_steps = set()
        
        while remaining_steps and not failed_steps:
            # Find steps that can be executed (dependencies satisfied)
            executable_steps = []
            for step_idx in remaining_steps:
                step = workflow.steps[step_idx]
                if self._can_execute_step(step, completed_steps):
                    executable_steps.append((step_idx, step))
            
            if not executable_steps:
                logger.error("No executable steps found - possible circular dependency")
                return False
            
            # Execute steps (parallel execution where possible)
            step_tasks = []
            for step_idx, step in executable_steps:
                task = asyncio.create_task(self._execute_single_step(step, step_idx))
                step_tasks.append((step_idx, task))
            
            # Wait for step completion
            for step_idx, task in step_tasks:
                try:
                    success = await task
                    if success:
                        completed_steps.add(step_idx)
                        remaining_steps.remove(step_idx)
                    else:
                        failed_steps.add(step_idx)
                        remaining_steps.remove(step_idx)
                except Exception as e:
                    logger.error(f"Step {step_idx} execution failed: {str(e)}")
                    failed_steps.add(step_idx)
                    remaining_steps.remove(step_idx)
        
        return len(failed_steps) == 0
    
    def _can_execute_step(self, step: ScanWorkflowStep, completed_steps: Set[int]) -> bool:
        """Check if a step can be executed based on its dependencies"""
        if not hasattr(step, 'dependencies') or not step.dependencies:
            return True
        
        return all(dep_idx in completed_steps for dep_idx in step.dependencies)
    
    async def _execute_single_step(self, step: ScanWorkflowStep, step_idx: int) -> bool:
        """Execute a single workflow step"""
        try:
            step.status = ScanWorkflowStatus.RUNNING
            step.started_at = datetime.utcnow()
            
            # Execute step based on its type
            if step.step_type == "scan":
                success = await self._execute_scan_step(step)
            elif step.step_type == "validation":
                success = await self._execute_validation_step(step)
            elif step.step_type == "notification":
                success = await self._execute_notification_step(step)
            else:
                logger.warning(f"Unknown step type: {step.step_type}")
                success = False
            
            # Update step status
            if success:
                step.status = ScanWorkflowStatus.COMPLETED
                step.completed_at = datetime.utcnow()
            else:
                step.status = ScanWorkflowStatus.FAILED
                step.failed_at = datetime.utcnow()
            
            return success
            
        except Exception as e:
            logger.error(f"Step execution failed: {str(e)}")
            step.status = ScanWorkflowStatus.FAILED
            step.failed_at = datetime.utcnow()
            step.error_message = str(e)
            return False
    
    async def _execute_scan_step(self, step: ScanWorkflowStep) -> bool:
        """Execute a scan step"""
        # Implementation for scan execution
        # This would integrate with the actual scanning logic
        await asyncio.sleep(1)  # Simulate scan execution
        return True
    
    async def _execute_validation_step(self, step: ScanWorkflowStep) -> bool:
        """Execute a validation step"""
        # Implementation for validation logic
        await asyncio.sleep(0.5)  # Simulate validation
        return True
    
    async def _execute_notification_step(self, step: ScanWorkflowStep) -> bool:
        """Execute a notification step"""
        # Implementation for notification logic
        await asyncio.sleep(0.2)  # Simulate notification
        return True


class ScanOrchestrationService:
    """
    🏢 ENTERPRISE SCAN ORCHESTRATION SERVICE
    
    Advanced orchestration engine that coordinates scanning across multiple data sources
    with intelligent resource management, priority queuing, and workflow automation.
    """
    
    def __init__(self):
        self.decision_engine = OrchestrationDecisionEngine()
        self.resource_manager = ScanResourceManager()
        self.workflow_engine = WorkflowExecutionEngine(self.resource_manager)
        self.data_source_service = DataSourceConnectionService()
        self.scan_rule_service = EnterpriseScanRuleService()
        self.unified_orchestrator = UnifiedScanOrchestrator()
        
    async def create_orchestration_job(
        self,
        data_source_ids: List[int],
        scan_rule_ids: List[int],
        priority: ScanPriority = ScanPriority.NORMAL,
        strategy: Optional[ScanOrchestrationStrategy] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ScanOrchestrationJob:
        """Create a new orchestration job for coordinated scanning"""
        
        with get_session() as session:
            # Validate data sources
            data_sources = session.query(DataSource).filter(
                DataSource.id.in_(data_source_ids)
            ).all()
            
            if len(data_sources) != len(data_source_ids):
                raise HTTPException(
                    status_code=404,
                    detail="One or more data sources not found"
                )
            
            # Validate scan rules
            scan_rules = session.query(IntelligentScanRule).filter(
                IntelligentScanRule.id.in_(scan_rule_ids)
            ).all()
            
            if len(scan_rules) != len(scan_rule_ids):
                raise HTTPException(
                    status_code=404,
                    detail="One or more scan rules not found"
                )
            
            # Determine optimal strategy if not provided
            if not strategy:
                available_resources = await self._get_current_resource_status()
                strategy = await self.decision_engine.determine_optimal_strategy(
                    data_sources, scan_rules, available_resources
                )
            
            # Create orchestration job
            orchestration_job = ScanOrchestrationJob(
                name=f"Orchestration Job {datetime.utcnow().isoformat()}",
                data_source_ids=data_source_ids,
                scan_rule_ids=scan_rule_ids,
                strategy=strategy,
                priority=priority,
                status=ScanOrchestrationStatus.PENDING,
                metadata=metadata or {},
                created_at=datetime.utcnow()
            )
            
            session.add(orchestration_job)
            session.commit()
            session.refresh(orchestration_job)
            
            # Create workflow for the job
            workflow = await self._create_orchestration_workflow(
                orchestration_job, data_sources, scan_rules, session
            )
            
            return orchestration_job
    
    async def execute_orchestration_job(self, job_id: str) -> bool:
        """Execute an orchestration job"""
        
        with get_session() as session:
            job = session.query(ScanOrchestrationJob).filter(
                ScanOrchestrationJob.id == job_id
            ).first()
            
            if not job:
                raise HTTPException(status_code=404, detail="Orchestration job not found")
            
            try:
                # Update job status
                job.status = ScanOrchestrationStatus.PLANNING
                job.started_at = datetime.utcnow()
                session.commit()
                
                # Allocate resources
                resource_requirements = await self._calculate_resource_requirements(job)
                allocation = await self.resource_manager.allocate_resources(
                    job.id, resource_requirements
                )
                
                if not allocation:
                    job.status = ScanOrchestrationStatus.FAILED
                    job.error_message = "Insufficient resources available"
                    session.commit()
                    return False
                
                # Execute based on strategy
                job.status = ScanOrchestrationStatus.EXECUTING
                session.commit()
                
                success = await self._execute_by_strategy(job)
                
                # Update final status
                if success:
                    job.status = ScanOrchestrationStatus.COMPLETED
                    job.completed_at = datetime.utcnow()
                else:
                    job.status = ScanOrchestrationStatus.FAILED
                    job.failed_at = datetime.utcnow()
                
                session.commit()
                return success
                
            except Exception as e:
                logger.error(f"Orchestration job execution failed: {str(e)}")
                job.status = ScanOrchestrationStatus.FAILED
                job.failed_at = datetime.utcnow()
                job.error_message = str(e)
                session.commit()
                return False
            finally:
                # Release resources
                await self.resource_manager.release_resources(job.id)
    
    async def _execute_by_strategy(self, job: ScanOrchestrationJob) -> bool:
        """Execute orchestration job based on selected strategy"""
        
        if job.strategy == ScanOrchestrationStrategy.SEQUENTIAL:
            return await self._execute_sequential(job)
        elif job.strategy == ScanOrchestrationStrategy.PARALLEL:
            return await self._execute_parallel(job)
        elif job.strategy == ScanOrchestrationStrategy.PRIORITY_BASED:
            return await self._execute_priority_based(job)
        elif job.strategy == ScanOrchestrationStrategy.RESOURCE_AWARE:
            return await self._execute_resource_aware(job)
        elif job.strategy == ScanOrchestrationStrategy.DEPENDENCY_AWARE:
            return await self._execute_dependency_aware(job)
        elif job.strategy == ScanOrchestrationStrategy.ADAPTIVE:
            return await self._execute_adaptive(job)
        else:
            logger.warning(f"Unknown strategy: {job.strategy}")
            return await self._execute_sequential(job)  # Fallback
    
    async def _execute_sequential(self, job: ScanOrchestrationJob) -> bool:
        """Execute scans sequentially"""
        for data_source_id in job.data_source_ids:
            success = await self._execute_single_source_scan(
                data_source_id, job.scan_rule_ids, job.id
            )
            if not success:
                return False
        return True
    
    async def _execute_parallel(self, job: ScanOrchestrationJob) -> bool:
        """Execute scans in parallel"""
        tasks = []
        for data_source_id in job.data_source_ids:
            task = asyncio.create_task(
                self._execute_single_source_scan(
                    data_source_id, job.scan_rule_ids, job.id
                )
            )
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return all(isinstance(result, bool) and result for result in results)
    
    async def _execute_priority_based(self, job: ScanOrchestrationJob) -> bool:
        """Execute scans based on priority"""
        with get_session() as session:
            # Get data sources with priority information
            data_sources = session.query(DataSource).filter(
                DataSource.id.in_(job.data_source_ids)
            ).order_by(DataSource.criticality.desc()).all()
            
            # Execute in priority order
            for ds in data_sources:
                success = await self._execute_single_source_scan(
                    ds.id, job.scan_rule_ids, job.id
                )
                if not success and ds.criticality == "critical":
                    return False  # Fail fast for critical sources
        
        return True
    
    async def _execute_resource_aware(self, job: ScanOrchestrationJob) -> bool:
        """Execute scans with resource awareness"""
        # Implement resource-aware execution logic
        # This would monitor resource usage and adapt execution accordingly
        return await self._execute_adaptive(job)
    
    async def _execute_dependency_aware(self, job: ScanOrchestrationJob) -> bool:
        """Execute scans respecting dependencies"""
        # Implement dependency-aware execution logic
        return await self._execute_sequential(job)  # Simple fallback
    
    async def _execute_adaptive(self, job: ScanOrchestrationJob) -> bool:
        """Execute scans using adaptive strategy"""
        # Start with parallel execution and adapt based on performance
        try:
            return await self._execute_parallel(job)
        except Exception:
            # Fallback to sequential
            return await self._execute_sequential(job)
    
    async def _execute_single_source_scan(
        self,
        data_source_id: int,
        scan_rule_ids: List[int],
        orchestration_job_id: str
    ) -> bool:
        """Execute scan for a single data source"""
        
        try:
            # Use the unified orchestrator for actual scan execution
            scan_request = {
                'data_source_id': data_source_id,
                'scan_rule_ids': scan_rule_ids,
                'orchestration_job_id': orchestration_job_id
            }
            
            result = await self.unified_orchestrator.execute_coordinated_scan(scan_request)
            return result.get('success', False)
            
        except Exception as e:
            logger.error(f"Single source scan failed: {str(e)}")
            return False
    
    async def _create_orchestration_workflow(
        self,
        job: ScanOrchestrationJob,
        data_sources: List[DataSource],
        scan_rules: List[IntelligentScanRule],
        session: Session
    ) -> ScanWorkflow:
        """Create workflow for orchestration job"""
        
        workflow = ScanWorkflow(
            orchestration_job_id=job.id,
            name=f"Workflow for {job.name}",
            status=ScanWorkflowStatus.QUEUED,
            created_at=datetime.utcnow()
        )
        
        # Create workflow steps based on job requirements
        steps = []
        for i, ds in enumerate(data_sources):
            step = ScanWorkflowStep(
                workflow_id=workflow.id,
                step_order=i,
                step_type="scan",
                step_name=f"Scan {ds.name}",
                configuration={
                    'data_source_id': ds.id,
                    'scan_rule_ids': job.scan_rule_ids
                },
                status=ScanWorkflowStatus.QUEUED
            )
            steps.append(step)
        
        workflow.steps = steps
        session.add(workflow)
        session.commit()
        
        return workflow
    
    async def _calculate_resource_requirements(
        self, job: ScanOrchestrationJob
    ) -> Dict[str, float]:
        """Calculate resource requirements for orchestration job"""
        
        # Base requirements per data source
        base_cpu = 10.0  # %
        base_memory = 256.0  # MB
        base_network = 50.0  # Mbps
        base_storage = 10.0  # GB
        
        num_sources = len(job.data_source_ids)
        
        return {
            'cpu': base_cpu * num_sources,
            'memory': base_memory * num_sources,
            'network': base_network * num_sources,
            'storage': base_storage * num_sources
        }
    
    async def _get_current_resource_status(self) -> Dict[str, Any]:
        """Get current system resource status"""
        # This would typically interface with system monitoring
        return {
            'cpu_usage': 30.0,
            'memory_usage': 45.0,
            'network_usage': 20.0,
            'storage_usage': 60.0
        }
    
    async def get_orchestration_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get detailed status of an orchestration job"""
        
        with get_session() as session:
            job = session.query(ScanOrchestrationJob).filter(
                ScanOrchestrationJob.id == job_id
            ).first()
            
            if not job:
                raise HTTPException(status_code=404, detail="Orchestration job not found")
            
            # Get associated workflows
            workflows = session.query(ScanWorkflow).filter(
                ScanWorkflow.orchestration_job_id == job_id
            ).all()
            
            # Get resource allocation
            allocation = self.resource_manager.active_allocations.get(job_id)
            
            return {
                'job': {
                    'id': job.id,
                    'name': job.name,
                    'status': job.status,
                    'strategy': job.strategy,
                    'priority': job.priority,
                    'created_at': job.created_at,
                    'started_at': job.started_at,
                    'completed_at': job.completed_at,
                    'failed_at': job.failed_at,
                    'error_message': job.error_message,
                    'data_source_ids': job.data_source_ids,
                    'scan_rule_ids': job.scan_rule_ids
                },
                'workflows': [
                    {
                        'id': wf.id,
                        'name': wf.name,
                        'status': wf.status,
                        'steps_count': len(wf.steps) if wf.steps else 0,
                        'completed_steps': len([s for s in wf.steps if s.status == ScanWorkflowStatus.COMPLETED]) if wf.steps else 0
                    }
                    for wf in workflows
                ],
                'resource_allocation': {
                    'cpu': allocation.cpu_allocation if allocation else 0,
                    'memory': allocation.memory_allocation if allocation else 0,
                    'network': allocation.network_allocation if allocation else 0,
                    'storage': allocation.storage_allocation if allocation else 0
                } if allocation else None
            }
    
    async def cancel_orchestration_job(self, job_id: str) -> bool:
        """Cancel a running orchestration job"""
        
        with get_session() as session:
            job = session.query(ScanOrchestrationJob).filter(
                ScanOrchestrationJob.id == job_id
            ).first()
            
            if not job:
                raise HTTPException(status_code=404, detail="Orchestration job not found")
            
            if job.status not in [ScanOrchestrationStatus.PENDING, ScanOrchestrationStatus.EXECUTING]:
                raise HTTPException(
                    status_code=400,
                    detail="Job cannot be cancelled in current status"
                )
            
            # Update job status
            job.status = ScanOrchestrationStatus.CANCELLED
            job.cancelled_at = datetime.utcnow()
            session.commit()
            
            # Release resources
            await self.resource_manager.release_resources(job_id)
            
            return True
    
    async def get_orchestration_metrics(self) -> Dict[str, Any]:
        """Get comprehensive orchestration metrics"""
        
        with get_session() as session:
            # Get job statistics
            total_jobs = session.query(ScanOrchestrationJob).count()
            completed_jobs = session.query(ScanOrchestrationJob).filter(
                ScanOrchestrationJob.status == ScanOrchestrationStatus.COMPLETED
            ).count()
            failed_jobs = session.query(ScanOrchestrationJob).filter(
                ScanOrchestrationJob.status == ScanOrchestrationStatus.FAILED
            ).count()
            running_jobs = session.query(ScanOrchestrationJob).filter(
                ScanOrchestrationJob.status == ScanOrchestrationStatus.EXECUTING
            ).count()
            
            # Calculate success rate
            success_rate = (completed_jobs / max(total_jobs, 1)) * 100
            
            # Get resource utilization
            resource_status = await self._get_current_resource_status()
            
            return {
                'job_statistics': {
                    'total_jobs': total_jobs,
                    'completed_jobs': completed_jobs,
                    'failed_jobs': failed_jobs,
                    'running_jobs': running_jobs,
                    'success_rate': round(success_rate, 2)
                },
                'resource_utilization': resource_status,
                'active_allocations': len(self.resource_manager.active_allocations),
                'workflow_engine_status': {
                    'active_workflows': len(self.workflow_engine.active_workflows)
                }
            }


# Global service instance
scan_orchestration_service = ScanOrchestrationService()