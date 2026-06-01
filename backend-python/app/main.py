import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.api import ml
from app.services.ml_service import ml_service
from app.core.logging import setup_logging
from app.core.limiter import limiter

# Configurar logging estructurado
logger = setup_logging()

# Inicializar limitador
app = FastAPI(
    title="FinGuard AI Backend",
    description="API para detección de anomalías y clasificación financiera",
    version="1.0.0"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
...

# Configuración robusta de CORS
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001")
allowed_origins = [o.strip().rstrip("/") for o in raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    ml_service.load_models()
    ml_service.connect_redis()

@app.get("/health")
@limiter.limit("5/minute")
async def health_check(request: Request):
    return {"status": "ok", "service": "backend-python"}

app.include_router(ml.router, prefix="/api/v1", tags=["ml"])
