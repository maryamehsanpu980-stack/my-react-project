from ultralytics import YOLO
import os

MODEL_PATH = os.getenv("MODEL_PATH", "yolov8n.pt")  # ← fixed default
CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", "0.10"))
IOU_THRESHOLD  = float(os.getenv("IOU_THRESHOLD",  "0.50"))

model = YOLO(MODEL_PATH)

def severity_from_confidence(conf: float) -> str:
    if conf < 0.10:  return "none"   # was 0.50
    if conf < 0.50:  return "low"    # was 0.65
    if conf < 0.80:  return "medium"
    return "high"

def run_inference(image_bytes: bytes) -> dict:
    import tempfile, os
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
        f.write(image_bytes)
        tmp_path = f.name

    try:
        results = model.predict(
            source=tmp_path,
            conf=CONF_THRESHOLD,
            iou=IOU_THRESHOLD,
            verbose=False
        )
    finally:
        os.unlink(tmp_path)

    boxes = results[0].boxes
    if boxes is None or len(boxes) == 0:
        return {"detected": False, "confidence": 0.0, "severity": "none", "detections": []}

    best_conf = float(boxes.conf.max())
    raw_boxes = [
        {
            "class": int(b.cls),
            "confidence": float(b.conf),
            "xyxy": b.xyxy[0].tolist()
        }
        for b in boxes
    ]

    return {
        "detected":   True,
        "confidence": best_conf,
        "severity":   severity_from_confidence(best_conf),
        "detections": raw_boxes
    }