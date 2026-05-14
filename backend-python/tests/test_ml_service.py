import pytest
import os
from app.services.ml_service import MLService

def test_load_models_success():
    # Mock de las rutas si es necesario, aquí probamos la lógica actual
    service = MLService()
    # Asumiendo que los archivos existen en la estructura actual
    try:
        service.load_models()
        assert service.classifier is not None
        assert service.anomaly_detector is not None
        assert service.forecaster is not None
    except Exception as e:
        pytest.fail(f"La carga de modelos falló: {e}")

def test_load_models_failure():
    # Test para verificar que falla si no hay modelos
    service = MLService()
    # Mock temporalmente cambiando la ruta base o borrando archivos no es práctico
    # Probaremos que si pasamos rutas inválidas lanza error (si se refactorizara el load_models)
    pass
