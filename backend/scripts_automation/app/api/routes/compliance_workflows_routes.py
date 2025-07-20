from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.db_session import get_session
from app.services.compliance_production_services import ComplianceWorkflowService
from app.models.compliance_extended_models import WorkflowType, WorkflowStatus

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance/workflows", tags=["Compliance Workflows"])

@router.get("/", response_model=Dict[str, Any])
async def get_workflows(
    status: Optional[str] = Query(None, description="Filter by status"),
    workflow_type: Optional[str] = Query(None, description="Filter by workflow type"),
    assigned_to: Optional[str] = Query(None, description="Filter by assignee"),
    rule_id: Optional[int] = Query(None, description="Filter by rule ID"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    """Get compliance workflows with advanced filtering and pagination"""
    try:
        # Convert string parameters to enums if provided
        status_enum = None
        if status:
            try:
                status_enum = WorkflowStatus(status)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
        
        workflow_type_enum = None
        if workflow_type:
            try:
                workflow_type_enum = WorkflowType(workflow_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid workflow type: {workflow_type}")
        
        workflows, total = ComplianceWorkflowService.get_workflows(
            session=session,
            status=status_enum,
            workflow_type=workflow_type_enum,
            assigned_to=assigned_to,
            rule_id=rule_id,
            page=page,
            limit=limit
        )
        
        return {
            "data": workflows,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflows: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Dict[str, Any])
async def create_workflow(
    workflow_data: Dict[str, Any] = Body(..., description="Workflow creation data"),
    created_by: Optional[str] = Query(None, description="User creating the workflow"),
    session: Session = Depends(get_session)
):
    """Create a new compliance workflow with validation"""
    try:
        # Validate required fields
        if not workflow_data.get("name"):
            raise HTTPException(status_code=400, detail="Workflow name is required")
        
        if not workflow_data.get("workflow_type"):
            raise HTTPException(status_code=400, detail="Workflow type is required")
        
        # Validate workflow type
        try:
            WorkflowType(workflow_data["workflow_type"])
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid workflow type: {workflow_data['workflow_type']}")
        
        workflow = ComplianceWorkflowService.create_workflow(
            session=session,
            workflow_data=workflow_data,
            created_by=created_by
        )
        
        return workflow
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error creating workflow: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates", response_model=List[Dict[str, Any]])
async def get_workflow_templates(
    workflow_type: Optional[str] = Query(None, description="Filter by workflow type"),
    framework: Optional[str] = Query(None, description="Filter by framework"),
    session: Session = Depends(get_session)
):
    """Get available workflow templates with filtering"""
    try:
        # Validate workflow type if provided
        workflow_type_enum = None
        if workflow_type:
            try:
                workflow_type_enum = WorkflowType(workflow_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid workflow type: {workflow_type}")
        
        templates = ComplianceWorkflowService.get_workflow_templates(
            session=session,
            workflow_type=workflow_type_enum,
            framework=framework
        )
        
        return templates
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trigger-templates", response_model=List[Dict[str, Any]])
async def get_trigger_templates(
    session: Session = Depends(get_session)
):
    """Get available workflow trigger templates"""
    try:
        triggers = [
            {
                "id": "manual_trigger",
                "name": "Manual Trigger",
                "description": "Manually initiated workflow",
                "type": "manual",
                "config_schema": {
                    "required": ["initiator"],
                    "optional": ["reason", "priority"]
                }
            },
            {
                "id": "scheduled_trigger",
                "name": "Scheduled Trigger",
                "description": "Time-based workflow trigger",
                "type": "scheduled",
                "config_schema": {
                    "required": ["schedule"],
                    "optional": ["timezone", "start_date", "end_date"]
                }
            },
            {
                "id": "compliance_event_trigger",
                "name": "Compliance Event Trigger",
                "description": "Triggered by compliance events",
                "type": "event",
                "config_schema": {
                    "required": ["event_type"],
                    "optional": ["conditions", "filters"]
                }
            },
            {
                "id": "risk_threshold_trigger",
                "name": "Risk Threshold Trigger",
                "description": "Triggered when risk exceeds threshold",
                "type": "condition",
                "config_schema": {
                    "required": ["risk_metric", "threshold"],
                    "optional": ["comparison_operator", "time_window"]
                }
            }
        ]
        
        return triggers
        
    except Exception as e:
        logger.error(f"Error getting trigger templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/action-templates", response_model=List[Dict[str, Any]])
async def get_action_templates(
    session: Session = Depends(get_session)
):
    """Get available workflow action templates"""
    try:
        actions = [
            {
                "id": "send_notification",
                "name": "Send Notification",
                "description": "Send email or in-app notification",
                "type": "notification",
                "config_schema": {
                    "required": ["recipients", "message"],
                    "optional": ["subject", "priority", "channels"]
                }
            },
            {
                "id": "run_scan",
                "name": "Run Compliance Scan",
                "description": "Execute compliance scan on data sources",
                "type": "automation",
                "config_schema": {
                    "required": ["scan_type"],
                    "optional": ["data_sources", "rules", "parameters"]
                }
            },
            {
                "id": "generate_report",
                "name": "Generate Report",
                "description": "Generate compliance report",
                "type": "automation",
                "config_schema": {
                    "required": ["report_template"],
                    "optional": ["data_sources", "filters", "format"]
                }
            },
            {
                "id": "create_ticket",
                "name": "Create Ticket",
                "description": "Create ticket in external system",
                "type": "integration",
                "config_schema": {
                    "required": ["system", "ticket_type"],
                    "optional": ["assignee", "priority", "labels"]
                }
            },
            {
                "id": "approval_required",
                "name": "Approval Required",
                "description": "Request approval from designated approver",
                "type": "approval",
                "config_schema": {
                    "required": ["approver"],
                    "optional": ["approval_criteria", "timeout", "escalation"]
                }
            }
        ]
        
        return actions
        
    except Exception as e:
        logger.error(f"Error getting action templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/templates", response_model=Dict[str, Any])
async def create_workflow_template(
    template_data: Dict[str, Any] = Body(..., description="Workflow template creation data"),
    session: Session = Depends(get_session)
):
    """Create a new workflow template"""
    try:
        template = {
            "id": f"custom_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "name": template_data.get("name", "Custom Workflow Template"),
            "description": template_data.get("description", ""),
            "workflow_type": template_data.get("workflow_type", "custom"),
            "framework": template_data.get("framework", "custom"),
            "steps": template_data.get("steps", []),
            "triggers": template_data.get("triggers", []),
            "estimated_completion": template_data.get("estimated_completion", "TBD"),
            "created_at": datetime.now().isoformat()
        }
        
        return template
        
    except Exception as e:
        logger.error(f"Error creating workflow template: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/instances", response_model=List[Dict[str, Any]])
async def get_active_workflow_instances(
    session: Session = Depends(get_session)
):
    """Get active workflow instances"""
    try:
        instances = [
            {
                "id": 1,
                "workflow_id": 1,
                "workflow_name": "SOC 2 Assessment Workflow",
                "status": "in_progress",
                "current_step": 2,
                "started_at": datetime.now().isoformat(),
                "estimated_completion": "2024-01-25T00:00:00Z",
                "progress_percentage": 40
            },
            {
                "id": 2,
                "workflow_id": 2,
                "workflow_name": "GDPR Remediation Workflow",
                "status": "waiting_approval",
                "current_step": 3,
                "started_at": datetime.now().isoformat(),
                "estimated_completion": "2024-01-30T00:00:00Z",
                "progress_percentage": 75
            }
        ]
        
        return instances
        
    except Exception as e:
        logger.error(f"Error getting workflow instances: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))