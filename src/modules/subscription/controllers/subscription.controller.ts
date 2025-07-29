import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
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
import { map, Observable, switchMap } from 'rxjs';
import { UpdateResult } from 'typeorm';
import { AuthTokenGuard } from '@app/common/shared/guards/auth-token.guard';

@Controller('subscriptions')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);
  constructor(public subscriptionService: SubscriptionService) {}

  @UseGuards(AuthTokenGuard)
  @Post('plan')
  @Header('Cache-Control', 'none')
  create(
    @Body() plan: SubscriptionPlan,
    @Req() requset,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    const userId = requset.user['id'];
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
  findAll(
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
  @Get('plans/:planId')
  //@AuditLog('Get SubscriptionPlan')
  @Header('Cache-Control', 'none')
  findOne(
    @Param('planId') planId: string,
    @Req() requset,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    const userId = requset.user['id'];
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
  update(
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
  delete(@Param('planId') planId: string): Observable<ApiResponse> {
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
}
