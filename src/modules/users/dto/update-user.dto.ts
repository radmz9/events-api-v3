import { IsEnum, IsInt, Matches, MaxLength, MinLength } from 'class-validator';
import { REGEX } from 'src/common/constants/regex.constants';
import { UserGender } from '../enums/user-genders.enum';
import { AdminRoles } from '../enums/admin-roles.enum';
import { Type } from 'class-transformer';
import { MESSAGES } from 'src/common/constants/messages.constants';


export class UpdateBaseUserDto {
    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(250, { message: MESSAGES.MAX_LENGTH(250) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS_EXTENDED })
    nombre!: string;

    @IsEnum(UserGender)
    genero!: UserGender;

    @IsEnum(AdminRoles)
    idRol!: AdminRoles;

    @Type(() => Number)
    @IsInt()
    idArea!: number;
}