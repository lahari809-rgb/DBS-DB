from fastapi import APIRouter, Query
from typing import List, Optional
from app.models.history import HistoryCreate, HistoryResponse
from app.db.database import db_manager
from app.time_utils import get_ist_iso

router = APIRouter(prefix="/history", tags=["Translation History"])

@router.get("", response_model=List[HistoryResponse])
async def get_history(
    limit: int = Query(50, ge=1, le=500),
    method: Optional[str] = Query(None, description="Filter by method: live, upload, api")
):
    history = await db_manager.get_history(limit=limit, method=method)
    return history

@router.post("", response_model=HistoryResponse, status_code=201)
async def add_history(payload: HistoryCreate):
    hist_dict = payload.model_dump()
    hist_dict["timestamp"] = get_ist_iso()
    created = await db_manager.add_history(hist_dict)
    return created

@router.delete("")
async def clear_history():
    deleted_count = await db_manager.clear_history()
    return {"status": "success", "deletedCount": deleted_count}
