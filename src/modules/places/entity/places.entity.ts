import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('lugares')
export class PlacesEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 250, type: 'varchar', nullable: false })
    nombre!: string;

    @Column({ length: 250, type: 'varchar', nullable: false })
    ubicacion!: string;

    @Column({ type: 'int', nullable: false })
    capacidad!: number;

    @Column({ length: 20, type: 'varchar', nullable: false })
    especificacion!: string;
}