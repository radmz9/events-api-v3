import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CalendarsService } from './calendars.service';
import { UserRoles } from 'src/common/enums';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { IntParamPipe } from 'src/common/pipes';

@Controller('calendars')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarsController {
    constructor(private calendarsService: CalendarsService){}

    @Get()
    @Roles(UserRoles.ROOT, UserRoles.COORDI)
    getCalendars(){
        return this.calendarsService.getCalendars()
    }

    @Post()
    @Roles(UserRoles.ROOT)
    createCalendar(
        @Body() dto: CreateCalendarDto
    ){
        return this.calendarsService.createCalendar(dto);
    }

    @Patch(':calendarId')
    @Roles(UserRoles.ROOT)
    updateCalendar(
        @Param('calendarId', IntParamPipe) calendarId: number,
        @Body() dto: CreateCalendarDto
    ){
        return this.calendarsService.updateCalendar(calendarId, dto)
    }

    @Delete(':calendarId')
    @Roles(UserRoles.ROOT)
    deleteCalendar(
        @Param('calendarId', IntParamPipe) calendarId: number    
    ){
        return this.calendarsService.deleteCalendar(calendarId)
    }
}