import { AreaEntity } from 'src/modules/areas/entity/areas.entity';
import { ModalityEntity } from 'src/modules/modalities/entity/modality.entity';
import { OdsEntity } from 'src/modules/ods/entity/ods.entity';
import { PlacesEntity } from 'src/modules/places/entity/places.entity';
import { RecordEntity } from 'src/modules/records/entity/record.entity';
import { SedeEntity } from 'src/modules/sedes/entity/sede.entity';
import { ThematicEntity } from 'src/modules/thematics/entity/themetic.entity';
import { TypeEventEntity } from 'src/modules/types_event/entity/types_event.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('eventos')
export class EventEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 5, type: 'varchar', unique: true })
    clave!: string;

    @Column({ length: 200, type: 'varchar' })
    nombre!: string;

    @Column({ length: 250, type: 'varchar' })
    responsable!: string;

    @Column({ name: 'idTipo' }) //Reference
    idTipo!: number

    @ManyToOne(() => TypeEventEntity)
    @JoinColumn({ name: 'idTipo' })
    tipo!: TypeEventEntity;

    @Column({ length: 10, type: 'varchar' })
    fecha!: string;

    @Column({ type: 'numeric' })
    year!: number;

    @Column({ type: 'varchar', length: '10' })
    hora!: string;

    @Column({ name: 'idLugar', nullable: true }) //Reference
    idLugar!: number | null;

    @ManyToOne(() => PlacesEntity, { nullable: true })
    @JoinColumn({ name: 'idLugar' })
    lugar!: PlacesEntity | null;

    @Column({ name: 'idArea' }) //Reference
    idArea!: number;

    @ManyToOne(() => AreaEntity)
    @JoinColumn({ name: 'idArea' })
    area!: AreaEntity;

    @Column({ type: 'float' })
    duracion!: number;

    @Column({ name: 'idSede' }) //Rerefence
    idSede!: number;

    @ManyToOne(() => SedeEntity)
    @JoinColumn({ name: 'idSede' })
    sede!: SedeEntity;

    @Column({ length: 250, type: 'varchar', nullable: true })
    otroLugar!: string | null;

    @Column({ type: 'tinyint', default: 0 })
    isActive!: boolean;

    @Column({ name: 'idOds' }) //Reference
    idOds!: number

    @ManyToOne(() => OdsEntity)
    @JoinColumn({ name: 'idOds' })
    ods!: OdsEntity;

    @Column({ name: 'idTematica' }) //Reference
    idTematica!: number;

    @ManyToOne(() => ThematicEntity)
    @JoinColumn({ name: 'idTematica' })
    tematica!: ThematicEntity;

    @Column({ name: 'idModalidad' })
    idModalidad!: number;

    @ManyToOne(() => ModalityEntity)
    @JoinColumn({ name: 'idModalidad' })
    modalidad!: ModalityEntity;

    @Column({ type: 'tinyint', default: 0 })
    constancy!: boolean;

    @OneToMany(() => RecordEntity, (record) => record.evento) //Reverse JOIN
    registros: RecordEntity;
}