import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sedes')
export class SedeEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: '50', type: 'varchar', nullable: false })
    nombre!: string;
}