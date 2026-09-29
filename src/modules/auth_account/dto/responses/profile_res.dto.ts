import { Expose } from "class-transformer";
import { AuthAccountEntity } from "../../entity/auth_account.entity";

export class ProfileResDto {
    @Expose()
    user!: string;

    @Expose()
    username!: string;

    @Expose()
    areaName!: string;

    @Expose()
    areaType!: string;

    @Expose()
    role!: string;

    static fromEntity(entity: AuthAccountEntity): ProfileResDto {
        return {
            user: entity.user_codigo,
            username: entity.user.nombre,
            areaName: entity.managedArea.nombre,
            areaType: entity.managedArea.tipo.nombre,
            role: entity.rolAdmin.nombre_cargo
        }
    }
}