from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class VocabularySign(BaseModel):
    sign_id: str = Field(..., example="isl_001")
    label: str = Field(..., example="HELLO")
    category: str = Field(..., example="Greetings & Politeness")
    level: int = Field(default=3, ge=1, le=5, description="Level 1: Alphabet, 2: Numbers, 3: Basic, 4: Daily, 5: Continuous")
    meaning: str = Field(..., example="Greeting / Welcome")
    description: str = Field(..., example="Open hand wave or palms together")
    speech_text: str = Field(default="Hello", example="Hello")
    motion: Optional[str] = Field(default="Static / Gentle wave")
    difficulty: Optional[str] = Field(default="Beginner")
    icon: Optional[str] = Field(default="hand")
    is_continuous_compatible: bool = Field(default=True)
    tags: List[str] = Field(default_factory=list)
    createdAt: Optional[str] = None

class VocabularyFilter(BaseModel):
    category: Optional[str] = None
    level: Optional[int] = None
    search: Optional[str] = None
