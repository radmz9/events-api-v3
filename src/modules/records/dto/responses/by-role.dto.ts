import { IsString, IsNumber } from 'class-validator';

export class ByRoleDto{
    @IsString()
    label!: string;

    @IsNumber()
    value!: number;
}