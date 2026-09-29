import { Expose } from 'class-transformer';

export class PlacesResDto {
    @Expose()
    id!: number;

    @Expose()
    nombre!: string;

    @Expose()
    ubicacion!: string;
}