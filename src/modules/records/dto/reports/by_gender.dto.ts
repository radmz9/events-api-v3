import { GeneralStatsDto } from "./general_stats.dto";

export class InforEventGenderDto {
    id!: number;
    area!: string;
    nombre!: string;
    tipo!: string;
    tematica!: string;
    ods!: string;
    modalidad!: string;
    fecha!: string;    
}

export class FinalReportEventsByGender extends InforEventGenderDto {
    stats!: GeneralStatsDto;
}