from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import ml
from app.services.ml_service import ml_service

app = FastAPI(title="FinGuard AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    ml_service.load_models()
    ml_service.connect_redis()

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "backend-python"}

app.include_router(ml.router, prefix="/api/v1", tags=["ml"])
