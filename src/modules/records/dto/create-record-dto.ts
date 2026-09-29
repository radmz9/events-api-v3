import { Matches, MaxLength, MinLength } from 'class-validator';
import { REGEX } from 'src/common/constants/regex.constants';
import { MESSAGES } from 'src/common/constants/messages.constants';

export class CreateRecordDto {
    @MinLength(7, { message: MESSAGES.MIN_LENGTH(7) })
    @MaxLength(9, { message: MESSAGES.MAX_LENGTH(9) })
    @Matches(REGEX.CODE_PATTERN, { message: MESSAGES.ALPHANUMERIC })
    userCode!: string;
}