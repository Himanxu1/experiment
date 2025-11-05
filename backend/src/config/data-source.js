import { DataSource } from 'typeorm';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'analytics_user',
  password: process.env.DB_PASSWORD || 'analytics_password',
  database: process.env.DB_NAME || 'excel_analytics',
  synchronize: process.env.NODE_ENV === 'development', // Auto-sync schema in dev
  logging: process.env.NODE_ENV === 'development',
  entities: [join(__dirname, '..', 'entities', '*.js')],
  migrations: [join(__dirname, '..', 'migrations', '*.js')],
  subscribers: [],
});

export default AppDataSource;
