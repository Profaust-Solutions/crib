import { BaseModel } from '@app/common/shared/models/base-model';
import {
  BeforeInsert,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('crib_apartments')
export class Apartment extends BaseModel {
  @Column({ unique: false, name: 'user_id' })
  public user_id?: string;

  @Column({ unique: false, name: 'property_id' })
  public property_id?: string;

  @Column({ unique: false, name: 'tenant' })
  public tenant?: string;

  @Column({ unique: false, name: 'label' })
  public label?: string;

  @Column({ unique: false, name: 'description' })
  public description?: string;

}