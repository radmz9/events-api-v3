import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/base.service';
import { TypeEventEntity } from './entity/types_event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TypeEventDto } from './dto/types_event.dto';

@Injectable()
export class TypesEventService extends BaseService<TypeEventEntity> {
    constructor(
        @InjectRepository(TypeEventEntity) private repo: Repository<TypeEventEntity>,
        dataSource: DataSource
    ){
        super(repo, dataSource)
    }

    async getTypes(): Promise<TypeEventEntity[]>{
        return this.repo.find({ order: { nombre: 'ASC' } });
    }

    async createType(dto: TypeEventDto): Promise<TypeEventEntity>{
        return this.createRecord(dto);
    }

    async updateType(typeId: number, dto: TypeEventDto): Promise<TypeEventEntity>{
        return this.updateRecord(typeId, dto);
    }

    async deleteType(typeId: number): Promise<void>{
        return this.removeRecord(typeId);
    }
}
