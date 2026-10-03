from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.time_utils import get_ist_now

class HistoryCreate(BaseModel):
    userId: Optional[str] = Field(default="650c82f91a2b3c4d5e6f7081", example="650c82f91a2b3c4d5e6f7081")
    signLabel: str = Field(..., example="hello")
    text: str = Field(..., example="HELLO")
    confidence: Optional[float] = Field(default=0.96, example=0.96)
    timestamp: datetime = Field(default_factory=get_ist_now)
    method: str = Field(default="live", example="live")

class HistoryResponse(HistoryCreate):
    id: str = Field(..., alias="_id", example="650c82f91a2b3c4d5e6f7301")

    class Config:
        populate_by_name = True
