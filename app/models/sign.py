from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.time_utils import get_ist_now

class SignBase(BaseModel):
    label: str = Field(..., example="hello")
    description: Optional[str] = Field(default="", example="Open hand wave or salute from brow")
    category: Optional[str] = Field(default="greeting", example="greeting")
    videoUrl: Optional[str] = Field(default="", example="https://assets.signlang.ai/signs/hello.mp4")
    features: List[float] = Field(default_factory=list, example=[0.12, 0.78, 0.34, 0.55])

class SignCreate(SignBase):
    pass

class SignResponse(SignBase):
    id: str = Field(..., alias="_id", example="650c82f91a2b3c4d5e6f7101")
    createdAt: datetime = Field(default_factory=get_ist_now)

    class Config:
        populate_by_name = True
