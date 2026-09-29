import { Expose } from "class-transformer";
import { AuthAccountEntity } from "../../entity/auth_account.entity";

export class AuthAccountResponseDto {
    @Expose()
    id!: number;

    @Expose()
    user_codigo!: string;

    @Expose()
    nombre!: string;

    @Expose()
    managedAreaId!: string;

    @Expose()
    managedAreaName!: string;

    @Expose()
    rolName!: string;

    static fromEntity(entity: AuthAccountEntity): AuthAccountResponseDto {
        return {
            id: entity.id,
            user_codigo: entity.user_codigo,
            nombre: entity.user.nombre,
            managedAreaId: String(entity.managedArea.id),
            managedAreaName: entity.managedArea.nombre,
            rolName: entity.rolAdmin.nombre_cargo
        }
    }
}