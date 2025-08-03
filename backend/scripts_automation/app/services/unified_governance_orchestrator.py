"""
Unified Governance Orchestrator - Enterprise Data Governance System
===================================================================

Central orchestrator that coordinates and integrates all 6 data governance groups:
- Data Sources
- Advanced Catalog
- Classifications  
- Compliance Rules
- Scan Rule Sets
- Scan Logic

Features:
- Cross-group workflow orchestration
- Shared service coordination
- Real-time event synchronization
- Inter-group dependency management
- Unified audit and monitoring
- Advanced collaboration workflows
- Enterprise-grade performance optimization
"""

import asyncio
from typing import Dict, List, Optional, Any, Set, Callable, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import json
import logging
from sqlalchemy.orm import Session
from concurrent.futures import ThreadPoolExecutor, as_completed
import uuid

from app.models.auth_models import User
from app.services.unified_rbac_service import UnifiedRBACService
from app.db_session import get_session

# Import services from all 6 groups
from app.services.data_source_service import DataSourceService
from app.services.enterprise_catalog_service import EnterpriseIntelligentCatalogService
from app.services.classification_service import ClassificationService
from app.services.compliance_rule_service import ComplianceRuleService
from app.services.enterprise_scan_rule_service import EnterpriseAdvancedScanRuleService
from app.services.scan_intelligence_service import ScanIntelligenceService

# Configure logging
logger = logging.getLogger(__name__)


# ===============================================================================
# ORCHESTRATION TYPES AND ENUMS
# ===============================================================================

class EventType(Enum):
    """Types of governance events that can be orchestrated"""
    DATA_SOURCE_CREATED = "data_source_created"
    DATA_SOURCE_UPDATED = "data_source_updated"
    DATA_SOURCE_SCANNED = "data_source_scanned"
    ASSET_DISCOVERED = "asset_discovered"
    CLASSIFICATION_APPLIED = "classification_applied"
    COMPLIANCE_VIOLATION = "compliance_violation"
    SCAN_RULE_EXECUTED = "scan_rule_executed"
    WORKFLOW_TRIGGERED = "workflow_triggered"
    COLLABORATION_INITIATED = "collaboration_initiated"
    QUALITY_ALERT = "quality_alert"
    SECURITY_INCIDENT = "security_incident"


class WorkflowStatus(Enum):
    """Status of orchestrated workflows"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class ServiceGroup(Enum):
    """The 6 core service groups"""
    DATA_SOURCES = "data_sources"
    CATALOG = "catalog"
    CLASSIFICATIONS = "classifications"
    COMPLIANCE = "compliance"
    SCAN_RULESETS = "scan_rulesets"
    SCAN_LOGIC = "scan_logic"


@dataclass
class GovernanceEvent:
    """Unified event structure for cross-group communication"""
    id: str
    type: EventType
    source_group: ServiceGroup
    target_groups: List[ServiceGroup]
    payload: Dict[str, Any]
    timestamp: datetime
    user_id: Optional[int] = None
    correlation_id: Optional[str] = None
    priority: int = 5  # 1=highest, 10=lowest
    retry_count: int = 0
    max_retries: int = 3
    depends_on: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class WorkflowDefinition:
    """Definition of a cross-group workflow"""
    id: str
    name: str
    description: str
    trigger_events: List[EventType]
    steps: List[Dict[str, Any]]
    groups_involved: List[ServiceGroup]
    requires_approval: bool = False
    timeout_minutes: int = 60
    rbac_permissions: List[str] = field(default_factory=list)
    condition_checks: List[str] = field(default_factory=list)


@dataclass
class WorkflowExecution:
    """Active workflow execution instance"""
    id: str
    workflow_id: str
    status: WorkflowStatus
    current_step: int
    started_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    context: Dict[str, Any] = field(default_factory=dict)
    results: Dict[str, Any] = field(default_factory=dict)
    user_id: Optional[int] = None


# ===============================================================================
# UNIFIED GOVERNANCE ORCHESTRATOR
# ===============================================================================

class UnifiedGovernanceOrchestrator:
    """
    Central orchestrator for coordinating all data governance activities
    across the 6 core groups with enterprise-grade features.
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.rbac_service = UnifiedRBACService(db_session)
        
        # Initialize service connections
        self.services = {
            ServiceGroup.DATA_SOURCES: DataSourceService(),
            ServiceGroup.CATALOG: EnterpriseIntelligentCatalogService(),
            ServiceGroup.CLASSIFICATIONS: ClassificationService(),
            ServiceGroup.COMPLIANCE: ComplianceRuleService(),
            ServiceGroup.SCAN_RULESETS: EnterpriseAdvancedScanRuleService(),
            ServiceGroup.SCAN_LOGIC: ScanIntelligenceService()
        }
        
        # Event handling
        self.event_queue: asyncio.Queue = asyncio.Queue()
        self.event_handlers: Dict[EventType, List[Callable]] = {}
        self.active_workflows: Dict[str, WorkflowExecution] = {}
        self.workflow_definitions: Dict[str, WorkflowDefinition] = {}
        
        # Performance tracking
        self.metrics = {
            'events_processed': 0,
            'workflows_executed': 0,
            'cross_group_operations': 0,
            'average_response_time': 0.0,
            'error_rate': 0.0
        }
        
        # Initialize default workflows
        self._initialize_default_workflows()
        
        # Start background processors
        self.executor = ThreadPoolExecutor(max_workers=10)
        self._start_background_tasks()

    # ===============================================================================
    # CORE ORCHESTRATION METHODS
    # ===============================================================================

    async def emit_event(
        self, 
        event_type: EventType, 
        source_group: ServiceGroup,
        payload: Dict[str, Any],
        target_groups: Optional[List[ServiceGroup]] = None,
        user_id: Optional[int] = None,
        priority: int = 5,
        correlation_id: Optional[str] = None
    ) -> str:
        """
        Emit a governance event that will be processed by relevant services
        """
        event_id = str(uuid.uuid4())
        
        event = GovernanceEvent(
            id=event_id,
            type=event_type,
            source_group=source_group,
            target_groups=target_groups or list(ServiceGroup),
            payload=payload,
            timestamp=datetime.utcnow(),
            user_id=user_id,
            correlation_id=correlation_id or str(uuid.uuid4()),
            priority=priority
        )
        
        # Queue the event for processing
        await self.event_queue.put(event)
        
        logger.info(
            f"Event emitted: {event_type.value} from {source_group.value} "
            f"(ID: {event_id}, Correlation: {event.correlation_id})"
        )
        
        return event_id

    async def process_event(self, event: GovernanceEvent) -> Dict[str, Any]:
        """
        Process a governance event and trigger appropriate cross-group actions
        """
        start_time = datetime.utcnow()
        results = {}
        
        try:
            # Check RBAC permissions
            if event.user_id:
                user_allowed = await self._check_event_permissions(event)
                if not user_allowed:
                    raise PermissionError(f"User {event.user_id} not authorized for event {event.type.value}")
            
            # Execute registered event handlers
            if event.type in self.event_handlers:
                for handler in self.event_handlers[event.type]:
                    try:
                        result = await handler(event)
                        results[f"handler_{handler.__name__}"] = result
                    except Exception as e:
                        logger.error(f"Event handler {handler.__name__} failed: {e}")
                        results[f"handler_{handler.__name__}_error"] = str(e)
            
            # Trigger workflows based on event
            workflow_results = await self._trigger_workflows(event)
            results['workflows'] = workflow_results
            
            # Update metrics
            self.metrics['events_processed'] += 1
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            self._update_metrics('event_processing_time', processing_time)
            
            logger.info(f"Event processed successfully: {event.id}")
            return results
            
        except Exception as e:
            logger.error(f"Event processing failed: {event.id} - {e}")
            self.metrics['error_rate'] += 1
            raise

    async def execute_workflow(
        self, 
        workflow_id: str, 
        context: Dict[str, Any],
        user_id: Optional[int] = None
    ) -> WorkflowExecution:
        """
        Execute a predefined workflow across multiple service groups
        """
        if workflow_id not in self.workflow_definitions:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow_def = self.workflow_definitions[workflow_id]
        execution_id = str(uuid.uuid4())
        
        # Check RBAC permissions
        if user_id:
            for permission in workflow_def.rbac_permissions:
                allowed, reason = self.rbac_service.evaluate_permission(
                    user_id, permission.split('.')[1], permission.split('.')[0]
                )
                if not allowed:
                    raise PermissionError(f"User {user_id} missing permission: {permission}")
        
        # Create workflow execution
        execution = WorkflowExecution(
            id=execution_id,
            workflow_id=workflow_id,
            status=WorkflowStatus.RUNNING,
            current_step=0,
            started_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            context=context,
            user_id=user_id
        )
        
        self.active_workflows[execution_id] = execution
        
        try:
            # Execute workflow steps
            await self._execute_workflow_steps(execution, workflow_def)
            
            execution.status = WorkflowStatus.COMPLETED
            execution.completed_at = datetime.utcnow()
            execution.updated_at = datetime.utcnow()
            
            self.metrics['workflows_executed'] += 1
            logger.info(f"Workflow executed successfully: {workflow_id} (Execution: {execution_id})")
            
        except Exception as e:
            execution.status = WorkflowStatus.FAILED
            execution.error_message = str(e)
            execution.updated_at = datetime.utcnow()
            logger.error(f"Workflow execution failed: {workflow_id} - {e}")
            raise
        
        return execution

    # ===============================================================================
    # CROSS-GROUP INTEGRATION METHODS
    # ===============================================================================

    async def sync_data_source_to_catalog(
        self, 
        data_source_id: int, 
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Synchronize data source metadata to the catalog
        """
        try:
            # Get data source details
            data_source = await self.services[ServiceGroup.DATA_SOURCES].get_data_source(data_source_id)
            
            # Create or update catalog asset
            catalog_service = self.services[ServiceGroup.CATALOG]
            asset_data = {
                'name': data_source['name'],
                'type': 'data_source',
                'source_id': data_source_id,
                'metadata': {
                    'connection_type': data_source.get('type'),
                    'status': data_source.get('status'),
                    'last_scan': data_source.get('last_scan'),
                    'source_system': 'data_governance'
                },
                'properties': data_source.get('properties', {}),
                'tags': data_source.get('tags', []),
                'description': data_source.get('description')
            }
            
            catalog_asset = await catalog_service.create_or_update_asset(asset_data)
            
            # Emit event for further processing
            await self.emit_event(
                EventType.ASSET_DISCOVERED,
                ServiceGroup.CATALOG,
                {
                    'asset_id': catalog_asset['id'],
                    'data_source_id': data_source_id,
                    'sync_type': 'data_source_metadata'
                },
                user_id=user_id
            )
            
            return {
                'success': True,
                'catalog_asset_id': catalog_asset['id'],
                'data_source_id': data_source_id
            }
            
        except Exception as e:
            logger.error(f"Failed to sync data source {data_source_id} to catalog: {e}")
            raise

    async def apply_classifications_to_scan_results(
        self, 
        scan_run_id: str, 
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Apply classification rules to scan results and update catalog
        """
        try:
            # Get scan results
            scan_service = self.services[ServiceGroup.SCAN_LOGIC]
            scan_results = await scan_service.get_scan_results(scan_run_id)
            
            # Get applicable classification rules
            classification_service = self.services[ServiceGroup.CLASSIFICATIONS]
            rules = await classification_service.get_active_rules()
            
            results = {
                'entities_classified': 0,
                'classifications_applied': [],
                'catalog_updates': 0
            }
            
            # Apply classifications to discovered entities
            for entity in scan_results.get('discovered_entities', []):
                # Apply classification rules
                for rule in rules:
                    if await self._entity_matches_rule(entity, rule):
                        classification = await classification_service.apply_classification(
                            entity['id'], rule['id'], user_id
                        )
                        results['classifications_applied'].append({
                            'entity_id': entity['id'],
                            'classification': classification,
                            'rule_id': rule['id']
                        })
                
                # Update catalog with classifications
                catalog_service = self.services[ServiceGroup.CATALOG]
                await catalog_service.update_asset_classifications(
                    entity['catalog_asset_id'], 
                    [c['classification'] for c in results['classifications_applied'] 
                     if c['entity_id'] == entity['id']]
                )
                results['catalog_updates'] += 1
                results['entities_classified'] += 1
            
            # Emit event for compliance checking
            await self.emit_event(
                EventType.CLASSIFICATION_APPLIED,
                ServiceGroup.CLASSIFICATIONS,
                {
                    'scan_run_id': scan_run_id,
                    'classifications_count': len(results['classifications_applied']),
                    'results': results
                },
                target_groups=[ServiceGroup.COMPLIANCE],
                user_id=user_id
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to apply classifications to scan {scan_run_id}: {e}")
            raise

    async def execute_compliance_validation(
        self, 
        asset_id: str, 
        classification_data: Dict[str, Any],
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Execute compliance validation based on asset classifications
        """
        try:
            compliance_service = self.services[ServiceGroup.COMPLIANCE]
            
            # Get applicable compliance rules
            compliance_rules = await compliance_service.get_rules_for_classification(
                classification_data.get('classification_type')
            )
            
            validation_results = {
                'asset_id': asset_id,
                'compliance_status': 'compliant',
                'violations': [],
                'recommendations': [],
                'risk_score': 0
            }
            
            # Execute compliance checks
            for rule in compliance_rules:
                result = await compliance_service.validate_asset_compliance(
                    asset_id, rule['id'], classification_data
                )
                
                if not result['compliant']:
                    validation_results['compliance_status'] = 'non_compliant'
                    validation_results['violations'].append({
                        'rule_id': rule['id'],
                        'rule_name': rule['name'],
                        'severity': result['severity'],
                        'details': result['details']
                    })
                    validation_results['risk_score'] += result.get('risk_points', 1)
                
                validation_results['recommendations'].extend(result.get('recommendations', []))
            
            # Update catalog with compliance status
            catalog_service = self.services[ServiceGroup.CATALOG]
            await catalog_service.update_asset_compliance(asset_id, validation_results)
            
            # Emit compliance event if violations found
            if validation_results['violations']:
                await self.emit_event(
                    EventType.COMPLIANCE_VIOLATION,
                    ServiceGroup.COMPLIANCE,
                    validation_results,
                    target_groups=[ServiceGroup.CATALOG, ServiceGroup.SCAN_LOGIC],
                    user_id=user_id,
                    priority=2  # High priority for violations
                )
            
            return validation_results
            
        except Exception as e:
            logger.error(f"Compliance validation failed for asset {asset_id}: {e}")
            raise

    async def orchestrate_intelligent_scan(
        self, 
        data_source_id: int, 
        scan_type: str = "comprehensive",
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Orchestrate an intelligent scan that coordinates all service groups
        """
        try:
            orchestration_id = str(uuid.uuid4())
            
            # Phase 1: Prepare scan with rule sets
            scan_ruleset_service = self.services[ServiceGroup.SCAN_RULESETS]
            optimal_rules = await scan_ruleset_service.get_optimal_rules_for_source(
                data_source_id, scan_type
            )
            
            # Phase 2: Execute scan with intelligence
            scan_service = self.services[ServiceGroup.SCAN_LOGIC]
            scan_config = {
                'data_source_id': data_source_id,
                'scan_type': scan_type,
                'rule_sets': [rule['id'] for rule in optimal_rules],
                'orchestration_id': orchestration_id,
                'enable_classification': True,
                'enable_compliance': True,
                'enable_quality_assessment': True
            }
            
            scan_run = await scan_service.execute_scan(scan_config, user_id)
            
            # Phase 3: Real-time processing during scan
            async def process_scan_progress():
                while True:
                    status = await scan_service.get_scan_status(scan_run['id'])
                    
                    if status['status'] == 'completed':
                        # Apply classifications
                        classification_results = await self.apply_classifications_to_scan_results(
                            scan_run['id'], user_id
                        )
                        
                        # Sync to catalog
                        catalog_sync = await self.sync_data_source_to_catalog(
                            data_source_id, user_id
                        )
                        
                        # Execute compliance validation
                        compliance_results = []
                        for entity in status.get('discovered_entities', []):
                            if entity.get('classifications'):
                                comp_result = await self.execute_compliance_validation(
                                    entity['catalog_asset_id'],
                                    {'classification_type': entity['classifications'][0]},
                                    user_id
                                )
                                compliance_results.append(comp_result)
                        
                        return {
                            'scan_run': scan_run,
                            'classification_results': classification_results,
                            'catalog_sync': catalog_sync,
                            'compliance_results': compliance_results,
                            'orchestration_id': orchestration_id
                        }
                    
                    elif status['status'] in ['failed', 'cancelled']:
                        raise Exception(f"Scan failed: {status.get('error_message')}")
                    
                    await asyncio.sleep(10)  # Check every 10 seconds
            
            # Start processing and wait for completion
            results = await asyncio.wait_for(process_scan_progress(), timeout=3600)  # 1 hour timeout
            
            # Emit completion event
            await self.emit_event(
                EventType.SCAN_RULE_EXECUTED,
                ServiceGroup.SCAN_LOGIC,
                {
                    'orchestration_id': orchestration_id,
                    'data_source_id': data_source_id,
                    'results_summary': {
                        'entities_discovered': len(results.get('scan_run', {}).get('discovered_entities', [])),
                        'classifications_applied': results.get('classification_results', {}).get('entities_classified', 0),
                        'compliance_violations': len([r for r in results.get('compliance_results', []) 
                                                    if r.get('compliance_status') == 'non_compliant'])
                    }
                },
                user_id=user_id
            )
            
            self.metrics['cross_group_operations'] += 1
            return results
            
        except Exception as e:
            logger.error(f"Intelligent scan orchestration failed: {e}")
            raise

    # ===============================================================================
    # COLLABORATION AND WORKFLOW METHODS
    # ===============================================================================

    async def initiate_collaborative_workflow(
        self, 
        workflow_type: str,
        participants: List[int],  # User IDs
        context: Dict[str, Any],
        initiator_id: int
    ) -> str:
        """
        Initiate a collaborative workflow involving multiple users and groups
        """
        workflow_id = f"collaborative_{workflow_type}_{str(uuid.uuid4())[:8]}"
        
        # Create collaboration context
        collaboration_context = {
            'workflow_id': workflow_id,
            'type': workflow_type,
            'participants': participants,
            'initiator_id': initiator_id,
            'created_at': datetime.utcnow().isoformat(),
            'status': 'active',
            'context': context
        }
        
        # Notify all participants
        for participant_id in participants:
            await self.emit_event(
                EventType.COLLABORATION_INITIATED,
                ServiceGroup.CATALOG,  # Default source group for collaboration
                {
                    'collaboration_id': workflow_id,
                    'participant_id': participant_id,
                    'initiator_id': initiator_id,
                    'context': collaboration_context
                },
                user_id=initiator_id
            )
        
        # Store collaboration state
        # In production, this would be stored in database
        
        return workflow_id

    # ===============================================================================
    # WORKFLOW DEFINITIONS
    # ===============================================================================

    def _initialize_default_workflows(self):
        """Initialize default cross-group workflows"""
        
        # Data Discovery and Classification Workflow
        self.workflow_definitions['data_discovery_classification'] = WorkflowDefinition(
            id='data_discovery_classification',
            name='Data Discovery and Classification',
            description='Discover, scan, classify, and validate compliance for new data sources',
            trigger_events=[EventType.DATA_SOURCE_CREATED],
            groups_involved=[
                ServiceGroup.DATA_SOURCES, 
                ServiceGroup.SCAN_LOGIC, 
                ServiceGroup.CLASSIFICATIONS,
                ServiceGroup.CATALOG,
                ServiceGroup.COMPLIANCE
            ],
            steps=[
                {'action': 'validate_data_source', 'group': 'data_sources'},
                {'action': 'create_scan_config', 'group': 'scan_logic'},
                {'action': 'execute_scan', 'group': 'scan_logic'},
                {'action': 'apply_classifications', 'group': 'classifications'},
                {'action': 'sync_to_catalog', 'group': 'catalog'},
                {'action': 'validate_compliance', 'group': 'compliance'}
            ],
            rbac_permissions=[
                'datasource.view', 'scan.create', 'classification.apply', 
                'catalog.create', 'compliance.validate'
            ]
        )
        
        # Compliance Violation Response Workflow
        self.workflow_definitions['compliance_violation_response'] = WorkflowDefinition(
            id='compliance_violation_response',
            name='Compliance Violation Response',
            description='Automated response to compliance violations with remediation',
            trigger_events=[EventType.COMPLIANCE_VIOLATION],
            groups_involved=[
                ServiceGroup.COMPLIANCE,
                ServiceGroup.CATALOG,
                ServiceGroup.SCAN_LOGIC,
                ServiceGroup.CLASSIFICATIONS
            ],
            steps=[
                {'action': 'assess_violation_severity', 'group': 'compliance'},
                {'action': 'update_asset_status', 'group': 'catalog'},
                {'action': 'trigger_remediation_scan', 'group': 'scan_logic'},
                {'action': 'notify_stakeholders', 'group': 'compliance'}
            ],
            requires_approval=True,
            rbac_permissions=['compliance.manage', 'catalog.edit']
        )

    async def _execute_workflow_steps(
        self, 
        execution: WorkflowExecution, 
        workflow_def: WorkflowDefinition
    ):
        """Execute the steps of a workflow definition"""
        
        for i, step in enumerate(workflow_def.steps):
            execution.current_step = i
            execution.updated_at = datetime.utcnow()
            
            try:
                # Execute step based on action and group
                result = await self._execute_workflow_step(step, execution.context)
                execution.results[f"step_{i}"] = result
                
            except Exception as e:
                execution.error_message = f"Step {i} failed: {str(e)}"
                raise

    async def _execute_workflow_step(
        self, 
        step: Dict[str, Any], 
        context: Dict[str, Any]
    ) -> Any:
        """Execute a single workflow step"""
        
        action = step['action']
        group = step['group']
        
        # Map actions to service methods
        if group == 'data_sources' and action == 'validate_data_source':
            data_source_id = context.get('data_source_id')
            return await self.services[ServiceGroup.DATA_SOURCES].validate_connection(data_source_id)
        
        elif group == 'scan_logic' and action == 'execute_scan':
            scan_config = context.get('scan_config', {})
            return await self.services[ServiceGroup.SCAN_LOGIC].execute_scan(scan_config)
        
        # Add more action mappings as needed
        else:
            logger.warning(f"Unknown workflow step: {action} in group {group}")
            return {'status': 'skipped', 'reason': 'action_not_implemented'}

    # ===============================================================================
    # EVENT HANDLING AND UTILITIES
    # ===============================================================================

    def register_event_handler(self, event_type: EventType, handler: Callable):
        """Register a handler for a specific event type"""
        if event_type not in self.event_handlers:
            self.event_handlers[event_type] = []
        self.event_handlers[event_type].append(handler)

    async def _trigger_workflows(self, event: GovernanceEvent) -> List[str]:
        """Trigger workflows based on an event"""
        triggered_workflows = []
        
        for workflow_id, workflow_def in self.workflow_definitions.items():
            if event.type in workflow_def.trigger_events:
                try:
                    execution = await self.execute_workflow(
                        workflow_id, 
                        event.payload, 
                        event.user_id
                    )
                    triggered_workflows.append(execution.id)
                except Exception as e:
                    logger.error(f"Failed to trigger workflow {workflow_id}: {e}")
        
        return triggered_workflows

    async def _check_event_permissions(self, event: GovernanceEvent) -> bool:
        """Check if user has permission to emit this event"""
        if not event.user_id:
            return True  # System events don't require user permissions
        
        # Check basic permission based on source group
        permission_map = {
            ServiceGroup.DATA_SOURCES: 'datasource.view',
            ServiceGroup.CATALOG: 'catalog.view',
            ServiceGroup.CLASSIFICATIONS: 'classification.view',
            ServiceGroup.COMPLIANCE: 'compliance.view',
            ServiceGroup.SCAN_RULESETS: 'scan.ruleset.view',
            ServiceGroup.SCAN_LOGIC: 'scan.view'
        }
        
        required_permission = permission_map.get(event.source_group)
        if required_permission:
            allowed, _ = self.rbac_service.evaluate_permission(
                event.user_id, 
                required_permission.split('.')[1], 
                required_permission.split('.')[0]
            )
            return allowed
        
        return True

    async def _entity_matches_rule(self, entity: Dict[str, Any], rule: Dict[str, Any]) -> bool:
        """Check if an entity matches a classification rule"""
        # Simplified rule matching logic
        # In production, this would be more sophisticated
        rule_patterns = rule.get('patterns', [])
        entity_name = entity.get('name', '').lower()
        entity_type = entity.get('type', '').lower()
        
        for pattern in rule_patterns:
            if pattern.lower() in entity_name or pattern.lower() in entity_type:
                return True
        
        return False

    def _update_metrics(self, metric_name: str, value: float):
        """Update performance metrics"""
        if metric_name == 'event_processing_time':
            current_avg = self.metrics.get('average_response_time', 0.0)
            total_events = self.metrics.get('events_processed', 1)
            new_avg = (current_avg * (total_events - 1) + value) / total_events
            self.metrics['average_response_time'] = new_avg

    def _start_background_tasks(self):
        """Start background processing tasks"""
        # In production, these would be proper async tasks
        pass

    # ===============================================================================
    # PUBLIC API METHODS
    # ===============================================================================

    def get_orchestration_metrics(self) -> Dict[str, Any]:
        """Get orchestration performance metrics"""
        return {
            **self.metrics,
            'active_workflows': len(self.active_workflows),
            'registered_workflows': len(self.workflow_definitions),
            'event_handlers': {
                event_type.value: len(handlers) 
                for event_type, handlers in self.event_handlers.items()
            }
        }

    def get_active_workflows(self) -> List[WorkflowExecution]:
        """Get currently active workflows"""
        return list(self.active_workflows.values())

    def get_workflow_status(self, execution_id: str) -> Optional[WorkflowExecution]:
        """Get status of a specific workflow execution"""
        return self.active_workflows.get(execution_id)


# ===============================================================================
# FACTORY AND DEPENDENCY INJECTION
# ===============================================================================

def get_governance_orchestrator(db: Session) -> UnifiedGovernanceOrchestrator:
    """Factory function to get orchestrator instance"""
    return UnifiedGovernanceOrchestrator(db)


# ===============================================================================
# EXAMPLE USAGE AND TESTING
# ===============================================================================

async def example_orchestration_usage():
    """Example of how to use the governance orchestrator"""
    
    # Initialize orchestrator (would be done via DI in production)
    with get_session() as db:
        orchestrator = get_governance_orchestrator(db)
        
        # Example 1: Orchestrate intelligent scan
        scan_results = await orchestrator.orchestrate_intelligent_scan(
            data_source_id=123,
            scan_type="comprehensive",
            user_id=1
        )
        print(f"Scan orchestration completed: {scan_results}")
        
        # Example 2: Emit custom event
        event_id = await orchestrator.emit_event(
            EventType.DATA_SOURCE_CREATED,
            ServiceGroup.DATA_SOURCES,
            {'data_source_id': 123, 'name': 'New Customer DB'},
            user_id=1
        )
        print(f"Event emitted: {event_id}")
        
        # Example 3: Start collaborative workflow
        collab_id = await orchestrator.initiate_collaborative_workflow(
            workflow_type='data_quality_review',
            participants=[1, 2, 3],
            context={'asset_id': 'asset_123'},
            initiator_id=1
        )
        print(f"Collaboration started: {collab_id}")


if __name__ == "__main__":
    asyncio.run(example_orchestration_usage())