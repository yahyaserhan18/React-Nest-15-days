import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * TypeORM CLI data source (migrations). Runs outside NestJS, so env is loaded
 * via dotenv above; ConfigService is not available in this context.
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'students_db',
  entities: [__dirname + '/students/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
