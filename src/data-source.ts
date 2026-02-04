import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * TypeORM CLI data source (migrations). Runs outside NestJS, so env is loaded
 * via dotenv above. Supports DATABASE_URL or DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME.
 */
const DATABASE_URL = process.env.DATABASE_URL;
const dbConfig = DATABASE_URL
  ? { type: 'postgres' as const, url: DATABASE_URL }
  : {
      type: 'postgres' as const,
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'students_db',
    };

export default new DataSource({
  ...dbConfig,
  entities: [__dirname + '/students/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
