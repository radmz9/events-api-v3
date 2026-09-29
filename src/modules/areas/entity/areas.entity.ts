import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { TypesAreaEntity } from 'src/modules/types_area/entity/types_area.entity';
import { AuthAccountEntity } from 'src/modules/auth_account/entity/auth_account.entity';
import { UserEntity } from 'src/modules/users/entity/users.entity';
import { EventEntity } from 'src/modules/events/entity/event.entity';

@Entity('areas')
export class AreaEntity{
    @PrimaryGeneratedColumn()
    id!: number;
    
    @Column({ length: 6, type: 'varchar', unique: true })
    clave!: string;

    @Column({ length: 250, type: 'varchar' })
    nombre!: string;

    @Column({ length: 250, type: 'varchar', nullable: true })
    dependencia?: string;

    @Column({ name: 'id_tipo_area' }) //Column referenced
    id_tipo_area!: number;

    @ManyToOne(() => TypesAreaEntity)
    @JoinColumn({ name: 'id_tipo_area' })
    tipo!: TypesAreaEntity

    @OneToOne(() => AuthAccountEntity, (account) => account.managedArea) //Reverse JOIN
    account!: AuthAccountEntity;

    @OneToMany(() => UserEntity, (user) => user.area) //Reverse JOIN
    user!: UserEntity;

    @OneToMany(() => EventEntity, (event) => event.area) //Reverse JOIN
    eventos: EventEntity;
}