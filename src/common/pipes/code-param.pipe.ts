import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { REGEX } from '../constants/regex.constants';
import { MESSAGES } from '../constants/messages.constants';

@Injectable()
export class CodeParamPipe implements PipeTransform {
    transform(value: string) {
        const code = value;
        if(code.length < 7 || code.length > 9 ){
            throw new BadRequestException({ code: MESSAGES.CUSTOM_LENGTH(7, 9)});
        }

        if(!code.match(REGEX.CODE_PATTERN)){
            throw new BadRequestException({ code: MESSAGES.ALPHANUMERIC })
        }
        return code;
    }
}