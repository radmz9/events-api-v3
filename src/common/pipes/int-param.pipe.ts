import { PipeTransform, Injectable } from '@nestjs/common';
import { MESSAGES } from '../constants/messages.constants';
import { invalidParam } from '../helpers/invalidParam.helper';

@Injectable()
export class IntParamPipe implements PipeTransform{
    transform(value: string): number {
        const paramValue = parseInt(value, 10);
        if(isNaN(paramValue) || paramValue < 1){
            throw invalidParam(MESSAGES.NUMERIC) //new BadRequestException(`${MESSAGES.NUMERIC}`);
        }

        return paramValue;
    }
}