import { BaseModel } from '@app/common/shared/models/base-model';
import {
  BeforeInsert,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('crib_properties')
export class Property extends BaseModel {
  @Column({ unique: false, name: 'user_id' })
  public user_id?: string;

  @Column({ unique: false, name: 'subscription_id' })
  public subscription_id?: string;

  @Column({ unique: false, name: 'label' })
  public label?: string;

  @Column({ unique: false, name: 'description' })
  public description?: string;

}