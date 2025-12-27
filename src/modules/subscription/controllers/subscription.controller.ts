import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionPlan } from '../models/subscription_plan.entity';
import {
  ApiResponse,
  ResponseCodes,
} from '@app/common/shared/models/api-response';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { UpdateResult } from 'typeorm';
import { AuthTokenGuard } from '@app/common/shared/guards/auth-token.guard';
import { Subscription } from '../models/subscription.entity';
import { SubscriptionPaymentService } from '../services/subscription_payment.service';
import { SubscriptionPayment } from '../models/subscription_payment.entity';
const crypto = require('crypto');
import { createCipheriv, randomBytes, scrypt } from 'node:crypto';
import { ConfigService } from '@nestjs/config';

@Controller('subscriptions')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);
  constructor(
    public subscriptionService: SubscriptionService,
    public subscriptionPaymentService: SubscriptionPaymentService,
    @Inject() private configService: ConfigService,
  ) {}

  @UseGuards(AuthTokenGuard)
  @Post('plan')
  @Header('Cache-Control', 'none')
  createPlan(
    @Body() plan: SubscriptionPlan,
    @Req() request,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    const userId = request.user['id'];
    plan.created_by = userId;
    const createdPlanResult$ = this.subscriptionService.createPlan(plan);
    return createdPlanResult$.pipe(
      map((createdPlan: SubscriptionPlan) => {
        response.code = ResponseCodes.SUCCESS.code;
        response.message = ResponseCodes.SUCCESS.message;
        response.data = { ...createdPlan };
        return response;
      }),
    );
  }

  @UseGuards(AuthTokenGuard)
  @Get('plans')
  @Header('Cache-Control', 'none')
  findAllPlans(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();

    return this.subscriptionService.findAllPlans({ page, limit }).pipe(
      map((plansPagable) => {
        const planItems = plansPagable.items;
        const planItemsMeta = plansPagable.meta;
        if (planItems.length > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = planItems;
          response.meta = planItemsMeta;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }

  @UseGuards(AuthTokenGuard)
  @Get('')
  @Header('Cache-Control', 'none')
  findUserSubscriptions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() request,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    const userId = request.user['id'];
    console.log('userId: ' + userId);
    return this.subscriptionService
      .findUserSubscriptions(userId, { page, limit })
      .pipe(
        map((plansPagable) => {
          const planItems = plansPagable.items;
          const planItemsMeta = plansPagable.meta;
          if (planItems.length > 0) {
            response.code = ResponseCodes.SUCCESS.code;
            response.message = ResponseCodes.SUCCESS.message;
            response.data = planItems;
            response.meta = planItemsMeta;
          } else {
            response.code = ResponseCodes.NO_RECORD_FOUND.code;
            response.message = ResponseCodes.NO_RECORD_FOUND.message;
          }
          return response;
        }),
      );
  }

  @UseGuards(AuthTokenGuard)
  @Get('plans/:planId')
  //@AuditLog('Get SubscriptionPlan')
  @Header('Cache-Control', 'none')
  findOnePlan(
    @Param('planId') planId: string,
    @Req() request,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    const userId = request.user['id'];
    //console.log('plan: ' + JSON.stringify(plan));
    const findById$ = this.subscriptionService.findOnePlan(planId);
    return findById$.pipe(
      map((plan) => {
        try {
          if (plan.hasId) {
            response.code = ResponseCodes.SUCCESS.code;
            response.message = ResponseCodes.SUCCESS.message;
            response.data = plan;
          } else {
            response.code = ResponseCodes.NO_RECORD_FOUND.code;
            response.message = ResponseCodes.NO_RECORD_FOUND.message;
          }
        } catch (e) {
          response.code = ResponseCodes.EXPECTION_ERROR.code;
          response.message = `${ResponseCodes.EXPECTION_ERROR.message}: ${e.message}`;
        }

        return response;
      }),
    );
  }

  @UseGuards(AuthTokenGuard)
  @Put('plans/:planId')
  @Header('Cache-Control', 'none')
  updateOnePlan(
    @Param('planId') planId: string,
    @Body() plan: SubscriptionPlan,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    plan.id = planId;
    return this.subscriptionService.updatePlan(plan).pipe(
      switchMap((plan: UpdateResult) => {
        if (plan.affected > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;

          return this.subscriptionService.findOnePlan(planId).pipe(
            map((plan) => {
              if (plan.hasId) {
                response.code = ResponseCodes.SUCCESS.code;
                response.message = ResponseCodes.SUCCESS.message;
                response.data = plan;
              } else {
                response.code = ResponseCodes.NO_RECORD_FOUND.code;
                response.message = ResponseCodes.NO_RECORD_FOUND.message;
              }
              return response;
            }),
          );
        } else {
          response.code = ResponseCodes.FAILED.code;
          response.message = ResponseCodes.FAILED.message;
        }
      }),
    );
  }

  @UseGuards(AuthTokenGuard)
  @Delete('plans/:planId')
  @Header('Cache-Control', 'none')
  deletePlan(@Param('planId') planId: string): Observable<ApiResponse> {
    let response = new ApiResponse();
    return this.subscriptionService.deletePlan(planId).pipe(
      map((role) => {
        if (role.affected > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }

  @UseGuards(AuthTokenGuard)
  @Post('create')
  @Header('Cache-Control', 'none')
  create(
    @Body() subscription: Subscription,
    @Req() request,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    const userId = request.user['id'];
    subscription.created_by = userId;
    subscription.user_id = userId;
    const createdSubscriptionResult$ =
      this.subscriptionService.subscribe(subscription);
    return createdSubscriptionResult$.pipe(
      map((createdSubscription: Subscription) => {
        response.code = ResponseCodes.SUCCESS.code;
        response.message = ResponseCodes.SUCCESS.message;
        response.data = { ...createdSubscription };
        return response;
      }),
    );
  }

  @UseGuards(AuthTokenGuard)
  @Post('payment/init')
  @Header('Cache-Control', 'none')
  makePayment(
    @Body() payment: SubscriptionPayment,
    @Req() request,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    const userId = request.user['id'];
    payment.created_by = userId;
    payment.user_id = userId;
    const createdSubscriptionPaymentResult$ =
      this.subscriptionPaymentService.createPayment(payment);
    return createdSubscriptionPaymentResult$.pipe(
      map((createdSubscriptionPayment: SubscriptionPayment) => {
        response.code = ResponseCodes.SUCCESS.code;
        response.message = ResponseCodes.SUCCESS.message;
        response.data = { ...createdSubscriptionPayment };
        return response;
      }),
    );
  }

  @HttpCode(200)
  @Post('payment/callback')
  @Header('Cache-Control', 'none')
  paymentCallback(@Body() paymentCallback: any): Observable<ApiResponse> {
    let response = new ApiResponse();
    this.subscriptionPaymentService.updatePaymentFromCallback(paymentCallback);
    response.code = ResponseCodes.SUCCESS.code;
    response.message = ResponseCodes.SUCCESS.message;
    return of(response);
  }

  @HttpCode(200)
  @Post('payment/webhook')
  @Header('Cache-Control', 'none')
  paymentWebhook(
    @Body() paymentWebhook: any,
    @Req() request,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    const secret = this.configService.get('PAYSTACK_SECRET_KEY');
    //const paystackSignature = paystackResponse.headers['x-paystack-signature'];
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(request.body))
      .digest('hex');
    if (hash == request.headers['x-paystack-signature']) {
      // Retrieve the request's body
      this.subscriptionPaymentService.updatePaymentFromWebhook(paymentWebhook);
      response.code = ResponseCodes.SUCCESS.code;
      response.message = ResponseCodes.SUCCESS.message;
      this.logger.log(response);
      return of(response);
    } else {
      response.code = ResponseCodes.FAILED.code;
      response.message = 'Invalid signature';
      this.logger.log(response);
      throw new BadRequestException(response);
    }
  }
}
