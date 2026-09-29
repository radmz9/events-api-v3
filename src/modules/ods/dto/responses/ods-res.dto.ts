import { Expose } from 'class-transformer';

export class OdsResDto {
    @Expose()
    id!: number;

    @Expose()
    nombre!: string;
}