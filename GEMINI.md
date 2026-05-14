# FinGuard - Instrucciones para Gemini Code Assist

## Objetivo del proyecto
Detectar anomalías (fraude simulado), clasificar gastos automáticamente y generar reportes predictivos de flujo de caja.

## Stack obligatorio
- Frontend: Next.js 14 (TypeScript, Tailwind, shadcn/ui)
- Backend Node.js: Express + TypeScript (API gateway)
- Backend Python: FastAPI + Pydantic (modelos IA)
- Base de datos: PostgreSQL
- Caché: Redis
- Orquestación: Docker Compose

## Arquitectura
Next.js → Node.js (BFF) → FastAPI (modelos) → PostgreSQL/Redis

## Reglas de codificación
- TypeScript en frontend y Node.js: tipos estrictos, evitar `any`.
- Python: type hints y Pydantic para schemas.
- Formato: Prettier (JS/TS), Black (Python).
- Comentarios y docstrings en español.
- Manejo de errores: siempre try/catch, códigos HTTP adecuados, no exponer internos.

## Estructura de carpetas (no mezclar)
- `frontend/` - Next.js
- `backend-node/` - Express
- `backend-python/` - FastAPI
- `docker-compose.yml`
- `.env`

## Modelos de IA (locales, sin APIs externas en primera versión)
- Clasificación: LogisticRegression + TF-IDF
- Anomalías: Isolation Forest
- Predicción flujo: LinearRegression
- Modelos guardados en `backend-python/app/models/*.pkl`
- Cargar al inicio de FastAPI (evento startup)

## Caché
- Redis TTL 1 hora para resultados de FastAPI (hash de input)

## Datos sintéticos
- Generar 10k transacciones con Faker.
- Script reproducible: `python backend-python/training/generate_data.py --rows 10000`

## Pruebas
- Python: pytest
- Node.js: jest
- Frontend: React Testing Library

## Despliegue final
- Frontend: Vercel
- Node.js: Railway
- Python: Render (Docker)
- PostgreSQL: Neon.tech
- Redis: Upstash

## Planificación por semanas (recordatorio)
- Semana 1: Setup, docker-compose, datos sintéticos, carga a PostgreSQL.
- Semana 2: Entrenar modelos → .pkl, pruebas.
- Semana 3: FastAPI endpoints + Redis.
- Semana 4: Node.js endpoints.
- Semana 5: Frontend (dashboard, gráficos).
- Semana 6: Despliegue, README, video demo.

## Restricciones
- No hardcodear variables de entorno (usar `.env`).
- No subir modelos >100 MB a Git.
- No datos reales, solo sintéticos.
- Validar inputs (Zod en Node, Pydantic en Python).

## Comunicación de la IA
- Responde en español.
- Explica el porqué de decisiones técnicas.
- Antes de escribir múltiples archivos, pregunta si quieres ver el plan.