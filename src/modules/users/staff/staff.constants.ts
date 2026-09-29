import { FindManyOptions } from "typeorm";
import { UserEntity } from "../entity/users.entity";

export const staffQueryOptions: FindManyOptions<UserEntity> = {
    select: {
        id: true,
        codigo: true,
        nombre: true,
        genero: true,
        idArea: true,
        area: {
            id: true,
            nombre: true
        }
    },
    relations: {
        area: true,
    }
}