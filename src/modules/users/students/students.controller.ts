import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser, Roles } from 'src/common/decorators';
import { UserRoles } from 'src/common/enums';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { CodeParamPipe } from 'src/common/pipes/code-param.pipe';
import { CreateStudentDto } from '../dto/create-student.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { IntParamPipe } from 'src/common/pipes';
import { StudentsService } from './students.service';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.COORDI, UserRoles.ROOT)
export class StudentsController {
    constructor(
        private studentsService: StudentsService

    ){}

    //Student Report
    @Get('/:code')
    findOne(
        @Param('code', CodeParamPipe) code: string,
        @GetUser('role') role: string,
        @GetUser('idArea') areaId: number
    ){
        return this.studentsService.fetchOneStudent(code, role, areaId)
    }

    @Get('/:code/events')
    fetchStudentEvents(
        @Param('code', CodeParamPipe) code: string,
        @GetUser('role') role: string,
        @GetUser('idArea') areaId: number
    ){
        return this.studentsService.eventsSummaryByStudent(code, role, areaId)
    }

    //CUD
    @Post()  
    createStudent(
        @Body() dto: CreateStudentDto,
        @GetUser('role') role: string,
        @GetUser('idArea') areaId: number
    ){
        if(role !== 'ROOT' && dto.idArea !== areaId){
            throw new BadRequestException({ msg: MESSAGES.FORBIDDEN_EXCEPTION })
        }
        return this.studentsService.createStudent(dto, role, areaId);
    }

    @Patch('/:stuentId')
    updateStudent(
        @Param('studentId', IntParamPipe) studentId: number,
        @Body() dto: CreateStudentDto
    ){
        return this.studentsService.updateStudent(studentId, dto)
    }

    @Delete('/:studentId')
    deleteStudent(
        @Param('studentId', IntParamPipe) studentId: number,
        @GetUser('role') role: string,
        @GetUser('idArea') areaId: number,
    ){
        return this.studentsService.deleteStudent(studentId, role, areaId)
    }

    //Report By Area
    @Roles(UserRoles.ROOT)
    @Get('/area/:areaId/stats')
    studentsReport(
        @Param('areaId', IntParamPipe) areaId: number
    ){
        return this.studentsService.historicalStudentReport(areaId)
    }

    @Roles(UserRoles.COORDI)
    @Get('/historical/report')
    historicalReport(
        @GetUser('idArea') areaId: number
    ){
        return this.studentsService.historicalStudentReport(areaId)
    }

    //
    @Roles(UserRoles.COORDI)
    @Get('/calendar/:calendarId')
    studentsByCalendar(
        @Param('calendarId', IntParamPipe) calendarId: number,
        @GetUser('idArea') areaId: number
    ){  
        return this.studentsService.fetchAllByArea(areaId, calendarId)
    }

    @Roles(UserRoles.ROOT)
    @Get('/area/:areaId/calendar/:calendarId')
    studentsByAreaAndCalendar(
        @Param('areaId', IntParamPipe) areaId: number,
        @Param('calendarId', IntParamPipe) calendarId: number
    ){
        return this.studentsService.fetchAllByArea(areaId, calendarId)
    }
}
