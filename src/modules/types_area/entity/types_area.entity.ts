import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tipos_area')
export class TypesAreaEntity{
    @PrimaryGeneratedColumn()
    id!: string;

    @Column({ length: 50, type: 'varchar', unique: true })
    nombre!: string;
}