import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

config({ path: '.env' });

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  entities: [join(__dirname, '**', '*.entity.{ts,js}')], // this will automatically load all entity file in the src folder
  migrationsTableName: 'migrations',
  migrationsRun: false,
  synchronize: process.env.ENV !== 'production',
  logging: process.env.ENV !== 'production',
  extra: {
    connectionLimit: 10, // Adjust based on your database connection pool requirements
  },
};

const dataSource = new DataSource(dataSourceOptions);

// You might want to do
// dataSource.initialize()
// but I found mine working regardless of it

export default dataSource;
function dotenvConfig(arg0: { path: string; }) {
    throw new Error('Function not implemented.');
}

