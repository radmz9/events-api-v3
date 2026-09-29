import { IsEnum, IsInt, Matches, MaxLength, MinLength } from 'class-validator';
import { REGEX } from 'src/common/constants/regex.constants';
import { Type } from 'class-transformer';
import { AdminRoles } from '../enums/admin-roles.enum';
import { UserGender } from '../enums/user-genders.enum';
import { MESSAGES } from 'src/common/constants/messages.constants';

export class BaseUserDto {
    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(250, { message: MESSAGES.MAX_LENGTH(250) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS_EXTENDED })
    nombre!: string;

    @MinLength(7, { message: MESSAGES.MIN_LENGTH(7) })
    @MaxLength(9, { message: MESSAGES.MAX_LENGTH(9) })
    @Matches(REGEX.CODE_PATTERN, { message: MESSAGES.ALPHANUMERIC })
    codigo!: string;

    @IsEnum(UserGender)
    genero!: UserGender;

    @IsEnum(AdminRoles)
    idRol!: AdminRoles;
    
    @Type(() => Number)
    @IsInt()
    idArea!: number;
}