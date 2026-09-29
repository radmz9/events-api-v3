import { Type } from 'class-transformer';
import { IsInt, Matches, MaxLength, MinLength, Max, Min } from 'class-validator';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { REGEX } from 'src/common/constants/regex.constants';

export class PlaceDto{
    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(250, { message: MESSAGES.MAX_LENGTH(250) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS_EXTENDED })
    nombre!: string;

    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(250, { message: MESSAGES.MAX_LENGTH(250) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS_EXTENDED })
    ubicacion!: string;

    @Type(() => Number)
    @IsInt()
    @Min(1, { message: 'Minimo 1' })
    @Max(999, { message: 'Maximo 999' })
    capacidad!: number;

    @MinLength(2, { message: MESSAGES.MIN_LENGTH(2) })
    @MaxLength(200, { message: MESSAGES.MAX_LENGTH(200) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS_EXTENDED })
    especificacion!: string;
}