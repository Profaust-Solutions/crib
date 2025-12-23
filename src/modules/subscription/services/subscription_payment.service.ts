import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { SubscriptionPayment } from '../models/subscription_payment.entity';
import { Subscription } from '../models/subscription.entity';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable({ scope: Scope.REQUEST })
export class SubscriptionPaymentService {
  private readonly logger = new Logger(SubscriptionPaymentService.name);
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(SubscriptionPayment)
    public readonly subscriptionPaymentRepository: Repository<SubscriptionPayment>,
    @InjectRepository(Subscription)
    public readonly subscriptionRepository: Repository<Subscription>,
    @Inject() private userService: UserService,
    @Inject() private configService: ConfigService,
    @Inject() private readonly httpService: HttpService,
  ) {}

  public updatePayment = (payment: SubscriptionPayment) =>
    from(this.subscriptionPaymentRepository.update(payment.id, payment));

  public updatePaymentFromCallback(callbackP: any): void {
    //let callbackP = JSON.parse(paymentR);
    this.logger.log(callbackP);
    const event = callbackP['event'];
    const data = callbackP['data'];

    if (event == 'charge.success') {
      const status = data['status'];
      const reference = data['offline_reference'];
      const paid = data['paid'];
      const payment_date = data['paid_at'];

      //find subscription and update status
      const subscription$ = from(
        this.subscriptionRepository.findOneBy({ id: reference }),
      );
      subscription$
        .pipe(
          switchMap((subscription: Subscription) => {
            let roleToUpdate = subscription.update_role.toString();
            const userId = subscription.user_id.toString();

            const updatePayment$ = from(
              this.subscriptionPaymentRepository.update(reference, {
                payment_status: 'paid',
                payment_date: payment_date,
              }),
            );
            const updateSub$ = from(
              this.subscriptionRepository.update(reference, {
                status: 'active',
              }),
            );

            const updateUserR$ = from(
              this.userService.updatePartial({
                id: userId,
                role: roleToUpdate,
              }),
            );
            return forkJoin([updatePayment$, updateSub$, updateUserR$]);
          }),
        )
        .subscribe();
    } else if (event == 'charge.pending') {
      const status = data['status'];
      const reference = data['offline_reference'];
      const paid = data['paid'];
      const payment_date = data['paid_at'];

      this.subscriptionPaymentRepository.update(reference, {
        payment_status: status,
      });
    }
  }

  public updatePaymentFromWebhook(webhookP: any): void {
    //let callbackP = JSON.parse(paymentR);
    this.logger.log(webhookP);
    const event = webhookP['event'];
    const data = webhookP['data'];

    if (event == 'charge.success') {
      const status = data['status'];
      let reference = data['offline_reference'];
      const paid = data['paid'];
      const payment_date = data['paid_at'];
      const channel = data['channel'];

      if (channel == 'mobile_money') {
        reference = data['reference'];
      }

      const payment$ = from(
        this.subscriptionPaymentRepository.findOneBy({ id: reference }),
      );

      payment$.pipe(
        switchMap((payment: SubscriptionPayment) => {
          let subscriptionId = payment.subscription_id.toString();
          //find subscription and update status
          const subscription$ = from(
            this.subscriptionRepository.findOneBy({ id: subscriptionId }),
          );

          return subscription$.pipe(
            switchMap((subscription: Subscription) => {
              const roleToUpdate = subscription.update_role.toString();
              const subId = subscription.id;
              const userId = subscription.user_id.toString();

              const updatePayment$ = from(
                this.subscriptionPaymentRepository.update(reference, {
                  payment_status: 'paid',
                  payment_date: payment_date,
                }),
              );
              const updateSub$ = from(
                this.subscriptionRepository.update(subId, {
                  status: 'active',
                }),
              );

              const updateUserR$ = from(
                this.userService.updatePartial({
                  id: userId,
                  role: roleToUpdate,
                }),
              );
              return forkJoin([updatePayment$, updateSub$, updateUserR$]);
            }),
          );
        }),
      ).subscribe();
    } else if (event == 'charge.pending') {
      const status = data['status'];
      const reference = data['offline_reference'];
      const paid = data['paid'];
      const payment_date = data['paid_at'];

      this.subscriptionPaymentRepository.update(reference, {
        payment_status: status,
      });
    }
  }

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
  ): Observable<AxiosResponse> {
    let channels = ['mobile_money', 'card', 'apple_pay'];

    let paymentInitR = {
      email: createdPayment.email,
      amount: createdPayment.amount,
      currency: createdPayment.currency,
      reference: createdPayment.id,
      channels: channels,
      callback_url: this.configService.get('PAYSTACK_CALLBACK_URL'),
      webhook_url: this.configService.get('PAYSTACK_WEBHOOK_URL'),
    };

    let requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.configService.get('PAYSTACK_SECRET_KEY')}`,
      },
    };

    this.logger.log(paymentInitR);

    return this.httpService.post(
      `${this.configService.get('PAYSTACK_INITIALISE_TRANSACTION_URL')}`,
      paymentInitR,
      requestConfig,
    );
  }
}
