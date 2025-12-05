import { BaseModel } from '@app/common';
import { Column } from 'typeorm';

export class PaymentRequest extends BaseModel {
  @Column({ unique: false, name: 'status', default: 'initailised' }) //initailised/Paid/Pending/Overdue.
  public status?: string;

  @Column({ unique: false, name: 'email' })
  public email?: string;

  @Column({ unique: false, name: 'amount' })
  public amount?: number;
}
