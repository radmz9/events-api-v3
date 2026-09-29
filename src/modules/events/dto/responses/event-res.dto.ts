import { Expose } from 'class-transformer';
import { EventEntity } from '../../entity/event.entity';

export class EventResDto {
    @Expose()
    id!: number;

    @Expose()
    clave!: string;

    @Expose()
    nombre!: string;

    @Expose()
    responsable!: string;

    @Expose()
    idArea!: string;

    @Expose()
    area!: string;

    @Expose()
    fecha!: string;

    @Expose()
    hora!: string;
    
    @Expose()
    idLugar!: string | null;

    @Expose()
    lugar!: string;

    @Expose()
    idTipo!: string;

    @Expose()
    tipo!: string;

    @Expose()
    encargado!: string;

    @Expose()
    duracion!: number;

    @Expose()
    idSede!: string;

    @Expose()
    sede!: string;

    @Expose()
    isActive!: boolean;

    @Expose()
    idOds!: string;

    @Expose()
    ods!: string;

    @Expose()
    idModalidad!: string;

    @Expose()
    modalidad!: string; 

    @Expose()
    idTematica!: string;

    @Expose()
    tematica!: string; 

    @Expose()
    constancy!: boolean;

    static fromEntity(entity: EventEntity): EventResDto {
        return {
            id: entity.id,
            clave: entity.clave,
            nombre: entity.nombre,
            responsable: entity.responsable,
            idArea: String(entity.idArea),
            area: entity.area.nombre,
            fecha: entity.fecha,
            hora: entity.hora,
            idLugar: String(entity.idLugar) || null,
            lugar: entity.lugar?.nombre || entity.otroLugar || 'N/A',
            idTipo: String(entity.idTipo),
            tipo: entity.tipo.nombre,
            encargado: entity.tipo.encargado,
            duracion: entity.duracion,
            idSede: String(entity.idSede),
            sede: entity.sede.nombre,
            isActive: entity.isActive,
            idOds: String(entity.idOds),
            ods: entity.ods.nombre,
            idModalidad: String(entity.idModalidad),
            modalidad: entity.modalidad.nombre,
            idTematica: String(entity.idTematica),
            tematica: entity.tematica.nombre,
            constancy: entity.constancy
        }
    }
}