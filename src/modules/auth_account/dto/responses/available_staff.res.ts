import { Expose } from "class-transformer";
import { UserEntity } from "src/modules/users/entity/users.entity";

export class AvailableStaffResDto {
    @Expose()
    id!: string;

    @Expose()
    nombre!: string;

    static fromEntity(entity: UserEntity): AvailableStaffResDto {
        return {
            id: entity.codigo,
            nombre: entity.nombre
        }
    }
}