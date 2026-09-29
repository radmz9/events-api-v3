import { InforEventGenderDto } from "./by_gender.dto";

export class CommunityRoleStats {
    estudiantes!: number;
    profesores!: number;
    administrativos!: number;
}

export class CommunityRoleStatsDto extends CommunityRoleStats {
    total!: number;
}

export class OutsiderRoleStatsDto {
    externos!: number;
}

export class FinalRoleStatsDto extends CommunityRoleStats {
    externos!: number;
    total!: number;
}

export class ReportAttendanceByRoleDto extends InforEventGenderDto {
    stats!: FinalRoleStatsDto
}