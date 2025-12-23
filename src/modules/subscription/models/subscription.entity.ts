import { BaseModel } from '@app/common';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { SubscriptionPlan } from './subscription_plan.entity';
import { Apartment } from 'src/modules/property/models/apartment.entity';

@Entity('crib_subscriptions')
export class Subscription extends BaseModel {
  @Column({
    unique: false,
    name: 'account_name',
    default: new Date().toISOString(),
  })
  account_name: String;

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

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.subscriptions, {
    eager: false, // Don't automatically load plans with every user query
    cascade: false, // Prevent cascading operations to plans
  })
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @OneToMany(() => Apartment, (apartment) => apartment.subscription, {
    eager: false,
    cascade: false,
  })
  //@JoinColumn({ name: 'id' })
  apartments: Apartment[];
}
