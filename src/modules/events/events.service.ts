import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEntity } from './entity/event.entity';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { AreaEntity } from '../areas/entity/areas.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { TypeEventEntity } from '../types_event/entity/types_event.entity';
import { SedeEntity } from '../sedes/entity/sede.entity';
import { OdsEntity } from '../ods/entity/ods.entity';
import { ModalityEntity } from '../modalities/entity/modality.entity';
import { ThematicEntity } from '../thematics/entity/themetic.entity';
import { handleMysqlError } from 'src/common/utils/db-error-handler';
import { EventResDto } from './dto/responses/event-res.dto';
import { plainToInstance } from 'class-transformer';
import { PublicEventResDto } from './dto/responses/public-event-res.dto';
import { JwtService } from '@nestjs/jwt';
import { ValidateEventKeyDto } from './dto/validate-key.dto';
import { eventQueryOptions } from './event.constants';

@Injectable()
export class EventsService extends BaseService<EventEntity>{
    constructor(
        @InjectRepository(EventEntity) private repo: Repository<EventEntity>,
        dataSource: DataSource,
        private readonly jwtService: JwtService
    ){
        super(repo, dataSource)
    }

    async getEvents(isRoot: boolean, areaId: number, page: number, size: number){
        const skip = (page - 1) * size;
        await this.validateOtherExists(AreaEntity, { id: areaId }, 'Area');
        const result = isRoot ? {} : { idArea: areaId };
        const [data, total] = await this.repo.findAndCount({
            where: result,
            skip,
            take: size,
            ...eventQueryOptions,
            order: { fecha: 'DESC' }
        });

        const mappedData = data.map((e) => EventResDto.fromEntity(e));

        const totalPages = Math.ceil(total/size);
        if(page > totalPages && total > 0){
            throw new NotFoundException(`La página ${page} no existe. Debe ser menor que ${totalPages}`);
        }

        return { 
            data: mappedData,
            meta: {
                totalItems: total,
                itemCount: data.length,
                itemsPerPage: size,
                totalPages,
                currentPage: page
            }
        }
    }
    
    async getEventDataById(eventId: number): Promise<EventResDto>{
        const event = await this.repo.findOneOrFail({
            where: { id: eventId },
            ...eventQueryOptions
        });

        const plainData = EventResDto.fromEntity(event);

        return plainToInstance(EventResDto, plainData, {
            excludeExtraneousValues: true
        })
    }

    async createEvent(dto: CreateEventDto, idAreaUser: number): Promise<EventResDto>{
        const idArea = dto.idArea ?? idAreaUser;
        await this.validateManyExists([
            { entity: TypeEventEntity, conditions: { id: dto.idTipo }, name: 'Type' },
            { entity: AreaEntity, conditions: { id: dto.idArea }, name: 'Area' },
            { entity: SedeEntity, conditions: { id: dto.idSede }, name: 'Sede' },
            { entity: OdsEntity, conditions: { id: dto.idOds }, name: 'Ods' },
            { entity: ModalityEntity, conditions: { id: dto.idModalidad }, name: 'Modality' },
            { entity: ThematicEntity, conditions: { id: dto.idModalidad }, name: 'Modality' }
        ])
        const data = this.repo.create({...dto, idArea});
        try {
            const createdEvent = await this.repo.save(data);
            return this.getEventDataById(createdEvent.id);
        } catch (error) {
            handleMysqlError(error)
        }
    }

    async updateEvent(eventId: number, dto: CreateEventDto, idAreaUser: number): Promise<EventResDto>{
        const event = await this.validateExists({ id: eventId }, 'Event');
        const idArea = dto.idArea ?? idAreaUser;
        
        await this.validateManyExists([
            { entity: TypeEventEntity, conditions: { id: dto.idTipo }, name: 'Type' },
            { entity: AreaEntity, conditions: { id: dto.idArea }, name: 'Area' },
            { entity: SedeEntity, conditions: { id: dto.idSede }, name: 'Sede' },
            { entity: OdsEntity, conditions: { id: dto.idOds }, name: 'Ods' },
            { entity: ModalityEntity, conditions: { id: dto.idModalidad }, name: 'Modality' },
            { entity: ThematicEntity, conditions: { id: dto.idModalidad }, name: 'Modality' }
        ]);
        try {
            Object.assign(dto, { idArea });
            Object.assign(event, dto)
            await this.repo.save(event);
            return this.getEventDataById(eventId);
        } catch (error) {
            handleMysqlError(error)
        }
    }

    async deleteEvent(eventId: number, idAreaUser: number, userRole: string): Promise<void>{
        const event = await this.validateExists({ id: eventId }, 'Event');
        this.validateUserArea(event.idArea, idAreaUser, userRole);
        return this.removeRecord(eventId);
    }

    async toggleStateEvent(eventId: number, idAreaUser: number, userRole: string): Promise<void>{
        const event = await this.validateExists({ id: eventId }, 'Event');
        this.validateUserArea(event.idArea, idAreaUser, userRole);
        try {
            await this.repo.update({ id: eventId },{ isActive: () => 'NOT isActive' });
        } catch (error) {
            handleMysqlError(error)   
        }
    }

    async toggleConstancyEvent(eventId: number, idAreaUser: number, userRole: string): Promise<void>{
        const event = await this.validateExists({ id: eventId }, 'Event');
        this.validateUserArea(event.idArea, idAreaUser, userRole);
        try {
            await this.repo.update({ id: eventId }, { constancy: () => 'NOT constancy' })
        } catch (error) {
            handleMysqlError(error)
        }
    }

    private generateEventToken(eventId: number): string{
        const token = this.jwtService.sign({ event: eventId }, {
            secret: process.env.JWT_EVENT_SECRET,
            expiresIn: '1h'
        });
        return token
    }

    async validateEventIsActive(dto: ValidateEventKeyDto): Promise<{ event_token: string }>{
        const event = await this.validateExists({ clave: dto.eventKey }, 'Event');
        if(!event.isActive){
            throw new BadRequestException({ eventKey: `El evento está inactivo` })
        }
        const event_token = this.generateEventToken(event.id);
        return { 
            event_token 
        };
    }

    async validateEventIsStillActive(eventId: number): Promise<{ event_token: string }>{
        const event = await this.validateExists({ id: eventId }, 'Event');
        if(!event.isActive){
            throw new BadRequestException({ eventId: 'El evento esta inactivo' });
        }
        const event_token = this.generateEventToken(eventId);
        return {
            event_token
        }
    }

    async getPublicInfoEvent(eventId: number): Promise<PublicEventResDto>{
        const data = await this.getEventDataById(eventId);
        
        return plainToInstance(PublicEventResDto, data, {
            excludeExtraneousValues: true
        })
    }
}
