import joblib
import redis
import json
import hashlib
import time
import pandas as pd
from ..core.config import settings

class MLService:
    _instance = None

    def __init__(self):
        if hasattr(self, '_initialized'): return
        self.classifier = None
        self.anomaly_detector = None
        self.forecaster = None
        self.redis_client = None
        self.start_time = time.time()
        self._initialized = True
        print("[DEBUG] MLService initialized.")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_stats(self):
        """
        Calcula y devuelve estadísticas de rendimiento del servicio.
        Obtiene latencia y total de peticiones procesadas desde Redis.
        """
        if not self.redis_client:
            return {"latency_ms": 0, "throughput_s": 0, "total_processed": 0}
            
        latency = self.redis_client.get("stats:latency") or 0
        total = self.redis_client.get("stats:total_processed") or 0
        
        uptime = time.time() - self.start_time
        throughput = float(total) / uptime if uptime > 0 else 0
        
        return {
            "latency_ms": float(latency),
            "throughput_s": round(throughput, 2),
            "total_processed": int(total)
        }

    def _update_stats(self, latency_ms):
        """
        Actualiza las métricas de rendimiento en Redis.
        """
        if not self.redis_client:
            print("[DEBUG] No Redis client for stats update")
            return
        try:
            self.redis_client.set("stats:latency", latency_ms)
            self.redis_client.incr("stats:total_processed")
            print(f"[DEBUG] Stats updated: latency={latency_ms}, incremented total")
        except Exception as e:
            print(f"[DEBUG] Redis error in _update_stats: {e}")

    def load_models(self):
        """
        Carga los modelos pre-entrenados (.pkl) al iniciar el servicio.
        """
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
        """
        Establece la conexión con el servidor Redis.
        """
        try:
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                ssl=settings.REDIS_SSL,
                db=0,
                decode_responses=True
            )
            print("Conexión a Redis establecida.")
        except Exception as e:
            print(f"Error conectando a Redis: {e}")

    def get_cache(self, key_prefix, data):
        """
        Obtiene datos desde la caché de Redis.
        """
        if not self.redis_client: return None
        key = f"{key_prefix}:{hashlib.md5(json.dumps(data).encode()).hexdigest()}"
        cached = self.redis_client.get(key)
        return json.loads(cached) if cached else None

    def set_cache(self, key_prefix, data, result, expire=3600):
        """
        Guarda datos en la caché de Redis.
        """
        if not self.redis_client: return
        key = f"{key_prefix}:{hashlib.md5(json.dumps(data).encode()).hexdigest()}"
        self.redis_client.setex(key, expire, json.dumps(result))

    def predict_category(self, descripcion: str):
        """
        Predice la categoría de un gasto basado en su descripción.
        """
        start = time.time()
        cached = self.get_cache("cat", descripcion)
        if cached: 
            latency = (time.time() - start) * 1000
            self._update_stats(latency)
            return cached

        prediction = self.classifier.predict([descripcion])[0]
        result = {"categoria": prediction, "probabilidad": 1.0}
        
        self.set_cache("cat", descripcion, result)
        latency = (time.time() - start) * 1000
        self._update_stats(latency)
        return result

    def predict_anomaly(self, monto: float, categoria: str):
        """
        Detecta si una transacción es una anomalía considerando el monto y la categoría.
        """
        start = time.time()
        data = {"monto": monto, "categoria": categoria}
        cached = self.get_cache("anom", data)
        if cached: 
            latency = (time.time() - start) * 1000
            self._update_stats(latency)
            return cached

        input_df = pd.DataFrame([data])
        processed_data = self.anomaly_detector['preprocessor'].transform(input_df)
        prediction = self.anomaly_detector['model'].predict(processed_data)[0]
        score = self.anomaly_detector['model'].decision_function(processed_data)[0]
        
        is_anomaly = True if prediction == -1 else False
        result = {"monto": monto, "categoria": categoria, "es_anomalia": is_anomaly, "score": float(score)}
        
        self.set_cache("anom", data, result)
        latency = (time.time() - start) * 1000
        self._update_stats(latency)
        return result

ml_service = MLService.get_instance()
