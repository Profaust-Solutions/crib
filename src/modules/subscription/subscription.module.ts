import { Module } from '@nestjs/common';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionController } from './controllers/subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './models/subscription_plan.entity';
import { SharedModule } from '@app/common';
import { Subscription } from './models/subscription.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SubscriptionPlan,Subscription]),SharedModule],
    providers: [SubscriptionService],
    controllers: [SubscriptionController],
    exports: [SubscriptionService],
})
export class SubscriptionModule {}
