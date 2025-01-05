import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseModel extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    public id?: string;

    @CreateDateColumn({name:'created_date',
        type: 'timestamp',})
    public created_date?:Date;

    @UpdateDateColumn({name:'modified_date',
        type: 'timestamp',})
    public modified_date?:Date;

    @Column('varchar',{
        name:'created_by',length: '255',
    nullable: true})
    public created_by?:string;

    @Column({ nullable: true, default: false, name: 'soft_delete' })
    public soft_delete?: boolean

    @DeleteDateColumn({ name: 'soft_delete_date' })
    public soft_delete_date?: Date
}
