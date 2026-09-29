export class DetailedAttendanceByStudentsDto {
    id!: number;
    nombre!: string;
    groupOne!: number;
    groupTwo!: number;
    groupThree!: number;
    groupFour!: number;
    total!: number;
}

export class CountEventsByStudentDto {
    idUsuario!: number;
    idArea!: number;
    total!: number;
}