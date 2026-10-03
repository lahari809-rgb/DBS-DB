from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PracticeScenario(BaseModel):
    scenario_id: str
    target_sentence: str
    target_signs: List[str]
    category: str
    level: str
    hint: str

class PracticeEvaluateRequest(BaseModel):
    scenario_id: Optional[str] = None
    target_signs: List[str] = Field(..., description="Target sign tokens expected")
    detected_signs: List[str] = Field(..., description="Sequence of signs detected by the user")
    user_id: Optional[str] = None

class PracticeEvaluateResponse(BaseModel):
    accuracy: float
    order_accuracy: float
    overall_match: float
    target_signs: List[str]
    detected_signs: List[str]
    missing_signs: List[str]
    extra_signs: List[str]
    feedback: str
    passed: bool
    timestamp: str
