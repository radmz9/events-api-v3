import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AreaEntity } from './entity/areas.entity';
import { DataSource, FindOptionsSelect, Repository } from 'typeorm';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { BaseService } from 'src/common/base/base.service';
import { MESSAGES } from 'src/common/constants/messages.constants';

@Injectable()
export class AreasService extends BaseService<AreaEntity> {
    constructor(
        @InjectRepository(AreaEntity) private repo: Repository<AreaEntity>,
        dataSource: DataSource
    ){
        super(repo, dataSource)
    }

    private async validateUniqueKey(clave: string): Promise<void>{
        const exists = await this.repo.findOneBy({ clave });
        if(exists){
            throw new BadRequestException({clave: `${clave}: ${MESSAGES.ALREADY_EXISTS}` })
        }
    }

    async getAreas(typeId: number): Promise<AreaEntity[]>{
        const properties: FindOptionsSelect<AreaEntity> = typeId === 4
            ? { id: true, clave: true, nombre: true }
            : { id: true, clave: true, nombre: true, dependencia: true };
        return this.repo.find({ where: { id_tipo_area: typeId }, order: { nombre: 'ASC' }, select: properties });
    }

    async getAllAreas(): Promise<Partial<AreaEntity>[]>{
        const rawData = await this.repo.createQueryBuilder('a')
            .select([
                'id AS id',
                'nombre AS nombre'
            ])
            .where('id_tipo_area IN (1,2,3)')
            .orderBy('nombre','ASC')
            .getRawMany<{ id: number; nombre: string; }>();
        return rawData;
    }

    async createArea(dto: CreateAreaDto){
        await this.validateUniqueKey(dto.clave);
        return this.createRecord(dto);
    }

    async updateArea(areaId: number, dto: UpdateAreaDto){
        return this.updateRecord(areaId, dto);
    }

    async deleteArea(areaId: number){
        return this.removeRecord(areaId);
    }
}
