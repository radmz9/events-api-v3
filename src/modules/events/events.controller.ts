import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, StreamableFile, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GetUser, Roles, Public } from 'src/common/decorators';
import { UserRoles } from 'src/common/enums';
import { EventsService } from './events.service';
import { IntParamPipe } from 'src/common/pipes';
import { EventResDto } from './dto/responses/event-res.dto';
import { plainToInstance } from 'class-transformer';
import { PaginatedEventRespose } from './interfaces/paginated-event-res.interface';
import { CreateEventDto } from './dto/create-event.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { EventTokenGuard } from 'src/common/guards/event.token.guard';
import { CurrentEvent } from 'src/common/decorators/current-event.decorator';
import { ValidateEventKeyDto } from './dto/validate-key.dto';
import { ReportsService } from '../reports/reports.service';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
    constructor( 
        private eventsService: EventsService,
        private reportService: ReportsService
     ){}

    @Get('/page/:page/size/:size')
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    async getEvents(
        @Param('page', IntParamPipe) page: number,
        @Param('size', IntParamPipe) size: number,
        @GetUser('role') role: string,
        @GetUser('idArea') areaId: number
    ): Promise<PaginatedEventRespose<EventResDto>>{
        const isRoot = role === 'ROOT';
        const result = await this.eventsService.getEvents(isRoot, areaId, page, size);

        const dataDto = plainToInstance(EventResDto, result.data, {
            excludeExtraneousValues: true
        });
        return {
            data: dataDto,
            meta: result.meta
        }
    }

    @Post('/isActive')
    @Public()
    async checkIsEventActive(
        @Body() dto: ValidateEventKeyDto
    ){
        return this.eventsService.validateEventIsActive(dto);
    }

    @Get('/public/details')
    @Public()
    @UseGuards(EventTokenGuard)
    async getPublicInfoEvent(
        @CurrentEvent() eventId: number
    ){
        return this.eventsService.getPublicInfoEvent(eventId)
    }

    @Get('/details/:eventId')
    async getEventDetails(
        @Param('eventId', IntParamPipe) eventId: number
    ){
        return this.eventsService.getEventDataById(eventId);
    }

    //QR
    @Get('/qr/:eventId/download')
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    async generateQR(
        @Param('eventId', IntParamPipe) eventId: number
    ){
        try {
            const event = await this.eventsService.getEventDataById(eventId);
            const pdf = await this.reportService.generateQREventPDF(event);
            const fileName = `QR-${event.nombre.slice(0,100)}-${event.fecha}.pdf`
            return new StreamableFile(pdf, {
                type: 'application/pdf',
                disposition: `inline; filename="${fileName}"`
            })
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Post()
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    async createEvent(
        @Body() dto: CreateEventDto,
        @GetUser('idArea') idAreaUser: number,
        @GetUser('role') isRoot: string
    ){
        if(isRoot !== 'ROOT' && dto.idArea && dto.idArea !== idAreaUser){
            throw new ForbiddenException(MESSAGES.FORBIDDEN_EXCEPTION)
        }
        return this.eventsService.createEvent(dto, idAreaUser)
    }

    @Patch(':eventId')
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    async updateEvent(
        @Body() dto: CreateEventDto,
        @Param('eventId', IntParamPipe) eventId: number,
        @GetUser('idArea') idAreaUser: number,
        @GetUser('role') isRoot: string
    ){
        if(isRoot !== 'ROOT' && dto.idArea && dto.idArea !== idAreaUser ){
            throw new ForbiddenException(MESSAGES.FORBIDDEN_EXCEPTION)
        }
        return this.eventsService.updateEvent(eventId, dto, idAreaUser)
    }

    @Patch('/state/:eventId/toggle')
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    async eventToggleState(
        @Param('eventId', IntParamPipe) eventId: number,
        @GetUser('idArea') idAreaUser: number,
        @GetUser('role') userRole: string
    ){
        return this.eventsService.toggleStateEvent(eventId, idAreaUser, userRole);
    }

    @Patch('/constancy/:eventId/toggle')
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    async eventToggleConstancy(
        @Param('eventId', IntParamPipe) eventId: number,
        @GetUser('idArea') idAreaUser: number,
        @GetUser('role') userRole: string
    ){
        return this.eventsService.toggleConstancyEvent(eventId, idAreaUser, userRole);
    }

    @Delete(':eventId')
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    async deleteEvent(
        @Param('eventId', IntParamPipe) eventId: number,
        @GetUser('idArea') idAreaUser: number,
        @GetUser('role') userRole: string
    ){
        return this.eventsService.deleteEvent(eventId, idAreaUser, userRole);
    }
}
