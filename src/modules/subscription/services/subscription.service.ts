import { REQUEST } from '@nestjs/core';
import { SubscriptionPlan } from '../models/subscription_plan.entity';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../models/subscription.entity';
import { from, Observable } from 'rxjs';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

@Injectable({ scope: Scope.REQUEST })
export class SubscriptionService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(SubscriptionPlan)
    public readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription)
    public readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  public findOnePlan = (id: string) =>
    from(this.subscriptionPlanRepository.findOneBy({ id }));

  public updatePlan = (plan: SubscriptionPlan) =>
    from(this.subscriptionPlanRepository.update(plan.id, plan));

  public deletePlan = (id: string) =>
    from(this.subscriptionPlanRepository.delete(id));

  public createPlan(plan: SubscriptionPlan): Observable<SubscriptionPlan> {
    const createdPlan = this.subscriptionPlanRepository.create(plan);
    return from(this.subscriptionPlanRepository.save(createdPlan));
  }

  public findAllPlans = (options: IPaginationOptions) =>
    from(
      paginate<SubscriptionPlan>(this.subscriptionPlanRepository, options, {}),
    );

    
  public findUserSubscriptions(userId: string,options: IPaginationOptions){
    return from(
      paginate<Subscription>(this.subscriptionRepository, options, {
        where: {
          user_id: userId,
        },
        relations: ['plan'],
      }),
    );
  }

  public subscribe(plan: Subscription): Observable<Subscription> {
    const createdPlan = this.subscriptionRepository.create(plan);
    return from(this.subscriptionRepository.save(createdPlan));
  }

    public findSubscriptions = (options: IPaginationOptions) =>
      from(paginate<Subscription>(this.subscriptionRepository, options));
}
