import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository, DeepPartial, FindOptionsWhere, DataSource, EntityTarget, ObjectLiteral } from 'typeorm';
import { handleMysqlError } from '../utils/db-error-handler';
import { MESSAGES } from '../constants/messages.constants';

interface BaseEntity {
    id: number
}

export abstract class BaseService<T extends BaseEntity> {
    constructor( 
        protected readonly repository: Repository<T>,
        protected readonly dataSource: DataSource
    ){}

    validateUserArea(idArea: number, idAreaUser: number, userRole: string): void{
        if(userRole !== 'ROOT' && idArea !== idAreaUser){
            throw new ForbiddenException(MESSAGES.FORBIDDEN_EXCEPTION);
        }
    }

    async validateExists(
        conditions: FindOptionsWhere<T>, 
        entityName: string = 'Record'
    ): Promise<T>{
        const record = await this.repository.findOneBy(conditions);
        if(!record){
            const [field] = Object.entries(conditions)[0];
            throw new BadRequestException({ [field]: `${entityName} no encontrado` })
        }
        return record;
    }

    async validateOtherExists<E extends ObjectLiteral>(
        entity: EntityTarget<E>,
        conditions: FindOptionsWhere<E>,
        entityName: string = 'Entity'
    ): Promise<void>{
        const repo = this.dataSource.getRepository(entity);
        const count = await repo.count({ where: conditions });

        if(count === 0){
            const [field] = Object.entries(conditions)[0];
            throw new BadRequestException({ [field]: `${entityName} no encontrado` });
        }
    }

    async validateManyExists(
        validations: { entity: EntityTarget<T>, conditions: FindOptionsWhere<T>, name: string }[]
    ): Promise<void>{
        await Promise.all(
            validations.map(v => this.validateOtherExists(v.entity, v.conditions, v.name))
        );
    }

    //CRUD
    async createRecord(recordDto: DeepPartial<T>): Promise<T>{
        try {
            const record = this.repository.create(recordDto);
            return this.repository.save(record);
        } catch (error) {
            handleMysqlError(error)
        }
    }

    async updateRecord(id: number, updateDto: DeepPartial<T>): Promise<T>{
        const entity = await this.validateExists({id} as FindOptionsWhere<T>);

        type UpdatedKeys = keyof DeepPartial<T>;
        for(const key of Object.keys(updateDto) as UpdatedKeys[]){
            const value = updateDto[key];
            if(value !== undefined){
                entity[key] = value as T[UpdatedKeys];
            }
        }
        try {
            return this.repository.save(entity);
        } catch (error) {
            handleMysqlError(error)
        }
    }

    async removeRecord(id: number): Promise<void>{
        try {
            const result = await this.repository.delete(id);
            if(!result.affected){
                throw new NotFoundException()
            }            
        } catch (error) {
            handleMysqlError(error)
        }
    }
}