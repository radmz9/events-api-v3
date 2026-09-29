import { TypesAreaEntity } from 'src/modules/types_area/entity/types_area.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles_administrativos')
export class RolesAdminEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 250, type: 'varchar', nullable: false })
    nombre_cargo!: string;

    @Column({ length: 20, type: 'varchar', nullable: false })
    alias!: string;

    @Column({ name: 'id_tipo_area' }) //Column referenced
    id_tipo_area!: number;

    @ManyToOne(() => TypesAreaEntity)
    @JoinColumn({ name: 'id_tipo_area' })
    area!: TypesAreaEntity

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;
}