import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tipos')
export class TypeEventEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 50, type: 'varchar', nullable: false })
    nombre!: string;

    @Column({ length: 50, type: 'varchar', nullable: false })
    encargado!: string;

    @Column({ length: 20, type: 'varchar', nullable: false })
    especificacion!: string;
}