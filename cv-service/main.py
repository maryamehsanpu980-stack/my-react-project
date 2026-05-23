from dotenv import load_dotenv
load_dotenv()
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.detect import router as detect_router

app = FastAPI(title="RoadVision PK — CV Microservice")

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["POST"],
    allow_headers=["*"],
)

app.include_router(detect_router)

@app.get("/health")
def health():
    return {"status": "ok"}