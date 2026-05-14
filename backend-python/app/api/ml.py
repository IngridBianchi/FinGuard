from fastapi import APIRouter, HTTPException
from ..schemas.ml import TransactionInput, CategoryPrediction, AnomalyPrediction
from ..services.ml_service import ml_service

router = APIRouter()

@router.post("/predict/category", response_model=CategoryPrediction)
async def predict_category(data: TransactionInput):
    if not ml_service.classifier:
        raise HTTPException(status_code=500, detail="Modelo de clasificación no cargado")
    return ml_service.predict_category(data.descripcion)

@router.post("/predict/anomaly", response_model=AnomalyPrediction)
async def predict_anomaly(data: TransactionInput):
    if not ml_service.anomaly_detector:
        raise HTTPException(status_code=500, detail="Modelo de anomalías no cargado")
    return ml_service.predict_anomaly(data.monto)

@router.get("/stats")
async def get_stats():
    return ml_service.get_stats()
