import { Expose } from 'class-transformer';

export class ModalityResDto {
    @Expose()
    id!: number;

    @Expose()
    nombre!: string;
}