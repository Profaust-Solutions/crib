import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@app/common';
import { PaymentRequest } from './models/payment-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentRequest]), SharedModule],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
