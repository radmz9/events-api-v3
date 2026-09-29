import { Expose } from 'class-transformer';
import { RecordEntity } from '../../entity/record.entity';

export class RecordResDto {
    @Expose()
    id!: number;

    @Expose()
    codigo!: string;

    @Expose()
    nombre!: string;

    @Expose()
    idRol!: number;

    @Expose()
    createdAt!: Date;

    static fromEntity(entity: RecordEntity): RecordResDto {
        return {
            id: entity.id,
            codigo: entity.usuario.codigo,
            nombre: entity.usuario.nombre,
            idRol: entity.usuario.idRol,
            createdAt: entity.createdAt
        }
    }
}