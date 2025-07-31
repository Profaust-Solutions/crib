import { Inject, Injectable, Scope } from '@nestjs/common';
import { SubscriptionPayment } from '../models/subscription_payment.entity';
import { Subscription } from '../models/subscription.entity';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { from, Observable } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class SubscriptionPaymentService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(SubscriptionPayment)
    public readonly subscriptionPaymentRepository: Repository<SubscriptionPayment>,
    @InjectRepository(Subscription)
    public readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  public updatePayment = (payment: SubscriptionPayment) =>
    from(this.subscriptionPaymentRepository.update(payment.id, payment));

  public createPayment(
    payment: SubscriptionPayment,
  ): Observable<SubscriptionPayment> {
    const createdPayment = this.subscriptionPaymentRepository.create(payment);
    return from(this.subscriptionPaymentRepository.save(createdPayment));
  }
}
