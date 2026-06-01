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
        Si falla Redis, devuelve valores por defecto.
        """
        try:
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
        except Exception:
            return {"latency_ms": 0, "throughput_s": 0, "total_processed": 0}

    def _update_stats(self, latency_ms):
        """
        Actualiza las métricas de rendimiento en Redis.
        """
        if not self.redis_client:
            return
        try:
            self.redis_client.set("stats:latency", latency_ms)
            self.redis_client.incr("stats:total_processed")
        except Exception:
            pass

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
        Establece la conexión con el servidor Redis, limpiando el host si es necesario.
        """
        try:
            # Limpiar el host por si se incluyó el protocolo o puerto accidentalmente
            clean_host = settings.REDIS_HOST.replace("https://", "").replace("http://", "").split(":")[0].split("/")[0]
            
            self.redis_client = redis.Redis(
                host=clean_host,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                ssl=settings.REDIS_SSL,
                db=0,
                decode_responses=True,
                socket_timeout=5
            )
            self.redis_client.ping()
            print(f"Conexión a Redis establecida en {clean_host}")
        except Exception as e:
            print(f"Aviso: Falló la conexión a Redis ({e}). Operando sin caché.")
            self.redis_client = None

    def get_cache(self, key_prefix, data):
        """
        Obtiene datos desde la caché de Redis.
        """
        if not self.redis_client: return None
        try:
            key = f"{key_prefix}:{hashlib.md5(json.dumps(data).encode()).hexdigest()}"
            cached = self.redis_client.get(key)
            return json.loads(cached) if cached else None
        except Exception:
            return None

    def set_cache(self, key_prefix, data, result, expire=3600):
        """
        Guarda datos en la caché de Redis.
        """
        if not self.redis_client: return
        try:
            key = f"{key_prefix}:{hashlib.md5(json.dumps(data).encode()).hexdigest()}"
            self.redis_client.setex(key, expire, json.dumps(result))
        except Exception:
            pass

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
