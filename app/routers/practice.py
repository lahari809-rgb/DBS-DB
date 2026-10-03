from fastapi import APIRouter, HTTPException
from typing import List
from app.models.practice import PracticeScenario, PracticeEvaluateRequest, PracticeEvaluateResponse
from app.services.isl_vocabulary_data import PRACTICE_SCENARIOS
from app.db.database import db_manager
from app.time_utils import get_ist_iso

router = APIRouter(prefix="/practice", tags=["Practice Mode"])

@router.get("/scenarios", response_model=List[PracticeScenario])
async def get_practice_scenarios():
    """Returns list of curated practice sentences and target sign sequences"""
    return PRACTICE_SCENARIOS

@router.post("/evaluate", response_model=PracticeEvaluateResponse)
async def evaluate_practice_attempt(req: PracticeEvaluateRequest):
    """
    Evaluates a user's continuous sign attempt against target sentence signs.
    Calculates sign accuracy, order accuracy, missing/extra signs, and feedback.
    """
    target = [s.strip().upper() for s in req.target_signs]
    detected = [s.strip().upper() for s in req.detected_signs if s.strip().upper() not in ["BLANK", "UNKNOWN", "GESTURE DETECTED"]]

    if not target:
        raise HTTPException(status_code=400, detail="Target signs cannot be empty")

    # Match counts
    target_set = set(target)
    detected_set = set(detected)

    correct_signs = [s for s in detected if s in target_set]
    missing_signs = [s for s in target if s not in detected_set]
    extra_signs = [s for s in detected if s not in target_set]

    # Accuracy calculation
    sign_acc = round((len(correct_signs) / max(len(target), 1)) * 100, 1)
    sign_acc = min(sign_acc, 100.0)

    # Order accuracy (longest common subsequence ratio)
    order_matches = 0
    t_idx = 0
    for s in detected:
        if t_idx < len(target) and s == target[t_idx]:
            order_matches += 1
            t_idx += 1
    
    order_acc = round((order_matches / max(len(target), 1)) * 100, 1)
    overall_match = round((sign_acc * 0.6 + order_acc * 0.4), 1)

    passed = overall_match >= 75.0

    if overall_match >= 95.0:
        feedback = "Outstanding! Perfect sign execution, posture, and correct temporal sequence."
    elif overall_match >= 80.0:
        feedback = "Great job! Your sign sequence is clear and well recognized."
    elif overall_match >= 60.0:
        feedback = f"Good effort! You missed {len(missing_signs)} sign(s): {', '.join(missing_signs)}."
    else:
        feedback = "Keep practicing! Ensure each gesture is distinct and completed in sequence."

    current_ist = get_ist_iso()

    # Save to MongoDB practice_results
    await db_manager.save_practice_result({
        "userId": req.user_id or "650c82f91a2b3c4d5e6f7081",
        "scenarioId": req.scenario_id or "custom",
        "targetSigns": target,
        "detectedSigns": detected,
        "overallMatch": overall_match,
        "passed": passed,
        "timestamp": current_ist
    })

    return PracticeEvaluateResponse(
        accuracy=sign_acc,
        order_accuracy=order_acc,
        overall_match=overall_match,
        target_signs=target,
        detected_signs=detected,
        missing_signs=missing_signs,
        extra_signs=extra_signs,
        feedback=feedback,
        passed=passed,
        timestamp=current_ist
    )
