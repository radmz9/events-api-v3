import { ConflictException, BadRequestException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

interface MysqlDriverError {
    code?: string;
}

function isMysqlDriverError(error: unknown): error is MysqlDriverError{
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error
    )
}

export function handleMysqlError(error: unknown): never {
    if(error instanceof QueryFailedError){
        const driverError: unknown = error.driverError;

        if(isMysqlDriverError(driverError)){
            switch(driverError?.code){
                case 'ER_ROW_IS_REFERENCED_2':
                    throw new ConflictException({error: 'El registro no puede ser eliminado, se encuentra ligado a otra tabla.'});
    
                case 'ER_DUP_ENTRY':
                    throw new ConflictException({error: `La clave o identificador del registro ya existe.`});

                case 'ER_NO_REFERENCED_ROW_2':
                    throw new BadRequestException({error: 'Uno de los IDs proporcionados no existe en la base de datos.'});

                case 'ER_DATA_TOO_LONG':
                    throw new BadRequestException({error: 'Uno de los campos excede el límite de caracteres permitido.'});
            }
        }

    }
    // throw new InternalServerErrorException('Ocurrió un error inesperado en el servidor');  ..Production mode
    throw error; //On dev mode
}