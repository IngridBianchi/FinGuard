import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.ml_service import ml_service

# Mock load_models y modelos
ml_service.load_models = MagicMock()
ml_service.classifier = MagicMock()
ml_service.classifier.predict.return_value = ["Alimentación"]

ml_service.anomaly_detector = {
    'preprocessor': MagicMock(),
    'model': MagicMock()
}
ml_service.anomaly_detector['preprocessor'].transform.return_value = [[0.1, 0.2]]
ml_service.anomaly_detector['model'].predict.return_value = [1]
ml_service.anomaly_detector['model'].decision_function.return_value = [0.5]

# Desactivar Redis para tests si es necesario
ml_service.redis_client = None 

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "backend-python"}

def test_predict_category_success():
    response = client.post("/api/v1/predict/category", json={"descripcion": "Cena pizza", "monto": 1500})
    assert response.status_code == 200
    data = response.json()
    assert data["categoria"] == "Alimentación"

def test_predict_anomaly_success():
    response = client.post("/api/v1/predict/anomaly", json={"descripcion": "Gasto normal", "monto": 100, "categoria": "Otros"})
    assert response.status_code == 200
    data = response.json()
    assert data["es_anomalia"] is False
    assert "score" in data

def test_predict_anomaly_missing_category():
    # En la versión actual, el esquema Pydantic permite categoria=None, 
    # pero el endpoint verifica if not data.categoria
    response = client.post("/api/v1/predict/anomaly", json={"descripcion": "test", "monto": 100})
    assert response.status_code == 400 
    assert "categoría es obligatoria" in response.json()["detail"]

def test_predict_validation_error():
    # Monto faltante (requerido por Pydantic)
    response = client.post("/api/v1/predict/category", json={"descripcion": "test"})
    assert response.status_code == 422 # Unprocessable Entity
