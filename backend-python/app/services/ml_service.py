import joblib
import redis
import json
import hashlib
import time
from ..core.config import settings

class MLService:
    def __init__(self):
        self.classifier = None
        self.anomaly_detector = None
        self.forecaster = None
        self.redis_client = None
        self.last_latency_ms = 0
        self.processed_count = 0
        self.start_time = time.time()

    def get_stats(self):
        uptime = time.time() - self.start_time
        return {
            "latency_ms": round(self.last_latency_ms, 2),
            "throughput_s": round(self.processed_count / uptime, 2) if uptime > 0 else 0,
            "total_processed": self.processed_count
        }

    def load_models(self):
        import os
        base_path = os.path.dirname(os.path.dirname(__file__))
        model_files = {
            'classifier': 'classifier.pkl',
            'anomaly_detector': 'anomaly_detector.pkl',
            'forecaster': 'forecaster.pkl'
        }
        
        for name, filename in model_files.items():
            path = os.path.join(base_path, 'models', filename)
            if not os.path.exists(path):
                raise FileNotFoundError(f"El modelo {filename} no se encuentra en {path}")
        
        try:
            self.classifier = joblib.load(os.path.join(base_path, 'models', 'classifier.pkl'))
            self.anomaly_detector = joblib.load(os.path.join(base_path, 'models', 'anomaly_detector.pkl'))
            self.forecaster = joblib.load(os.path.join(base_path, 'models', 'forecaster.pkl'))
            print("Modelos cargados exitosamente.")
        except Exception as e:
            print(f"Error crítico cargando modelos: {e}")
            raise RuntimeError(f"Fallo al cargar los modelos de ML: {e}")

    def connect_redis(self):
        try:
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=0,
                decode_responses=True
            )
            print("Conexión a Redis establecida.")
        except Exception as e:
            print(f"Error conectando a Redis: {e}")

    def get_cache(self, key_prefix, data):
        if not self.redis_client: return None
        key = f"{key_prefix}:{hashlib.md5(json.dumps(data).encode()).hexdigest()}"
        cached = self.redis_client.get(key)
        return json.loads(cached) if cached else None

    def set_cache(self, key_prefix, data, result, expire=3600):
        if not self.redis_client: return
        key = f"{key_prefix}:{hashlib.md5(json.dumps(data).encode()).hexdigest()}"
        self.redis_client.setex(key, expire, json.dumps(result))

    def predict_category(self, descripcion: str):
        start = time.time()
        # Intentar obtener de caché
        cached = self.get_cache("cat", descripcion)
        if cached: 
            self.last_latency_ms = (time.time() - start) * 1000
            self.processed_count += 1
            return cached

        prediction = self.classifier.predict([descripcion])[0]
        result = {"categoria": prediction, "probabilidad": 1.0} # LogReg simple por ahora
        
        self.set_cache("cat", descripcion, result)
        self.last_latency_ms = (time.time() - start) * 1000
        self.processed_count += 1
        return result

    def predict_anomaly(self, monto: float):
        start = time.time()
        data = {"monto": monto}
        cached = self.get_cache("anom", data)
        if cached: 
            self.last_latency_ms = (time.time() - start) * 1000
            self.processed_count += 1
            return cached

        prediction = self.anomaly_detector.predict([[monto]])[0]
        score = self.anomaly_detector.decision_function([[monto]])[0]
        # IsolationForest: -1 para anomalía, 1 para normal
        # decision_function: valores negativos son anomalías
        is_anomaly = True if prediction == -1 else False
        result = {"monto": monto, "es_anomalia": is_anomaly, "score": float(score)}
        
        self.set_cache("anom", data, result)
        self.last_latency_ms = (time.time() - start) * 1000
        self.processed_count += 1
        return result

ml_service = MLService()
