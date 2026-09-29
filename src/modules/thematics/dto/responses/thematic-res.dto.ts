import { Expose } from 'class-transformer';

export class ThematicResDto { 
    @Expose()
    id!: number;

    @Expose()
    nombre!: string;
}