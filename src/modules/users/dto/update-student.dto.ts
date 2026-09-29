import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { UpdateBaseUserDto } from './update-user.dto';
import { Type } from 'class-transformer';
import { UserEthnicity } from '../enums/user-ethnicity.enum';

export class UpdateStudentDto extends UpdateBaseUserDto{
    @IsNotEmpty()
    @IsEnum(UserEthnicity, { message: `Debe ser solo: 1 o 0` })
    etnia!: UserEthnicity;

    @Type(() => Number)
    @IsInt()
    idCalendario!: number;

    @Type(() => Number)
    @IsInt()
    idSede!: number;    
}