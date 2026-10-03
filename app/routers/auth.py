from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.db.database import db_manager
from app.time_utils import get_ist_iso

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])

class LoginRequest(BaseModel):
    email: str = Field(..., example="lahari@example.com")
    password: Optional[str] = Field(default="demo123")

class RegisterRequest(BaseModel):
    name: str = Field(..., example="Lahari")
    email: str = Field(..., example="lahari@example.com")
    role: str = Field(default="user", example="user")
    password: Optional[str] = Field(default="demo123")

class AuthResponse(BaseModel):
    token: str
    user: dict

@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    users = await db_manager.get_users()
    matched_user = None
    for u in users:
        if u.get("email", "").lower() == payload.email.lower().strip():
            matched_user = u
            break
            
    if not matched_user:
        # If user does not exist yet in demo mode, auto-register as user
        new_name = payload.email.split("@")[0].capitalize()
        role = "admin" if "admin" in payload.email.lower() else "user"
        matched_user = await db_manager.create_user({
            "name": new_name,
            "email": payload.email.strip(),
            "role": role,
            "createdAt": get_ist_iso()
        })
        
    return AuthResponse(
        token=f"jwt_token_{matched_user.get('_id')}_ist",
        user=matched_user
    )

@router.post("/register", response_model=AuthResponse)
async def register(payload: RegisterRequest):
    users = await db_manager.get_users()
    for u in users:
        if u.get("email", "").lower() == payload.email.lower().strip():
            raise HTTPException(status_code=400, detail="User with this email already exists")
            
    user_dict = {
        "name": payload.name.strip(),
        "email": payload.email.strip(),
        "role": payload.role if payload.role in ["user", "admin"] else "user",
        "createdAt": get_ist_iso()
    }
    created = await db_manager.create_user(user_dict)
    return AuthResponse(
        token=f"jwt_token_{created.get('_id')}_ist",
        user=created
    )

@router.get("/me")
async def get_current_user(token: Optional[str] = None):
    users = await db_manager.get_users()
    if token and "jwt_token_" in token:
        user_id = token.replace("jwt_token_", "").replace("_ist", "")
        for u in users:
            if str(u.get("_id")) == user_id:
                return u
    # Return default user (Lahari)
    return users[0] if users else {"name": "Guest", "role": "user"}
