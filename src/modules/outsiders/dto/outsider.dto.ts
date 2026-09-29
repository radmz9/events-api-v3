import { IsEnum, Matches, MaxLength, MinLength } from 'class-validator';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { REGEX } from 'src/common/constants/regex.constants';
import { UserGender } from 'src/modules/users/enums/user-genders.enum';

export class OutsiderDto {
    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(150, { message: MESSAGES.MAX_LENGTH(150) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS })
    nombre!: string;

    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(100, { message: MESSAGES.MAX_LENGTH(100) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS })
    dependencia!: string;

    @IsEnum(UserGender)
    genero!: UserGender;
}