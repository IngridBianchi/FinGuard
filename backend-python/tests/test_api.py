import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.ml_service import ml_service

# Mock load_models para evitar errores de carga en tests
ml_service.load_models = MagicMock()
ml_service.anomaly_detector = {
    'preprocessor': MagicMock(),
    'model': MagicMock()
}
ml_service.anomaly_detector['preprocessor'].transform.return_value = [[0.1, 0.2]]
ml_service.anomaly_detector['model'].predict.return_value = [1]
ml_service.anomaly_detector['model'].decision_function.return_value = [0.5]

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "backend-python"}

def test_predict_anomaly_missing_category():
    response = client.post("/api/v1/predict/anomaly", json={"descripcion": "test", "monto": 100})
    assert response.status_code == 400 # El servicio valida la categoría, no Pydantic

def test_predict_anomaly_invalid_category():
    response = client.post("/api/v1/predict/anomaly", json={"descripcion": "test", "monto": 100, "categoria": ""})
    assert response.status_code == 400 # El servicio valida la categoría vacía
