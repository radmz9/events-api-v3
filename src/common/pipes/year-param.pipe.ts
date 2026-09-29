import { PipeTransform, Injectable } from '@nestjs/common';
import { invalidParam } from '../helpers/invalidParam.helper';

@Injectable()
export class YearValidationPipe implements PipeTransform {
    transform(value: string) {
        const year = parseInt(value, 10);
        const currentYear = new Date().getFullYear();

        if(isNaN(year) || year < 2005 || year > currentYear) {
            throw invalidParam(`El año debe ser entre: 2005 y ${currentYear}`) //new BadRequestException({ year: `Debe ser entre: 2005 y ${currentYear}` })
        }
        return year;
    }
}