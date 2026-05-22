import pandas as pd
import numpy as np
import joblib
import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Modelos de scikit-learn
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import IsolationForest
from sklearn.pipeline import Pipeline

# Cargar variables de entorno
load_dotenv()

def get_data():
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    db = os.getenv("POSTGRES_DB")
    host = os.getenv("POSTGRES_HOST", "localhost")
    if host == "postgres": host = "localhost" # Ajuste para ejecución local
    port = os.getenv("POSTGRES_PORT", "5432")
    
    engine = create_engine(f'postgresql://{user}:{password}@{host}:{port}/{db}')
    df = pd.read_sql('SELECT * FROM transacciones', engine)
    return df

def train_classification_model(df):
    print("Entrenando modelo de Clasificación de Gastos...")
    X = df['descripcion']
    y = df['categoria']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = Pipeline([
        ('tfidf', TfidfVectorizer()),
        ('clf', LogisticRegression(max_iter=1000))
    ])
    
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    print(f"Precisión del modelo de clasificación: {score:.2f}")
    
    joblib.dump(model, 'backend-python/app/models/classifier.pkl')
    print("Modelo de clasificación guardado.")

from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer

def train_anomaly_model(df):
    print("Entrenando modelo de Detección de Anomalías (contextualizado)...")
    # Usamos monto y categoria para detectar anomalías
    # OneHotEncoding para la categoría
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(), ['categoria'])
        ],
        remainder='passthrough' # Mantenemos el monto
    )
    
    X = preprocessor.fit_transform(df[['monto', 'categoria']])
    
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(X)
    
    # Guardamos tanto el preprocesador como el modelo
    joblib.dump({'preprocessor': preprocessor, 'model': model}, 'backend-python/app/models/anomaly_detector.pkl')
    print("Modelo de anomalías (contextualizado) guardado.")

def train_forecasting_model(df):
    print("Entrenando modelo de Predicción de Flujo de Caja...")
    # Agrupar por fecha para obtener el gasto diario
    df['fecha_dt'] = pd.to_datetime(df['fecha'])
    daily_spend = df.groupby(df['fecha_dt'].dt.date)['monto'].sum().reset_index()
    daily_spend.columns = ['fecha_dt', 'monto']
    
    # Asegurar que la nueva columna es datetime para el cálculo de días
    daily_spend['fecha_dt'] = pd.to_datetime(daily_spend['fecha_dt'])
    daily_spend['days'] = (daily_spend['fecha_dt'] - daily_spend['fecha_dt'].min()).dt.days
    
    X = daily_spend[['days']]
    y = daily_spend['monto']
    
    model = LinearRegression()
    model.fit(X, y)
    
    joblib.dump(model, 'backend-python/app/models/forecaster.pkl')
    print("Modelo de predicción de flujo guardado.")

if __name__ == "__main__":
    try:
        data = get_data()
        print(f"Datos cargados: {len(data)} registros.")
        
        # Asegurar que el directorio de modelos existe
        os.makedirs('backend-python/app/models', exist_ok=True)
        
        train_classification_model(data)
        train_anomaly_model(data)
        train_forecasting_model(data)
        
        print("\nTodos los modelos han sido entrenados y guardados exitosamente.")
        
    except Exception as e:
        print(f"Error durante el entrenamiento: {e}")
