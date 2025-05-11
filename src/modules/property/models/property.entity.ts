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

  @Column({ unique: false, type: 'json', name: 'location' })
  public location?: string;

  @Column({ unique: false, name: 'type' })
  public type?: string;

  @Column({ unique: false, type: 'json', nullable: true, name: 'images' })
  public images?: string;

  @Column({ unique: false, type: 'json', nullable: true, name: 'appartment_rules' })
  public appartment_rules?: string;
}
