import { IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InternalsDataResDto } from './internals-data-res.dto';
import { OutsiderEntity } from 'src/modules/outsiders/entity/outsider.entity';

export class DataDto {
    @IsObject()
    internals!: Record<string, InternalsDataResDto[]>;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OutsiderEntity)
    externals!: OutsiderEntity[];
}