import { BaseModel } from '@app/common/shared/models/base-model';
import {
  BeforeInsert,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('awesome_bills')
export class AwesomeBill extends BaseModel {
  @Column({ unique: true })
  public name?: string;

  @Column({ nullable: false, type: 'decimal', precision: 10, scale: 2 })
  public amount?: number;

  @Column({ nullable: false, name: 'due_date' })
  public due_date?: Date;

  @Column({ nullable: false, default: 'pending' })
  public status?: string;

  @Column({ nullable: true })
  public category?: string;

  @Column({ nullable: true, name: 'app_id' })
  public app_id?: string;

  @Column({ nullable: false, default: 'draft' })
  public visibility?: string;

  @Column({ nullable: true, default: 'bill' })
  public type?: string;

  @Column({ nullable: true, default: false, name: 'soft_delete' })
  public soft_delete?: boolean;

  @DeleteDateColumn({ name: 'soft_delete_date' })
  public soft_delete_date?: Date;

  @Column({ nullable: true, default: false}) //Y / N
  public mandatory?: boolean;

  @Column('text', { unique: false })
  public description?: string;

  @Column('text', { unique: false, name: 'user_id' })
  public user_id?: string;

  @BeforeInsert()
  beforeInsertListener() {}
}
