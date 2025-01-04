import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule, SharedModule } from '@app/common';
import { BillModule } from '../bill/bill.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PropertyModule } from '../property/property.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'bills_and_collections',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3001,
        },
      },
      {
        name: 'authentication',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3002,
        },
      },
    ]),
    DatabaseModule, SharedModule, BillModule,PropertyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
