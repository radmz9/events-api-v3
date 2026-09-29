import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModalityEntity } from './entity/modality.entity';
import { DataSource, Repository } from 'typeorm';
import { ModalityDto } from './dto/modality.dto';
import { BaseService } from 'src/common/base/base.service';

@Injectable()
export class ModalitiesService extends BaseService<ModalityEntity> {
    constructor(
        @InjectRepository(ModalityEntity) private repo: Repository<ModalityEntity>,
        dataSource: DataSource
    ){
        super(repo, dataSource);
    }

    async getModalities(): Promise<ModalityEntity[]>{
        return this.repo.find({ order: { nombre: 'ASC' } });
    }

    async createModality(dto: ModalityDto): Promise<ModalityEntity>{
        return this.createRecord(dto);
    }

    async updateModality(modalityId: number, dto: ModalityDto): Promise<ModalityEntity>{
        return this.updateRecord(modalityId, dto);
    }

    async deleteModality(modalityId: number): Promise<void>{
        return this.removeRecord(modalityId);
    }
}
