import { Matches, MaxLength, MinLength } from 'class-validator';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { REGEX } from 'src/common/constants/regex.constants';

export class SedeDto{
    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(50, { message: MESSAGES.MAX_LENGTH(50) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS_EXTENDED })
    nombre!: string;
}