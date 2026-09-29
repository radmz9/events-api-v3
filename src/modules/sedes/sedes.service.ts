import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SedeEntity } from './entity/sede.entity';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { SedeDto } from './dto/sede.dto';

@Injectable()
export class SedesService extends BaseService<SedeEntity> {
    constructor(
        @InjectRepository(SedeEntity) private repo: Repository<SedeEntity>,
        dataSource: DataSource
    ){
        super(repo, dataSource)
    }

    async getSedes(): Promise<SedeEntity[]>{
        return this.repo.find({ order: { nombre: 'ASC' }  });
    }

    async createSede(dto: SedeDto): Promise<SedeEntity>{
        return this.createRecord(dto);
    }

    async updateSede(sedeId: number, dto: SedeDto): Promise<SedeEntity>{
        return this.updateRecord(sedeId, dto)
    }

    async deleteSede(sedeId: number): Promise<void>{
        return this.removeRecord(sedeId)
    }
}