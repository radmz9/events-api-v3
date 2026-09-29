export interface Students {
    codigo: string;
    nombre: string;
    genero: string;
    etnia: number | null;
    idRol: number;
    idArea: number;
    idCalendario: number | null;
    idSede: number | null;
}

export interface Staff {
    codigo: string;
    nombre: string;
    genero: string;
    idArea: number;
}

export interface AttendanceCsv {
    idEvento: number;
    codigo: string;
}

export interface AttendanceDto {
    idEvento: number;
    idUsuario: number;
    idRol: number;
    idArea: number;
}

enum Status {
    ALUMNO = 1,
    EGRESADO = 2,
    INACTIVO = 3
}

export interface ChangeStatusDto {
    codigo: string;
    estatus: Status;
}