import { BadRequestException } from "@nestjs/common";

export function invalidParam(message: string): BadRequestException{
    throw new BadRequestException({
        code_error: 'INVALID_PARAM',
        message
    })
}