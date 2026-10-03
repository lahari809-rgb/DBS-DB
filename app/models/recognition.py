from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: Optional[float] = 0.0

class RecognitionRequest(BaseModel):
    landmarks: List[LandmarkPoint] = Field(..., description="21 3D landmarks from MediaPipe Hand tracker")
    handedness: Optional[str] = Field(default="Right", example="Right")
    userId: Optional[str] = Field(default=None)
    saveHistory: Optional[bool] = Field(default=True)
    method: Optional[str] = Field(default="live", example="live")

class PipelineStageMetrics(BaseModel):
    frameCaptureMs: float = 4.2
    preprocessMs: float = 3.8
    handDetectionMs: float = 12.5
    featureExtractionMs: float = 2.1
    recognitionMs: float = 3.6
    totalLatencyMs: float = 26.2

class AlternativePrediction(BaseModel):
    sign: str
    confidence: float

class RecognitionResponse(BaseModel):
    sign: str = Field(..., example="HELLO")
    label: str = Field(..., example="hello")
    confidence: float = Field(..., example=0.96)
    speechText: str = Field(..., example="Hello, nice to meet you!")
    fingerStates: Dict[str, str] = Field(default_factory=dict)
    features: List[float] = Field(default_factory=list)
    alternatives: List[AlternativePrediction] = Field(default_factory=list)
    pipeline: PipelineStageMetrics = Field(default_factory=PipelineStageMetrics)
    timestamp: str
