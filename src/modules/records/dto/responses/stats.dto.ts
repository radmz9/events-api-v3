import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ByRoleDto } from './by-role.dto';

export class StatsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ByRoleDto)
    byRole!: ByRoleDto[];

    @IsNumber()
    total!: number;
}