import { Expose } from 'class-transformer';

export class SedeResDto{
    @Expose()
    id!: number;

    @Expose()
    nombre!: string;
}