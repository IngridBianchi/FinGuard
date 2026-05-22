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
3. **Migraciones de Base de Datos**:
   Asegúrate de que PostgreSQL esté corriendo y ejecuta:
   ```bash
   cd backend-node
   npm install
   npm run db:migrate
   ```

## Pipeline de Inteligencia Artificial
El sistema requiere modelos pre-entrenados para funcionar. Sigue estos pasos para generarlos:

1. **Generación de Datos Sintéticos**:
   ```bash
   # Desde la raíz
   python backend-python/training/generate_data.py --rows 10000
   ```
   *Nota: Esto cargará los datos directamente en la base de datos PostgreSQL.*

2. **Entrenamiento de Modelos**:
   ```bash
   python backend-python/training/train_models.py
   ```
   Esto generará los archivos `.pkl` en `backend-python/app/models/`.

## Comandos de inicio
```bash
# Iniciar todos los servicios con Docker
docker-compose up --build
```

## Pruebas (Testing)
- **Backend Node**: `cd backend-node && npm test`
- **Backend Python**: `cd backend-python && pytest`

## Base de Datos: Mantenimiento y Backups

### Índices de Rendimiento
Se han creado índices automáticos en los campos `fecha` y `categoria` para optimizar las consultas del dashboard.

### Estrategia de Backup
Para realizar una copia de seguridad de la base de datos PostgreSQL:

```bash
docker-compose exec postgres pg_dump -U postgres finguard > backup.sql
```

Para restaurar una copia de seguridad:

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d finguard
```
