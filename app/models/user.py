from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.time_utils import get_ist_now

class UserBase(BaseModel):
    name: str = Field(..., example="Lahari")
    email: str = Field(..., example="lahari@example.com")
    role: str = Field(default="user", example="user")

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

class UserResponse(UserBase):
    id: str = Field(..., alias="_id", example="650c82f91a2b3c4d5e6f7081")
    createdAt: datetime = Field(default_factory=get_ist_now)

    class Config:
        populate_by_name = True
