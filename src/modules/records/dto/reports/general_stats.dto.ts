export class CommonStatsDto {
    hombres!: number;
    mujeres!: number;
}

export class CommunityStatsDto extends CommonStatsDto {
    indigenas!: number;
    total!: number;
}

export class OutsiderStatsDto extends CommonStatsDto {
    total!: number;
}

export class GeneralStatsDto {
    alumnos!: CommunityStatsDto;
    egresados!: CommunityStatsDto;
    profesores!: CommunityStatsDto;
    administrativos!: CommunityStatsDto;
    externos!: OutsiderStatsDto;
    total!: number;
}