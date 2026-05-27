import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    POSTGRES_USER: str = Field(..., env="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field(..., env="POSTGRES_PASSWORD")
    POSTGRES_DB: str = Field(..., env="POSTGRES_DB")
    POSTGRES_HOST: str = Field(..., env="POSTGRES_HOST")
    POSTGRES_PORT: str = Field(..., env="POSTGRES_PORT")
    
    REDIS_HOST: str = Field(..., env="REDIS_HOST")
    REDIS_PORT: int = Field(..., env="REDIS_PORT")
    REDIS_PASSWORD: str = Field(None, env="REDIS_PASSWORD")
    REDIS_SSL: bool = Field(False, env="REDIS_SSL")
    
    class Config:
        # Buscar el archivo .env en la raíz del proyecto
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env")
        extra = "ignore"

try:
    settings = Settings()
except Exception as e:
    print(f"ERROR CRÍTICO: Error en la configuración o faltan variables de entorno: {e}")
    raise e
