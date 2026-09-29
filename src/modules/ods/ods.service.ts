import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OdsEntity } from './entity/ods.entity';
import { DataSource, Repository } from 'typeorm';
import { OdsDto } from './dto/ods.dto';
import { BaseService } from 'src/common/base/base.service';

@Injectable()
export class OdsService extends BaseService<OdsEntity> {
    constructor(
        @InjectRepository(OdsEntity) private repo: Repository<OdsEntity>,
        dataSource: DataSource
    ){
        super(repo, dataSource)
    }

    async getOds(): Promise<OdsEntity[]>{
        return this.repo.find({ order: { nombre: 'ASC' } });
    }

    async createOds(dto: OdsDto): Promise<OdsEntity>{
        return this.createRecord(dto);
    }

    async updateOds(odsId: number, dto: OdsDto): Promise<OdsEntity>{
        return this.updateRecord(odsId, dto)
    }

    async deleteOds(odsId: number): Promise<void>{
        return this.removeRecord(odsId);
    }
}
