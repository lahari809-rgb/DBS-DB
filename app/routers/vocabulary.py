from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from app.models.vocabulary import VocabularySign
from app.services.isl_vocabulary_data import ISL_ALL_SIGNS
from app.db.database import db_manager

router = APIRouter(prefix="/vocabulary", tags=["Vocabulary & Levels"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_vocabulary(
    category: Optional[str] = Query(None, description="Filter by category"),
    level: Optional[int] = Query(None, description="Filter by level (1 to 5)"),
    search: Optional[str] = Query(None, description="Search term in label or meaning")
):
    """
    Returns the organized ISL vocabulary (Levels 1 to 5, Categories, Signs metadata)
    """
    signs = await db_manager.get_vocabulary_signs(category=category, level=level, search=search)
    return signs

@router.get("/categories", response_model=List[str])
async def get_categories():
    """List distinct categories"""
    categories = sorted(list(set([s["category"] for s in ISL_ALL_SIGNS])))
    return categories

@router.get("/levels", response_model=Dict[str, Any])
async def get_levels_breakdown():
    """Returns vocabulary grouped by level 1 to 5"""
    levels = {
        "Level 1": {
            "title": "Alphabet (A-Z) & Transitions",
            "count": 26,
            "description": "Fingerspelling 26 letters and resting neutral states."
        },
        "Level 2": {
            "title": "Numbers (0 - 100+)",
            "count": 10,
            "description": "Quantities, counts, and digits in Indian Sign Language."
        },
        "Level 3": {
            "title": "Basic Vocabulary (~100-300 signs)",
            "count": len([s for s in ISL_ALL_SIGNS if s.get("level") == 3]),
            "description": "Greetings, Pronouns, Family, Core Verbs, Common Objects."
        },
        "Level 4": {
            "title": "Daily Vocabulary (~500-1000 signs)",
            "count": len([s for s in ISL_ALL_SIGNS if s.get("level") == 4]),
            "description": "Education, Emergency, Transportation, Workplace, Healthcare."
        },
        "Level 5": {
            "title": "Continuous Sentence Sequences",
            "count": 100,
            "description": "Real-time temporal stream translation with natural English grammar engine."
        }
    }
    return levels

@router.get("/{sign_id}", response_model=Dict[str, Any])
async def get_sign_detail(sign_id: str):
    """Get single sign by ID or Label"""
    target = sign_id.upper()
    for s in ISL_ALL_SIGNS:
        if s.get("sign_id") == sign_id or s.get("label") == target:
            return s
    raise HTTPException(status_code=404, detail="Sign not found in vocabulary database")
