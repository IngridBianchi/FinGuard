-- 001-initial-schema.sql
-- Creación inicial de la tabla de transacciones

CREATE TABLE IF NOT EXISTS transacciones (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto DOUBLE PRECISION NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    es_anomalia BOOLEAN DEFAULT FALSE
);

-- Índices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(fecha);
CREATE INDEX IF NOT EXISTS idx_transacciones_categoria ON transacciones(categoria);
