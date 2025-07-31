import { BaseModel } from '@app/common';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity('crib_subscription_payments')
export class SubscriptionPayment extends BaseModel {
  @Column({ unique: false, name: 'subscription_id' })
  subscription_id: String;

  @Column({ unique: false, name: 'user_id' })
  user_id: String;

  @Column({ unique: false, name: 'currency' })
  currency: String;

  @Column({ unique: false, name: 'amount' })
  amount: number;

  @Column({ unique: false, name: 'payment_method' })
  payment_method: String;

  @Column({ name: 'payment_date', type: 'timestamp' })
  payment_date: Date;

  @Column({ name: 'payment_reference', type: 'timestamp' })
  payment_reference: String;

  @Column({ name: 'payment_status' })
  payment_status: String;

  @Column("simple-array")
  public meta_data?: [];

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;
}
