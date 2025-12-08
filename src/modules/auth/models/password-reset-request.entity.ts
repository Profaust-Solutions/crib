import { BaseModel } from '@app/common';
import { Column, Entity } from 'typeorm';

@Entity('password_reset_requests')
export class PasswordResetRequest extends BaseModel {
  @Column({ name: 'email', unique: false })
  email: string;

  @Column({ name: 'otp' })
  otp: string; // or hashed_otp if you want more security

  @Column({ name: 'expires_at', type: 'timestamp' })
  expires_at: Date;

  @Column({ name: 'used', default: false })
  used: boolean;

  @Column({ name: 'attempt_count', default: 0 })
  attempt_count: number;
}
