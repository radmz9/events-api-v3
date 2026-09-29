import { Expose } from 'class-transformer';
import { UserEntity } from '../../entity/users.entity';

export class StaffResponseDto {
    @Expose()
    id!: number;

    @Expose()
    codigo!: string;

    @Expose()
    nombre!: string;

    @Expose()
    idGenero!: string;

    @Expose()
    genero!: string;
    
    @Expose()
    idArea!: string;

    @Expose()
    area!: string;

    static fromEntity(entity: UserEntity): StaffResponseDto {
        return {
            id: entity.id,
            codigo: entity.codigo,
            nombre: entity.nombre,
            idGenero: entity.genero,
            genero: entity.genero === 'H' ? 'HOMBRE' : 'MUJER',
            idArea: String(entity.idArea),
            area: entity.area.nombre ?? 'N/A'
        }
    }
}