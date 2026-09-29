import { Expose } from 'class-transformer';

export class CalendarDto {
    @Expose()
    id!: number;

    @Expose()
    nombre!: string;
}