from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from services.inference import run_inference
from schemas.detection import DetectionResponse
import os

router = APIRouter()

MAX_SIZE = 5 * 1024 * 1024

@router.post("/detect", response_model=DetectionResponse)
async def detect(
    file: UploadFile = File(...),
    x_cv_secret: str = Header(None)
):
    if x_cv_secret != os.getenv("CV_SERVICE_SECRET"):
        raise HTTPException(401, "Unauthorized")
    if file.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(400, "Only JPEG/PNG accepted")
    image_bytes = await file.read()
    if len(image_bytes) > MAX_SIZE:
        raise HTTPException(400, "Image exceeds 5MB limit")
    return run_inference(image_bytes)