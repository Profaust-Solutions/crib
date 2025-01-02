import { Module } from '@nestjs/common';
import {
    ConfigService,
    ConfigModule as NestConfigModule,
  } from '@nestjs/config';

@Module({
    imports: [NestConfigModule.forRoot({
        envFilePath: ['src/config/.dev.env', 'src/config/.prod.env'],
        isGlobal: true,
    })],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
