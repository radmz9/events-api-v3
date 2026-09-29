import { Expose } from "class-transformer";

export class OutsiderResDto{
    @Expose()
    id!: number;

    @Expose()
    nombre!: string;

    @Expose()
    dependencia!: string;

    @Expose()
    genero!: string;

    @Expose()
    createdAt!: Date;
}