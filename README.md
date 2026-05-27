# FinGuard

Sistema de gestión financiera inteligente para la detección de anomalías (fraude), clasificación automática de gastos y predicción de flujo de caja.

## Arquitectura
El sistema se compone de tres servicios principales orquestados mediante Docker:
- **Frontend**: Next.js 14 (Dashboard interactivo).
- **Backend Node.js**: Express + TypeScript (API Gateway).
- **Backend Python**: FastAPI (Modelos de IA).
- **Almacenamiento**: PostgreSQL + Redis (Caché).

## Requisitos previos
- Docker y Docker Compose instalados.
- Node.js (v20+ recomendado) y Python (v3.12+).

## Configuración Inicial
1. Clona el repositorio.
2. Crea los archivos `.env` en cada directorio siguiendo los ejemplos `.env.example`:
   - `backend-node/.env.example`
   - `backend-python/.env.example`
   - `.env` (en la raíz para variables compartidas).
3. **Personalización (Opcional)**: El archivo `docker-compose.yml` utiliza variables de entorno para las credenciales. Puedes sobrescribirlas en tu archivo `.env` de la raíz (ej: `POSTGRES_PASSWORD=mi_secreto`).

## Pipeline de Inteligencia Artificial
El sistema requiere modelos pre-entrenados para funcionar. Sigue estos pasos en orden:

1. **Generación de Datos Sintéticos**:
   ```bash
   # Instala dependencias si no usas Docker para este paso
   pip install -r backend-python/requirements.txt
   
   # Genera 10k registros (cargará los datos en la DB configurada)
   python backend-python/training/generate_data.py --rows 10000
   ```

2. **Entrenamiento de Modelos**:
   ```bash
   # Entrena y genera archivos .pkl en backend-python/app/models/
   python backend-python/training/train_models.py
   ```

## Comandos de inicio
```bash
# Iniciar todos los servicios con Docker (Recomendado)
docker-compose up --build
```

## Pruebas (Testing)
- **Backend Node**: `cd backend-node && npm test`
- **Backend Python**: `cd backend-python && pytest`

## Base de Datos: Mantenimiento y Backups

### Índices de Rendimiento
Se han implementado índices en los campos `fecha` y `categoria` de la tabla `transacciones` para garantizar tiempos de respuesta rápidos en el dashboard, incluso con grandes volúmenes de datos.

### Estrategia de Backup
Para realizar una copia de seguridad:

```bash
docker-compose exec postgres pg_dump -U ${POSTGRES_USER:-postgres} ${POSTGRES_DB:-finguard} > backup.sql
```

Para restaurar una copia de seguridad:

```bash
cat backup.sql | docker-compose exec -T postgres psql -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-finguard}
```
