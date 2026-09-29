import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsMilitaryTime, IsNumber, IsOptional, IsString, Length, Max, MaxLength, Min, MinLength } from 'class-validator';
import { MESSAGES } from 'src/common/constants/messages.constants';

export class CreateEventDto {
    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(250, { message: MESSAGES.MAX_LENGTH(250) })
    @IsString()
    nombre!: string;

    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(250, { message: MESSAGES.MAX_LENGTH(250) })
    @IsString()
    responsable!: string;

    @Type(() => Number)
    @IsInt()
    idTipo!: number;

    @Length(10, 10)
    @IsISO8601({ strict: true }, { message: 'Formato de fecha incorecto, debe ser: YYYY-MM-DD' })
    fecha!: string;

    @IsMilitaryTime({ message: `Hora de inicio debe ser en este formato: HH:MM` })
    hora!: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(9.9)
    duracion!: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    idLugar!: number;

    @IsOptional()
    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(250, { message: MESSAGES.MAX_LENGTH(250) })
    @IsString()
    otroLugar!: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    idArea!: number;

    @Type(() => Number)
    @IsInt()
    idSede!: number;
    
    @Type(() => Number)
    @IsInt()
    idOds!: number;

    @Type(() => Number)
    @IsInt()
    idModalidad!: number;

    @Type(() => Number)
    @IsInt()
    idTematica!: number;
}