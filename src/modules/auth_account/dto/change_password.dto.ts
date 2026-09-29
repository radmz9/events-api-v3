import { Matches, MaxLength, MinLength } from "class-validator";
import { MESSAGES } from "src/common/constants/messages.constants";
import { REGEX } from "src/common/constants/regex.constants";

export class ChangePasswordDto {
    @MinLength(8, { message: MESSAGES.MIN_LENGTH(8) })
    @MaxLength(20, { message: MESSAGES.MAX_LENGTH(20) })
    @Matches(REGEX.ALPHANUMERIC, { message: MESSAGES.ALPHANUMERIC })
    oldPassword!: string;

    @MinLength(8, { message: MESSAGES.MIN_LENGTH(8) })
    @MaxLength(20, { message: MESSAGES.MAX_LENGTH(20) })
    @Matches(REGEX.ALPHANUMERIC, { message: MESSAGES.ALPHANUMERIC })
    newPassword!: string;
}