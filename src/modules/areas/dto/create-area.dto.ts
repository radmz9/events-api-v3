import { Type } from 'class-transformer';
import { Matches, MinLength, MaxLength, IsOptional, Min, Max, IsInt } from 'class-validator';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { REGEX } from 'src/common/constants/regex.constants';

export class CreateAreaDto{
    @MinLength(2, { message: MESSAGES.MIN_LENGTH(2) })
    @MaxLength(6, { message: MESSAGES.MAX_LENGTH(6) })
    @Matches(REGEX.KEY_PATTERN, { message: `Solo letras` })
    clave!: string;

    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(250, { message: MESSAGES.MAX_LENGTH(250) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS })
    nombre!: string;

    @IsOptional()
    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(250, { message: MESSAGES.MAX_LENGTH(250) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS })
    dependencia?: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(4)
    id_tipo_area!: number;
}
