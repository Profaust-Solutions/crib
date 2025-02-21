import { BaseModel } from '@app/common/shared/models/base-model';
import {
  BeforeInsert,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
} from 'typeorm';
const bcrypt = require('bcrypt');

@Entity('otp_authentications')
export class OtpAuthentication extends BaseModel {
  @Column({ unique: false, name: 'mobile_number' })
  public mobile_number?: string;

  @Column({ unique: false, name: 'otp' })
  public otp?: string;

  @Column({ unique: false, name: 'delivery_mode', default: 'sms' })
  public delivery_mode?: string;

  @Column({ unique: false, name: 'expiry' })
  public expiry?: number;

  @Column({ unique: false, name: 'status', default: 'pending' })
  public status?: string;

  @Column({ unique: false, name: 'otp_length', default: 6 })
  public otp_length?: number;

  @Column({ unique: false, name: 'max_verify_attempts', default: 4 })
  public max_verify_attempts?: number;

  @Column({ unique: false, name: 'verify_attempts', default: 0 })
  public verify_attempts?: number;

  @BeforeInsert()
  beforeInsertListener() {
    const salt = bcrypt.genSaltSync(5);
    const hash = bcrypt.hashSync(this.otp, salt);
    this.otp = hash;
  }


}
