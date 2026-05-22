import fs from 'fs';
import path from 'path';
import sequelize from '../services/database';

const migrate = async () => {
  try {
    console.log('Iniciando migraciones...');
    const migrationPath = path.resolve(__dirname, '../../migrations/001-initial-schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await sequelize.query(sql);
    console.log('Migración 001-initial-schema.sql ejecutada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
};

migrate();
