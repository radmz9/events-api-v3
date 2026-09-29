import { Expose } from 'class-transformer';

export class TypeEventResDto {
    @Expose()
    id!: number;

    @Expose()
    nombre!: string;
}