import { BaseModel } from '@app/common/shared/models/base-model';
import {
  BeforeInsert,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('awesome_bill_attachments')
export class AwesomeBillAttachment extends BaseModel {
  @Column({ unique: false })
  public description?: string;

  @Column({ unique: false, name: 'bill_id' })
  public bill_id?: string;

  @Column({ unique: false, name: 'file_location' })
  public file_location?: string;

}