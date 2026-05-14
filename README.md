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

## Configuración
1. Clona el repositorio.
2. Crea los archivos `.env` en cada directorio siguiendo los ejemplos `.env.example`:
   - `backend-node/.env.example`
   - `backend-python/.env.example`
   - `.env` (en la raíz para variables compartidas).

## Comandos de inicio
```bash
# Iniciar todos los servicios
docker-compose up --build
```

## Estructura de servicios
- `backend-node/`: Gateway que valida y coordina las solicitudes.
- `backend-python/`: Servicio de inferencia de modelos IA.
- `frontend/`: UI con shadcn/ui y Tailwind.

## Generación de datos
Para generar los datos sintéticos de prueba:
```bash
python backend-python/training/generate_data.py --rows 10000
```
