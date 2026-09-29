import { FindManyOptions } from "typeorm";
import { EventEntity } from "./entity/event.entity";

export const eventQueryOptions: FindManyOptions<EventEntity> = {
    select: {
        id: true,
        clave: true,
        nombre: true,
        responsable: true,
        idArea: true,
        area: {
            nombre: true
        },
        idTipo: true,
        tipo: {
            nombre: true,
            encargado: true,
        },
        fecha: true,
        hora: true,
        idLugar: true,
        lugar: {
            nombre: true
        },
        otroLugar: true,
        duracion: true,
        idSede: true,
        sede: {
            nombre: true
        },
        idOds: true,
        ods: {
            nombre: true
        },
        idModalidad: true,
        modalidad: {
            nombre: true
        },
        idTematica: true,
        tematica: {
            nombre: true
        },
        isActive: true,
        constancy: true
    },
    relations: {
        area: true,
        tipo: true,
        lugar: true,
        sede: true,
        ods: true,
        modalidad: true,
        tematica: true
    }    
}