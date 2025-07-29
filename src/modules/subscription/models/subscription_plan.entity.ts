import { BaseModel } from '@app/common';
import { Column, Entity } from 'typeorm';

@Entity('crib_subscription_plans')
export class SubscriptionPlan extends BaseModel {
  @Column({ unique: false, name: 'title' })
  public title?: string;

  @Column({ unique: false, type: 'longtext', name: 'description' })
  public description?: string;

  @Column('simple-array')
  public plan_features?: String[];

  @Column({ unique: false, name: 'price' ,type: 'decimal', precision: 10, scale: 2})
  public price?: number;

  @Column({ unique: false, type: 'longtext', name: 'artwork' })
  public artwork?: string;

    @Column('simple-array')
  public allowed_currencies?: String[];
}
