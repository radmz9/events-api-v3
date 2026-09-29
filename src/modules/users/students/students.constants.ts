import { FindManyOptions } from "typeorm";
import { UserEntity } from "../entity/users.entity";

export const studentQueryOptions: FindManyOptions<UserEntity> = {
    select: {
        id: true,
        codigo: true,
        nombre: true,
        genero: true,
        etnia: true,
        createdAt: true,
        idArea: true,
        area: {
            clave: true,
            nombre: true,
        },
        idRol: true,
        rol: {
            nombre: true,
        },
        idCalendario: true,
        calendario: {
            nombre: true,
        },
        idSede: true,
        sede: {
            nombre: true,
        },
    },
    relations: {
        area: true,
        rol: true,
        calendario: true,
        sede: true,
    },
}