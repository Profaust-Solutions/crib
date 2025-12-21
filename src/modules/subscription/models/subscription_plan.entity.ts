import { BaseModel } from '@app/common';
import { Column, Entity, OneToMany } from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity('crib_subscription_plans')
export class SubscriptionPlan extends BaseModel {
  @Column({ unique: false, name: 'title' })
  public title?: string;

  @Column({ unique: false, type: 'longtext', name: 'description' })
  public description?: string;

  @Column({ type: 'int', name: 'number_of_apartments', default: 0 })
  public number_of_apartments?: number;

  @Column('simple-array')
  public plan_features?: String[];

  @Column({
    unique: false,
    name: 'price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  public price?: number;

  @Column({ unique: false, name: 'billing_cycle', default: 'monthly' })
  public billing_cycle?: string;

  @Column({ unique: false, type: 'longtext', name: 'artwork' })
  public artwork?: string;

  @Column('simple-array')
  public allowed_currencies?: String[];

  @OneToMany(() => Subscription, (subscription) => subscription.plan,{
    eager: false, // Don't automatically load teams with every user query
    cascade: false, // Prevent cascading operations to teams
  })
  subscriptions: Subscription[];
}
