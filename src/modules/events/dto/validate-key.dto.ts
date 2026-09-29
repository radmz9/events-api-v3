import { Length, Matches } from "class-validator";
import { REGEX } from "src/common/constants/regex.constants";

export class ValidateEventKeyDto {
    @Length(5, 5, { message: 'La longitud debe ser de 5' })
    @Matches(REGEX.CODE_PATTERN, { message: 'Solo letras y numeros' })
    eventKey!: string;
}