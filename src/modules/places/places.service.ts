import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlacesEntity } from './entity/places.entity';
import { DataSource, Repository } from 'typeorm';
import { PlaceDto } from './dto/place.dto';
import { BaseService } from 'src/common/base/base.service';

@Injectable()
export class PlacesService extends BaseService<PlacesEntity> {
    constructor(
        @InjectRepository(PlacesEntity) private repo: Repository<PlacesEntity>,
        dataSource: DataSource
    ){
        super(repo, dataSource)
    }

    async getPlaces(): Promise<PlacesEntity[]>{
        return this.repo.find({ order: { nombre: 'ASC' } });
    }

    async createPlace(dto: PlaceDto): Promise<PlacesEntity>{
        return this.createRecord(dto);
    }

    async updatePlace(placeId: number, dto: PlaceDto): Promise<PlacesEntity>{
        return this.updateRecord(placeId, dto);
    }

    async deletePlace(placeId: number): Promise<void>{
        return this.removeRecord(placeId);
    }
}