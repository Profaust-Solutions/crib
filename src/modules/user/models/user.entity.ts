import { BaseModel } from '@app/common';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
} from 'typeorm';
const bcrypt = require('bcrypt');

@Entity('crib_users')
export class User extends BaseModel {
  @Column({ unique: true })
  public username?: string;

  @Column('varchar', {
    nullable: true,
  })
  public fullname?: string;

  @Column({ unique: true, nullable: true })
  public email?: string;

  @Column('varchar', {
    name: 'password',
    length: '255',
    nullable: true,
  })
  public password: string;

  @Column('varchar', {
    name: 'mobile_number',
    nullable: true,
  })
  public mobile_number: string;

  @Column('boolean', {
    name: 'is_2factor_enabled',
    default: false,
  })
  public is_2factor_enabled: boolean;

  @Column('varchar', {
    name: 'role',
    length: '255',
    nullable: true,
    default: 'user',
  })
  public role: string;

  @Column('text', {
    name: 'profile_image',
    nullable: true,
  })
  public profile_image: string;

  @BeforeInsert()
  beforeInsertListener() {
    //this.email = this.email.toLowerCase();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(this.password, salt);
    this.password = hash;
    this.profile_image = `https://dummyimage.com/300.png/09f/fff&text=${this.username.substring(0, 2)}`;
  }

  @BeforeUpdate()
  beforeUpdateListener() {
    //this.email = this.email.toLowerCase();
    if (this.password.length < 50) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(this.password, salt);
      this.password = hash;
    }
  }

  @AfterLoad()
  afterLoadListener() {
    //this.email = this.email.toLowerCase();
    //this.password = undefined;
    if (this.profile_image == null) {
      this.profile_image = `https://dummyimage.com/300.png/09f/fff&text=${this.username.substring(0, 2)}`;
    }
  }
}
