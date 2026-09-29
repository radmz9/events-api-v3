import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

//DTOs
export function formatValidationErrors(errors: ValidationError[]){
    const result: Record<string, string> = {};
    errors.forEach((err) => {
        if(err.constraints){
            result[err.property] = Object.values(err.constraints)[0];
        }
    })
    return result;
}

//Pipes
export function throwBadRequest(field: string, message: string) {
    throw new BadRequestException({ [field]: message })
}