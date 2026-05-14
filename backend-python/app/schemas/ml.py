from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class TransactionInput(BaseModel):
    descripcion: str
    monto: float

class CategoryPrediction(BaseModel):
    categoria: str
    probabilidad: float

class AnomalyPrediction(BaseModel):
    monto: float
    es_anomalia: bool
    score: float

class ForecastResponse(BaseModel):
    fecha: date
    monto_estimado: float

class HealthResponse(BaseModel):
    status: str
    service: str
