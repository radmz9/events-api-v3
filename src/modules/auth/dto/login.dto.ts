import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { REGEX } from 'src/common/constants/regex.constants';

export class LoginDto {
    @IsString()
    @MinLength(7, { message: MESSAGES.MIN_LENGTH(7) })
    @MaxLength(9, { message: MESSAGES.MAX_LENGTH(9) }) 
    @Matches(REGEX.CODE_PATTERN, { message: MESSAGES.ALPHANUMERIC })  
    user!: string;

    @IsString()
    @MinLength(8, { message: MESSAGES.MIN_LENGTH(8) })
    @MaxLength(20, { message: MESSAGES.MAX_LENGTH(20) })   
    @Matches(REGEX.ALPHANUMERIC, { message: MESSAGES.ALPHANUMERIC })
    password!: string;
}