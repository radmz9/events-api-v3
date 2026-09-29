import { Matches, MaxLength, MinLength } from 'class-validator';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { REGEX } from 'src/common/constants/regex.constants';

export class TypeEventDto{
    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(50, { message: MESSAGES.MAX_LENGTH(50) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS_EXTENDED })
    nombre!: string;

    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(50, { message: MESSAGES.MAX_LENGTH(50) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS_EXTENDED })
    encargado!: string;

    @MinLength(2, { message: MESSAGES.MIN_LENGTH(2) })
    @MaxLength(20, { message: MESSAGES.MAX_LENGTH(20) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS_EXTENDED })
    especificacion!: string;
}