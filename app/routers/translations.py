from fastapi import APIRouter, Query
from typing import List, Optional
from app.models.translation import TranslationCreate, TranslationResponse
from app.db.database import db_manager
from app.time_utils import get_ist_iso

router = APIRouter(prefix="/translations", tags=["Translations Collection"])

@router.get("", response_model=List[TranslationResponse])
async def get_translations(
    limit: int = Query(50, ge=1, le=500),
    userId: Optional[str] = Query(None)
):
    translations = await db_manager.get_translations(limit=limit, user_id=userId)
    return translations

@router.post("", response_model=TranslationResponse, status_code=201)
async def create_translation(payload: TranslationCreate):
    trans_dict = payload.model_dump()
    trans_dict["createdAt"] = get_ist_iso()
    created = await db_manager.create_translation(trans_dict)
    
    # Also log to history with IST
    await db_manager.add_history({
        "userId": trans_dict.get("userId", "650c82f91a2b3c4d5e6f7081"),
        "signLabel": trans_dict.get("signLabel", ""),
        "text": trans_dict.get("text", ""),
        "confidence": trans_dict.get("confidence", 0.95),
        "timestamp": trans_dict["createdAt"],
        "method": "api"
    })
    return created
