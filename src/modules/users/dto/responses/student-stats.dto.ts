import { DeepPartial } from "typeorm";

export class StatsDto {
    calendario!: string;
    total!: string;
    hombres!: string;
    mujeres!: string;
    indigenas!: string;
    alumnos!: string;
    egresados!: string;
    inactivos!: string;
}

export class StudentStatsDto {
    calendario!: string;
    total!: number;
    hombres!: number;
    mujeres!: number;
    indigenas!: number;
    alumnos!: number;
    egresados!: number;
    inactivos!: number;

    static fromDto(dto: StatsDto): StudentStatsDto {
        return{
            calendario: dto.calendario,
            total: Number(dto.total),
            hombres: Number(dto.hombres),
            mujeres: Number(dto.mujeres),
            indigenas: Number(dto.indigenas),
            alumnos: Number(dto.alumnos),
            egresados: Number(dto.egresados),
            inactivos: Number(dto.inactivos)
        }
    }
}

export class StatReportResDto {
    stats!: DeepPartial<StudentStatsDto>;
    caledarDetails!: StatsDto[];
}