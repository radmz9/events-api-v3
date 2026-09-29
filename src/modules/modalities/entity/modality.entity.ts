import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('modalidades')
export class ModalityEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 250, nullable: false })
    nombre!: string;
}