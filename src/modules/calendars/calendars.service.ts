import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarEntity } from './entity/calendar.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { BaseService } from 'src/common/base/base.service';
import { MESSAGES } from 'src/common/constants/messages.constants';

@Injectable()
export class CalendarsService extends BaseService<CalendarEntity> {
    constructor(
        @InjectRepository(CalendarEntity) private repo: Repository<CalendarEntity>,
        dataSource: DataSource
    ){
        super(repo, dataSource)
    }

    private async validateUniqueName(name: string): Promise<void>{
        const exists = await this.repo.findOneBy({ nombre: name });
        if(exists){
            throw new BadRequestException({ nombre: `${name}: ${MESSAGES.ALREADY_EXISTS}` })
        }
    }

    async getCalendars(): Promise<CalendarEntity[]>{
        return this.repo.find({ order: { nombre: 'DESC' } });
    }

    async createCalendar(dto: CreateCalendarDto): Promise<CalendarEntity>{
        await this.validateUniqueName(dto.nombre);
        return this.createRecord(dto);
    }

    async updateCalendar(calendarId: number, dto: CreateCalendarDto): Promise<CalendarEntity>{
        return this.updateRecord(calendarId, dto);
    }

    async deleteCalendar(calendarId: number): Promise<void>{
        return this.removeRecord(calendarId);
    }
}