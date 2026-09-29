import { PipeTransform, BadRequestException, Injectable } from '@nestjs/common';
import { REGEX } from '../constants/regex.constants';
import { MESSAGES } from '../constants/messages.constants';

@Injectable()
export class EventKeyPipe implements PipeTransform{
    transform(value: string) {
        const key = value;
        if(key.length !== 5){
            throw new BadRequestException({ eventKey: MESSAGES.STRICT_LENGTH(5) });
        }
        if(!key.match(REGEX.CODE_PATTERN)){
            throw new BadRequestException({ eventKey: MESSAGES.ALPHANUMERIC })
        }
        return key;
    }
}