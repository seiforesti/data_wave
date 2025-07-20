from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import csv, io, json
from ...services.classification_service import ClassificationService
from ...models.classification_models import (
    ClassificationRule, ClassificationDictionary, ClassificationAudit, ClassificationResult, SensitivityLabelEnum
)
from ...utils.db import get_db

router = APIRouter(prefix="/classifications", tags=["Classifications"])

# Pydantic Schemas
class RuleCreate(BaseModel):
    name: str
    description: Optional[str]
    pattern: str
    rule_type: str
    sensitivity_label: SensitivityLabelEnum

class RuleUpdate(BaseModel):
    description: Optional[str]
    pattern: Optional[str]
    rule_type: Optional[str]
    sensitivity_label: Optional[SensitivityLabelEnum]
    is_active: Optional[bool]

class DictionaryCreate(BaseModel):
    name: str
    description: Optional[str]
    entries: dict

class DictionaryUpdate(BaseModel):
    description: Optional[str]
    entries: Optional[dict]

class ApplyRulesRequest(BaseModel):
    entity_type: str
    entity_id: str
    data: str
    user: str

@router.post("/rules", response_model=dict)
def create_rule(rule: RuleCreate, user: str, db: Session = Depends(get_db)):
    rule_obj = ClassificationService.create_rule(db, rule.dict(), user)
    return {"id": rule_obj.id, "name": rule_obj.name}

@router.put("/rules/{rule_id}", response_model=dict)
def update_rule(rule_id: int, updates: RuleUpdate, user: str, db: Session = Depends(get_db)):
    rule_obj = ClassificationService.update_rule(db, rule_id, updates.dict(exclude_unset=True), user)
    if not rule_obj:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"id": rule_obj.id, "name": rule_obj.name}

@router.delete("/rules/{rule_id}", response_model=dict)
def delete_rule(rule_id: int, user: str, db: Session = Depends(get_db)):
    success = ClassificationService.delete_rule(db, rule_id, user)
    if not success:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"deleted": True}

@router.get("/rules", response_model=List[dict])
def list_rules(db: Session = Depends(get_db)):
    rules = ClassificationService.list_rules(db)
    return [{"id": r.id, "name": r.name, "pattern": r.pattern, "type": r.rule_type, "label": r.sensitivity_label.value} for r in rules]

@router.post("/dictionaries", response_model=dict)
def create_dictionary(dictionary: DictionaryCreate, user: str, db: Session = Depends(get_db)):
    dict_obj = ClassificationService.create_dictionary(db, dictionary.dict(), user)
    return {"id": dict_obj.id, "name": dict_obj.name}

@router.put("/dictionaries/{dict_id}", response_model=dict)
def update_dictionary(dict_id: int, updates: DictionaryUpdate, user: str, db: Session = Depends(get_db)):
    dict_obj = ClassificationService.update_dictionary(db, dict_id, updates.dict(exclude_unset=True), user)
    if not dict_obj:
        raise HTTPException(status_code=404, detail="Dictionary not found")
    return {"id": dict_obj.id, "name": dict_obj.name}

@router.delete("/dictionaries/{dict_id}", response_model=dict)
def delete_dictionary(dict_id: int, user: str, db: Session = Depends(get_db)):
    success = ClassificationService.delete_dictionary(db, dict_id, user)
    if not success:
        raise HTTPException(status_code=404, detail="Dictionary not found")
    return {"deleted": True}

@router.get("/dictionaries", response_model=List[dict])
def list_dictionaries(db: Session = Depends(get_db)):
    dicts = ClassificationService.list_dictionaries(db)
    return [{"id": d.id, "name": d.name, "entries": d.entries} for d in dicts]

@router.post("/apply", response_model=List[dict])
def apply_rules(req: ApplyRulesRequest, db: Session = Depends(get_db)):
    results = ClassificationService.apply_rules_to_entity(db, req.entity_type, req.entity_id, req.data, req.user)
    return [{"id": r.id, "entity_type": r.entity_type, "entity_id": r.entity_id, "label": r.sensitivity_label.value, "matched": r.matched_value} for r in results]

@router.post("/bulk-upload", response_model=List[dict])
def bulk_upload(file: UploadFile = File(...), user: str = "system", db: Session = Depends(get_db)):
    content = file.file.read().decode("utf-8")
    try:
        if file.filename.endswith(".csv"):
            reader = csv.DictReader(io.StringIO(content))
            data = [row for row in reader]
        elif file.filename.endswith(".json"):
            data = json.loads(content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File parse error: {str(e)}")
    rules = ClassificationService.bulk_upload_classification_file(db, data, user)
    return [{"id": r.id, "name": r.name} for r in rules]

@router.get("/audit", response_model=List[dict])
def get_audit(entity_type: Optional[str] = None, entity_id: Optional[str] = None, db: Session = Depends(get_db)):
    audits = ClassificationService.get_audit_trail(db, entity_type, entity_id)
    return [{
        "id": a.id,
        "action": a.action,
        "entity_type": a.entity_type,
        "entity_id": a.entity_id,
        "rule_id": a.rule_id,
        "result_id": a.result_id,
        "performed_by": a.performed_by,
        "performed_at": a.performed_at,
        "details": a.details
    } for a in audits]