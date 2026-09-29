import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ods')
export class OdsEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 250, type: 'varchar', nullable: false })
    nombre!: string;
}