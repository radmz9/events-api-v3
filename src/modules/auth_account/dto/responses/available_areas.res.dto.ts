import { Expose } from "class-transformer";
import { AreaEntity } from "src/modules/areas/entity/areas.entity";

export class AvailableAreasResDto {
    @Expose()
    id!: string;

    @Expose()
    nombre!: string;

    static fromEntity(entity: AreaEntity): AvailableAreasResDto{
        return{
            id: String(entity.id),
            nombre: entity.nombre
        }
    }

}