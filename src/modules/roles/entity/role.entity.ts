import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class RoleEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 20, type: 'varchar', nullable: false })
    nombre!: string;
}