import { Expose } from 'class-transformer';
import { UserEntity } from '../../entity/users.entity';

export class UserResponseDto {
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
    idEtnia!: string | null;

    @Expose()
    etnia!: string | null;

    @Expose()
    idArea!: string;

    @Expose()
    area!: string;

    @Expose()
    idRol!: string;

    @Expose()
    rol!: string;

    @Expose()
    idCalendario!: string | null;

    @Expose()
    calendario!: string | null;

    @Expose()
    idSede!: string | null;

    @Expose()
    sede!: string | null;

    static fromEntity(entity: UserEntity): UserResponseDto{
        return {
            id: entity.id,
            codigo: entity.codigo,
            nombre: entity.nombre,
            idGenero: entity.genero,
            genero: entity.genero === 'H' ? 'HOMBRE' : 'MUJER',
            idEtnia: String(entity.etnia),
            etnia: entity.etnia !== null && Number(entity.etnia) === 1 ? 'Indigena' : 'N/A',
            idArea: String(entity.idArea),
            area: entity.area.nombre,
            idRol: String(entity.idRol),
            rol: entity.rol.nombre,
            idCalendario: String(entity.idCalendario),
            calendario: entity.calendario?.nombre || 'N/A',
            idSede: String(entity.idSede),
            sede: entity.sede?.nombre || 'N/A'
        }
    }
}