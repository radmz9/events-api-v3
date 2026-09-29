import { Matches, MinLength, MaxLength, IsOptional } from 'class-validator';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { REGEX } from 'src/common/constants/regex.constants';

export class UpdateAreaDto{
    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(250, { message: MESSAGES.MAX_LENGTH(250) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS })
    nombre!: string;

    @IsOptional()
    @MinLength(3, { message: MESSAGES.MIN_LENGTH(3) })
    @MaxLength(250, { message: MESSAGES.MAX_LENGTH(250) })
    @Matches(REGEX.ONLY_LETTERS_EXTENDED, { message: MESSAGES.ONLY_LETTERS })
    dependencia?: string;
}