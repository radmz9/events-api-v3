import { OutsiderStatsDto } from "./general_stats.dto";

export class GeneralStaffStatsDto {
    year!: number;
    totalProfesores!: number;
    totalAdministrativos!: number;
}

export class FinalReportAttendanceStaffDto extends GeneralStaffStatsDto {
    profesores!: OutsiderStatsDto;
    administrativos!: OutsiderStatsDto;
}