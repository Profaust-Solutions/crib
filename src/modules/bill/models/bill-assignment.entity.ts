import { BaseModel } from '@app/common/shared/models/base-model';
import {
  BeforeInsert,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('awesome_bill_assignments')
export class AwesomeBillAssignment extends BaseModel {
  @Column({ unique: false, name: 'bill_id' })
  public bill_id?: string;

  @Column({ unique: false, name: 'assigned_to' })
  public assigned_to?: string;

  @Column({ unique: false, name: 'assigned_by' })
  public assigned_by?: string;

  @Column({ unique: false, name: 'status' ,default:'pending'})//Paid/Pending/Overdue.
  public status?: string;

  @Column({ unique: false, name: 'payment_frequency',default:'monthly' })//one-time/daily/weekly/monthly/custom
  public payment_frequency?: string;
}