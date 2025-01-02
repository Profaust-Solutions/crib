import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BillModule } from '../bill/bill.module';
import { DatabaseModule } from '@app/common/database';
import { SharedModule } from '@app/common/shared';

@Module({
  imports: [DatabaseModule, SharedModule, BillModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
