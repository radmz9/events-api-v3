import { FindManyOptions } from "typeorm";
import { AuthAccountEntity } from "./entity/auth_account.entity";

export const accountQueryOptions: FindManyOptions<AuthAccountEntity> = {
    select: {
        id: true,
        user_codigo: true,
        user: {
            codigo: true,
            nombre: true
        },
        managedArea: {
            id: true,
            nombre: true,
            tipo: {
                nombre: true
            }
        },
        rolAdmin: {
            id: true,
            nombre_cargo: true,
        }
    },
    relations: {
        user: true,
        managedArea: {
            tipo: true
        },
        rolAdmin: true
    }
};