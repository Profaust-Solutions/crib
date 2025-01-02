import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        url: configService.get('DATABASE_URL'),
        type: 'mysql',
        logging: true,
        synchronize: true,
        //subscribers: [AuditLogSubscriber],
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],  // this will automatically load all entity file in the src folder
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {
    static forFeature(models: any[]) {
        return TypeOrmModule.forFeature(models);
      }
}
