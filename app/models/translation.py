from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.time_utils import get_ist_now

class TranslationCreate(BaseModel):
    userId: Optional[str] = Field(default="650c82f91a2b3c4d5e6f7081", example="650c82f91a2b3c4d5e6f7081")
    signLabel: str = Field(..., example="hello")
    text: str = Field(..., example="HELLO")
    confidence: float = Field(..., ge=0.0, le=1.0, example=0.96)

class TranslationResponse(TranslationCreate):
    id: str = Field(..., alias="_id", example="650c82f91a2b3c4d5e6f7201")
    createdAt: datetime = Field(default_factory=get_ist_now)

    class Config:
        populate_by_name = True
