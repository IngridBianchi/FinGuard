import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import transactionRoutes from './routes/transactionRoutes';
import { errorHandler } from './middleware/errorHandler';
import { morganMiddleware } from './middleware/logger';

const app = express();
const swaggerDocument = YAML.load(path.resolve(__dirname, '../openapi.yaml'));

app.use(helmet());

// Configuración restringida de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones, intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging estructurado
app.use(morganMiddleware);

app.use(express.json());

// Documentación API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas
app.use('/api/transactions', transactionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend-node' });
});

// Manejador de errores global
app.use(errorHandler);

export default app;
