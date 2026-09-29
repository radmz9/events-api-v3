import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EventDataResDto } from "./event-data-res.dto";
import { StatsDto } from './stats.dto';
import { DataDto } from './data.dto';

export class CompleteEventReportResDto{
    @ValidateNested()
    @Type(() => EventDataResDto)
    event!: EventDataResDto;

    @ValidateNested()
    @Type(() => StatsDto)
    stats!: StatsDto;

    @ValidateNested()
    @Type(() => DataDto)
    data!: DataDto;
}       