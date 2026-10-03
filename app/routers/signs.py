from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.models.sign import SignCreate, SignResponse
from app.db.database import db_manager

router = APIRouter(prefix="/signs", tags=["Signs Management"])

@router.get("", response_model=List[SignResponse])
async def list_signs(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search label or description")
):
    signs = await db_manager.get_signs(category=category, search=search)
    return signs

@router.post("", response_model=SignResponse, status_code=201)
async def create_sign(payload: SignCreate):
    sign_dict = payload.model_dump()
    sign_dict["createdAt"] = datetime.utcnow().isoformat()
    created = await db_manager.create_sign(sign_dict)
    return created

@router.delete("/{sign_id}")
async def delete_sign(sign_id: str):
    success = await db_manager.delete_sign(sign_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Sign {sign_id} not found")
    return {"status": "success", "message": f"Sign {sign_id} deleted"}
