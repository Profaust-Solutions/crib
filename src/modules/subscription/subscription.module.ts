import { Module } from '@nestjs/common';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionController } from './controllers/subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './models/subscription_plan.entity';
import { SharedModule } from '@app/common';
import { Subscription } from './models/subscription.entity';
import { SubscriptionPaymentService } from './services/subscription_payment.service';
import { SubscriptionPayment } from './models/subscription_payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      Subscription,
      SubscriptionPayment,
    ]),
    SharedModule,
  ],
  providers: [SubscriptionService, SubscriptionPaymentService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
