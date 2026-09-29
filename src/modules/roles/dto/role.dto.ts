import { Expose } from 'class-transformer';

export class RoleDto {
    @Expose()
    id!: number;

    @Expose()
    nombre!: string;
}