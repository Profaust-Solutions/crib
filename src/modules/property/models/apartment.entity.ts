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

  @Column({ unique: false, type: 'longtext', name: 'description' })
  public description?: string;

  @Column({ unique: false, name: 'number_of_rooms' })
  public number_of_rooms?: number;

  @Column("simple-json")
  public location: { country: string; city: string; address: string; nearest_landmark: string; };

  @Column({ unique: false, name: 'type' })
  public type?: string;

  @Column("simple-array")
  public images?: [];

  @Column("simple-array")
  public appartment_rules?: [];

}