from fastapi import APIRouter, HTTPException, Request
from ..schemas.ml import TransactionInput, CategoryPrediction, AnomalyPrediction
from ..services.ml_service import ml_service
from app.core.limiter import limiter

router = APIRouter()

@router.post("/predict/category", response_model=CategoryPrediction)
@limiter.limit("20/minute")
async def predict_category(request: Request, data: TransactionInput):
    if not ml_service.classifier:
        raise HTTPException(status_code=500, detail="Modelo de clasificación no cargado")
    return ml_service.predict_category(data.descripcion)

@router.post("/predict/anomaly", response_model=AnomalyPrediction)
@limiter.limit("20/minute")
async def predict_anomaly(request: Request, data: TransactionInput):
    if not ml_service.anomaly_detector:
        raise HTTPException(status_code=500, detail="Modelo de anomalías no cargado")
    
    if not data.categoria:
        raise HTTPException(status_code=400, detail="La categoría es obligatoria para la detección de anomalías")
        
    return ml_service.predict_anomaly(data.monto, data.categoria)

@router.get("/stats")
@limiter.limit("60/minute")
async def get_stats(request: Request):
    return ml_service.get_stats()
