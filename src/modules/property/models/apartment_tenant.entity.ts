import { BaseModel } from '@app/common/shared/models/base-model';
import { User } from 'src/modules/user/models/user.entity';
import {
  BeforeInsert,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Apartment } from './apartment.entity';

@Entity('crib_apartment_tenants')
export class Tenant extends BaseModel {
  @Column({ unique: false, name: 'tenant_id' })
  public tenant_id?: string;

  @Column({ unique: false, name: 'mobile_number' })
  public mobile_number?: string;

  @Column({ unique: false, name: 'apartment_id' })
  public apartment_id?: string;

  @Column({ unique: false, name: 'status', default: 'pending_invite' }) //invite_accepted//invite_declined
  public status?: string;

  public rent_start_date?: Date;
  public rent_due_date?: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'tenant_id' })
  user: User;

  @OneToOne(() => Apartment)
  @JoinColumn({ name: 'apartment_id' })
  apartment: Apartment;
}
