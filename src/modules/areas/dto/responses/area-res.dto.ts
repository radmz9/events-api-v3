import { Expose } from 'class-transformer';

export class AreaDto {
    @Expose()
    id!: number;

    @Expose()
    clave!: string;
    
    @Expose()
    nombre!: string;

    @Expose()
    dependencia!: string;

}