from typing import Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlmodel import Session

from app.db_session import get_session
from app.services.advanced_scan_rule_set_service import AdvancedScanRuleSetService, RuleSetCompilerError

router = APIRouter(prefix="/scan-rule-sets", tags=["Scan Rule Sets"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_rule_set(
    metadata: Dict[str, Any],
    rules: List[Dict[str, Any]],
    session: Session = Depends(get_session),
    current_user: str = "system",  # TODO -> inject from auth
):
    try:
        rs = AdvancedScanRuleSetService.create_rule_set(session, metadata, rules, current_user)
        return {"success": True, "data": rs}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/{rule_set_id}/compile")
async def compile_rule_set(rule_set_id: int = Path(...), session: Session = Depends(get_session), current_user: str = "system"):
    try:
        rs, rules = AdvancedScanRuleSetService.compile_rule_set(session, rule_set_id, current_user)
        return {"success": True, "data": {"ruleSet": rs, "rules": rules}}
    except RuleSetCompilerError as ce:
        raise HTTPException(status_code=422, detail=str(ce))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/{rule_set_id}/impact")
async def impact_analysis(rule_set_id: int, session: Session = Depends(get_session)):
    data = AdvancedScanRuleSetService.analyse_impact(session, rule_set_id)
    return {"success": True, "data": data}