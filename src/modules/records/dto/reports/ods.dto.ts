export class EventOdsDto {
    id!: number;
    nombre!: string;
    totalEventos!: string;
}

export class CommonStatsOdsDto {
    hombres!: number;
    mujeres!: number;
    total!: number;
}

export class FullStatsOdsDto {
    asistencia!: number;
    comunidad!: CommonStatsOdsDto;
    externos!: CommonStatsOdsDto;
}

export class ReportEventOdsDto extends EventOdsDto{
    stats!: FullStatsOdsDto
}

class GeneralStats {
    actividades: number;
    asistencia: number;
    comunidad: Partial<CommonStatsOdsDto>;
    externos: Partial<CommonStatsOdsDto>;
}

export class FullReportOdsDto {
    report: ReportEventOdsDto[];
    generalStats: GeneralStats;
}