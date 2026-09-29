import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AreaEntity } from 'src/modules/areas/entity/areas.entity';
import { CalendarEntity } from 'src/modules/calendars/entity/calendar.entity';
import { SedeEntity } from 'src/modules/sedes/entity/sede.entity';
import { RoleEntity } from 'src/modules/roles/entity/role.entity';
import { AdminRoles } from '../enums/admin-roles.enum';
import { UserGender } from '../enums/user-genders.enum';
import { UserEthnicity } from '../enums/user-ethnicity.enum';

@Entity('usuarios')
export class UserEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 9, type: 'varchar', unique: true })
    codigo!: string;

    @Column({ length: 250, type: 'varchar' })
    nombre!: string;

    @Column({
        type: 'enum',
        enum: UserGender
    })
    genero!: string;

    @Column({
        nullable: true,
        type: 'enum',
        enum: UserEthnicity
    })
    etnia!: UserEthnicity | null;

    @Column({ name: 'idArea' }) 
    idArea!: number

    @ManyToOne(() => AreaEntity)
    @JoinColumn({ name: 'idArea' })
    area!: AreaEntity;

    @Column({ name: 'idRol' }) 
    idRol!: AdminRoles;

    @ManyToOne(() => RoleEntity)
    @JoinColumn({ name: 'idRol' })
    rol!: RoleEntity;

    @Column({ name: 'idCalendario', nullable: true }) 
    idCalendario!: number | null;

    @ManyToOne(() => CalendarEntity, { nullable: true })
    @JoinColumn({ name: 'idCalendario' })
    calendario!: CalendarEntity | null;

    @Column({ name: 'idSede', nullable: true }) 
    idSede!: number | null;

    @ManyToOne(() => SedeEntity, { nullable: true })
    @JoinColumn({ name: 'idSede' })
    sede!: SedeEntity | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;
}