import { Expose } from "class-transformer";

export class PublicEventResDto {
    @Expose()
    id!: number;

    @Expose()
    nombre!: string;

    @Expose()
    responsable!: string;

    @Expose()
    fecha!: string;

    @Expose()
    hora!: string;

    @Expose()
    lugar!: string;

    @Expose()
    tipo!: string;

    @Expose()
    encargado!: string;
}