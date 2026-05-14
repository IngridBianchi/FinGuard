import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './services/database';
import transactionRoutes from './routes/transactionRoutes';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Rutas
app.use('/api/transactions', transactionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend-node' });
});

const connectWithRetry = async (retries = 5) => {
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('Conexión a PostgreSQL establecida.');
      app.listen(PORT, () => {
        console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`);
      });
      return;
    } catch (err) {
      console.error('Error conectando a DB, reintentando en 5 segundos...', err);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  process.exit(1);
};

connectWithRetry();
