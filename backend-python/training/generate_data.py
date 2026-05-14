import argparse
import pandas as pd
import numpy as np
from faker import Faker
import random
from datetime import datetime, timedelta
import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

fake = Faker('es_ES')

CATEGORIES = [
    "Alimentación", "Transporte", "Vivienda", "Ocio", 
    "Salud", "Educación", "Compras", "Suscripciones", "Otros"
]

def generate_transactions(rows=10000):
    data = []
    start_date = datetime.now() - timedelta(days=365)
    
    for _ in range(rows):
        date = fake.date_time_between(start_date=start_date, end_date='now')
        category = random.choice(CATEGORIES)
        
        # Lógica de montos base por categoría
        if category == "Vivienda":
            amount = round(random.uniform(500, 1500), 2)
        elif category == "Alimentación":
            amount = round(random.uniform(10, 150), 2)
        elif category == "Transporte":
            amount = round(random.uniform(5, 60), 2)
        else:
            amount = round(random.uniform(1, 200), 2)
            
        # Simular anomalías (5% de los datos)
        is_anomaly = 1 if random.random() < 0.05 else 0
        if is_anomaly:
            amount = round(amount * random.uniform(5, 15), 2) # Monto inusualmente alto
            
        data.append({
            "fecha": date,
            "monto": amount,
            "categoria": category,
            "descripcion": fake.sentence(nb_words=4),
            "es_anomalia": is_anomaly
        })
        
    return pd.DataFrame(data)

def save_to_db(df):
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    db = os.getenv("POSTGRES_DB")
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    
    engine = create_engine(f'postgresql://{user}:{password}@{host}:{port}/{db}')
    df.to_sql('transacciones', engine, if_exists='replace', index=True, index_label='id')
    print(f"Datos cargados exitosamente en la tabla 'transacciones' de {db}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generar datos sintéticos para FinGuard')
    parser.add_argument('--rows', type=int, default=10000, help='Número de filas a generar')
    parser.add_argument('--csv', action='store_true', help='Guardar también como CSV')
    parser.add_argument('--no-db', action='store_true', help='No cargar en la base de datos')
    
    args = parser.parse_args()
    
    print(f"Generando {args.rows} transacciones...")
    df = generate_transactions(args.rows)
    
    if args.csv:
        df.to_csv('backend-python/training/data_sintetica.csv', index=False)
        print("Archivo CSV guardado en backend-python/training/data_sintetica.csv")
        
    if not args.no_db:
        try:
            save_to_db(df)
        except Exception as e:
            print(f"Error al conectar con la base de datos: {e}")
            print("Asegúrate de que el contenedor de PostgreSQL esté corriendo.")
