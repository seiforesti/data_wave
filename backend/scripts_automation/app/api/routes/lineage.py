### === backend/app/api/routes/lineage.py ===
from fastapi import APIRouter, Body
from app.services.lineage import create_lineage_process

router = APIRouter()

@router.post("/")
def create_lineage(payload: dict = Body(...)):
    return create_lineage_process(payload)
