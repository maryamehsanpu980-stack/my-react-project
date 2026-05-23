from pydantic import BaseModel
from typing import Literal

class DetectionResponse(BaseModel):
    detected: bool
    confidence: float          # 0.0 – 1.0
    severity: Literal["none", "low", "medium", "high"]
    detections: list[dict]     # raw YOLO boxes (optional detail)