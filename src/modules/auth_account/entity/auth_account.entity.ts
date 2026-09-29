import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from 'src/modules/users/entity/users.entity';
import { AreaEntity } from 'src/modules/areas/entity/areas.entity';
import { Exclude } from 'class-transformer';
import { RolesAdminEntity } from 'src/modules/roles_admin/entity/roles_admin.entity';

@Entity('auth_accounts')
export class AuthAccountEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'user_codigo' }) // Ref
    user_codigo!: string;

    @OneToOne(() => UserEntity)
    @JoinColumn({ name: 'user_codigo', referencedColumnName: 'codigo' })
    user!: UserEntity;

    @Exclude()
    @Column({ select: false })
    password!: string;

    @Column({ name: 'managed_area_id' }) // Ref
    managed_area_id!: number;

    @ManyToOne(() => AreaEntity)
    @JoinColumn({ name: 'managed_area_id' })
    managedArea!: AreaEntity;

    @Column({ name: 'id_rol_admin' }) // Ref
    id_rol_admin!: number;

    @ManyToOne(() => RolesAdminEntity)
    @JoinColumn({ name: 'id_rol_admin' })
    rolAdmin!: RolesAdminEntity;

    @CreateDateColumn()
    createdAt!: Date;
}