import { BaseModel } from '@app/common';
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne } from 'typeorm';
import { SubscriptionPlan } from './subscription_plan.entity';

@Entity('crib_subscriptions')
export class Subscription extends BaseModel {

  @Column({ unique: false, name: 'name', default: new Date().toISOString() })
  name: String;

  @Column({ unique: false, name: 'user_id' })
  user_id: String;

  @Column({ unique: false, name: 'plan_id' })
  plan_id: String;

  @Column({ name: 'start_date', type: 'timestamp' })
  start_date: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  end_date: Date;

  @Column({ name: 'next_billing_date', type: 'timestamp', nullable: true })
  next_billing_date: Date;

  @Column({ unique: false, name: 'status', default: 'PENDING_PAYMENT' })
  status: String;

  @Column({ unique: false, name: 'duration', default: 6 })
  duration: number;

  @Column({ unique: false, name: 'update_role', default: 'manager' })
  update_role: String;

  @ManyToMany(() => SubscriptionPlan)
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;
}
