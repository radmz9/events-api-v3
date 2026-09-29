import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ThematicEntity } from './entity/themetic.entity';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { ThematicDto } from './dto/thematic.dto';

@Injectable()
export class ThematicsService extends BaseService<ThematicEntity> {
    constructor(
        @InjectRepository(ThematicEntity) private repo: Repository<ThematicEntity>,
        dataSource: DataSource
    ){
        super(repo, dataSource)
    }

    async getThematics(): Promise<ThematicEntity[]>{
        return this.repo.find({ order: {  nombre: 'asc' } });
    }

    async createThematic(dto: ThematicDto): Promise<ThematicEntity>{
        return this.createRecord(dto)
    }

    async updateThematic(thematicId: number, dto: ThematicDto): Promise<ThematicEntity>{
        return this.updateRecord(thematicId, dto)
    }

    async deleteThematic(thematicId: number): Promise<void>{
        return this.removeRecord(thematicId)
    }
}
