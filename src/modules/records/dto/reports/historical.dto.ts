interface CommonFields {
    nombre: string;
    total: number;
}

interface Areas {
    clave: string;
    area: string;
    eventos: CommonFields[];
    total: number;
}

export class HistorialReportDto {
    areas!: Areas[];
    types!: CommonFields[];
    total!: number;
}

interface Stats {
    year: string;
    eventos: CommonFields[];
    total: number;
}

export class HistorialReportByAreaDto {
    stats!: Stats[];
    types!: CommonFields[];
    total!: number;
}