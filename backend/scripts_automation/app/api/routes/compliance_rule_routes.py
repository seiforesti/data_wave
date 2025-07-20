from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db_session import get_session
from app.services.compliance_service import ComplianceService
from app.models.compliance_models import (
    ComplianceRequirementCreate,
    ComplianceRequirementUpdate,
    ComplianceRequirementResponse,
    ComplianceFramework,
)
from app.api.security import require_permission
from app.api.security.rbac import (
    PERMISSION_COMPLIANCE_VIEW,
    PERMISSION_COMPLIANCE_MANAGE,
)

router = APIRouter(prefix="/compliance", tags=["Compliance Rules"])


def _requirement_to_rule(req: ComplianceRequirementResponse) -> Dict[str, Any]:
    """Convert ComplianceRequirementResponse to frontend ComplianceRule shape."""
    return {
        "id": req.id,
        "name": req.title,
        "description": req.description,
        "category": req.category,
        "severity": req.risk_level or "medium",
        "compliance_standard": req.framework.value if hasattr(req.framework, "value") else str(req.framework),
        "applies_to": "table",
        "rule_type": "custom",
        "rule_definition": "",
        "status": "active" if req.status.value if hasattr(req.status, "value") else str(req.status) else "draft",
        "is_global": False,
        "data_source_ids": [req.data_source_id],
        "remediation_steps": req.remediation_plan,
        "validation_frequency": "monthly",
        "auto_remediation": False,
        "business_impact": req.risk_level or "medium",
        "regulatory_requirement": True,
        "tags": [req.framework.value] if hasattr(req.framework, "value") else [str(req.framework)],
        "created_at": "",
        "created_by": "",
        "updated_at": "",
        "updated_by": "",
        "pass_rate": req.compliance_percentage,
        "total_entities": 0,
        "passing_entities": 0,
        "failing_entities": 0,
        "last_validation": req.last_assessed.isoformat() if req.last_assessed else None,
        "escalation_rules": [],
        "audit_trail": [],
    }


@router.get("/rules")
async def list_rules(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COMPLIANCE_VIEW)),
):
    """List compliance rules (mapped from requirements)."""
    requirements = ComplianceService.get_requirements(session, data_source_id)
    return {
        "success": True,
        "data": [_requirement_to_rule(r) for r in requirements],
    }


@router.post("/rules")
async def create_rule(
    rule_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COMPLIANCE_MANAGE)),
):
    """Create a new compliance rule (requirement)."""
    try:
        create_model = ComplianceRequirementCreate(
            data_source_id=rule_data.get("data_source_ids", [1])[0],
            framework=ComplianceFramework(rule_data.get("compliance_standard", "custom").lower()),
            requirement_id=rule_data.get("rule_definition", rule_data.get("name")),
            title=rule_data.get("name"),
            description=rule_data.get("description", ""),
            category=rule_data.get("category", "general"),
            risk_level=rule_data.get("severity", "medium"),
        )
        req_resp = ComplianceService.create_requirement(session, create_model, current_user.get("user_id", "system"))
        return {"success": True, "data": _requirement_to_rule(req_resp)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/rules/{rule_id}")
async def update_rule(
    rule_id: int,
    rule_update: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COMPLIANCE_MANAGE)),
):
    try:
        update_model = ComplianceRequirementUpdate(
            compliance_percentage=rule_update.get("pass_rate"),
            remediation_plan=rule_update.get("remediation_steps"),
            remediation_owner=rule_update.get("updated_by"),
            # map status
        )
        req_resp = ComplianceService.update_requirement(session, rule_id, update_model, current_user.get("user_id", "system"))
        return {"success": True, "data": _requirement_to_rule(req_resp)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/rules/{rule_id}")
async def delete_rule(
    rule_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COMPLIANCE_MANAGE)),
):
    try:
        # Soft delete: update status to archived
        update_model = ComplianceRequirementUpdate(status="archived")
        ComplianceService.update_requirement(session, rule_id, update_model, current_user.get("user_id", "system"))
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/rules/{rule_id}/validate")
async def validate_rule(
    rule_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COMPLIANCE_MANAGE)),
):
    """Placeholder validate rule implementation."""
    try:
        # For demo, just return the existing rule
        req_resp = session.get(ComplianceService.get_requirements(session, data_source_id=1)[0].__class__, rule_id)
        return {"success": True, "data": _requirement_to_rule(req_resp)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))