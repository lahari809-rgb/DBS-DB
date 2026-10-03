from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.models.user import UserCreate, UserUpdate, UserResponse
from app.db.database import db_manager

router = APIRouter(prefix="/users", tags=["Users Management"])

@router.get("", response_model=List[UserResponse])
async def list_users(
    role: Optional[str] = Query(None, description="Filter by role: user, admin, guest"),
    search: Optional[str] = Query(None, description="Search name or email")
):
    users = await db_manager.get_users(role=role, search=search)
    return users

@router.post("", response_model=UserResponse, status_code=201)
async def create_user(payload: UserCreate):
    user_dict = payload.model_dump()
    user_dict["createdAt"] = datetime.utcnow().isoformat()
    created = await db_manager.create_user(user_dict)
    return created

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    user = await db_manager.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, payload: UserUpdate):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = await db_manager.update_user(user_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return updated

@router.delete("/{user_id}")
async def delete_user(user_id: str):
    success = await db_manager.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return {"status": "success", "message": f"User {user_id} deleted successfully"}
