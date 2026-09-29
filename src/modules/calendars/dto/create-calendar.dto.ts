import { Matches } from 'class-validator';
import { REGEX } from 'src/common/constants/regex.constants';

const currentYear = new Date().getFullYear();

export class CreateCalendarDto{
    @Matches(REGEX.CALENDAR_PATTERN, { message: `El formato debe ser: 4 dígitos y una letra A o B, ej: ${currentYear}A o ${currentYear}B` })
    nombre!: string;
}