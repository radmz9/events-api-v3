import { AreaEntity } from "src/modules/areas/entity/areas.entity";
import { EventEntity } from "src/modules/events/entity/event.entity";
import { RoleEntity } from "src/modules/roles/entity/role.entity";
import { UserEntity } from "src/modules/users/entity/users.entity";
import { AdminRoles } from "src/modules/users/enums/admin-roles.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('registros')
@Unique(['idEvento', 'idUsuario'])
export class RecordEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'idEvento' }) //Ref
    idEvento!: number;

    @ManyToOne(() => EventEntity)
    @JoinColumn({ name: 'idEvento' })
    evento!: EventEntity;

    @Column({ name: 'idUsuario' }) //Ref
    idUsuario!: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'idUsuario' })
    usuario!: UserEntity;

    @Column({ name: 'idRol' }) //Ref
    idRol!: AdminRoles;

    @ManyToOne(() => RoleEntity)
    @JoinColumn({ name: 'idRol' })
    rol!: RoleEntity;

    @Column({ name: 'idArea' }) //Ref
    idArea!: number

    @ManyToOne(() => AreaEntity)
    @JoinColumn({ name: 'idArea' })
    area!: AreaEntity;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;
}