import { Inject, Injectable, Scope } from '@nestjs/common';
import { SubscriptionPayment } from '../models/subscription_payment.entity';
import { Subscription } from '../models/subscription.entity';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';

@Injectable({ scope: Scope.REQUEST })
export class SubscriptionPaymentService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(SubscriptionPayment)
    public readonly subscriptionPaymentRepository: Repository<SubscriptionPayment>,
    @InjectRepository(Subscription)
    public readonly subscriptionRepository: Repository<Subscription>,
    @Inject() private configService: ConfigService,
    @Inject() private readonly httpService: HttpService,
  ) {}

  public updatePayment = (payment: SubscriptionPayment) =>
    from(this.subscriptionPaymentRepository.update(payment.id, payment));

  public updatePaymentFromCallback = (payment: any) =>
    from(this.subscriptionPaymentRepository.update(payment.id, payment));

  public createPayment(
    payment: SubscriptionPayment,
  ): Observable<SubscriptionPayment> {
    const createdPayment = this.subscriptionPaymentRepository.create(payment);

    return from(this.subscriptionPaymentRepository.save(createdPayment)).pipe(
      switchMap((savedPayment: SubscriptionPayment) =>
        this.initialTransactionApiCall(savedPayment).pipe(
          map((paystackResponse) => {
            const data = paystackResponse.data?.data;

            // update saved payment with paystack details
            savedPayment.access_code = data.access_code;
            savedPayment.payment_reference = data.reference;

            return savedPayment;
          }),
          switchMap((updatedPayment: SubscriptionPayment) =>
            from(this.subscriptionPaymentRepository.save(updatedPayment)),
          ),
        ),
      ),
    );
  }

  public initialTransactionApiCall(
    createdPayment: SubscriptionPayment,
  ): Observable<any> {
    let channels = ['card', 'mobile_money', 'apple_pay'];

    let paymentInitR = {
      email: createdPayment.email,
      amount: createdPayment.amount,
      currency: createdPayment.currency,
      reference: createdPayment.id,
      channels: channels,
    };

    let requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.configService.get('PAYSTACK_SECRET_KEY')}`,
      },
    };

    return this.httpService.post(
      `${this.configService.get('PAYSTACK_INITIALISE_TRANSACTION_URL')}`,
      paymentInitR,
      requestConfig,
    );
  }
}
