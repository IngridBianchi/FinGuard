import app from './app';
import sequelize from './services/database';

// Validación de variables de entorno obligatorias
const requiredEnv = ['POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_HOST'];
requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    console.error(`Error: La variable de entorno ${env} no está definida.`);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3001;

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
