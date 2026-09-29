import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tematicas')
export class ThematicEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 250, type: 'varchar', nullable: false })
    nombre!: string;
}