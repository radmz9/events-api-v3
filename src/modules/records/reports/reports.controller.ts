import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RawDataService } from '../raw-data.service';
import { YearValidationPipe } from 'src/common/pipes/year-param.pipe';
import { GetUser, Roles } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRoles } from 'src/common/enums';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
    constructor(
        private rawDataService: RawDataService
    ){}

    //By Gender
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_DPTO, UserRoles.JEFE_AREA)
    @Get('/:year/genders')
    async fetchByGender(
        @Param('year', YearValidationPipe) year: number,
        @GetUser('role') role: string,
        @GetUser('idArea') areaId: number
    ){
        return this.rawDataService.getAttendaceEventsByGender(year, role, areaId)
    }

    //By Roles
    @Roles(UserRoles.ROOT, UserRoles.SUPERVISOR)
    @Get('/:year/roles')
    async fetchByRoles(
        @Param('year', YearValidationPipe) year: number,
    ){
        return this.rawDataService.getAttendaceEventsByRole(year);
    }

    //By Ods
    @Roles(UserRoles.ROOT, UserRoles.SUPERVISOR)
    @Get('/:year/ods')
    async fetchByOds(
        @Param('year', YearValidationPipe) year: number,
    ){
        return this.rawDataService.getDashboardOds(year);
    }

    //By Students - Career
    @Roles(UserRoles.ROOT, UserRoles.SUPERVISOR)
    @Get('/:year/students')
    async fetchByStudents(
        @Param('year', YearValidationPipe) year: number,
    ){
        return this.rawDataService.getFullStatsAttendaceByStudents(year);
    }

    //By Staff
    @Roles(UserRoles.ROOT, UserRoles.SUPERVISOR)
    @Get('/:year/staff')
    async fetchByStaff(
        @Param('year', YearValidationPipe) year: number,
    ){
        return this.rawDataService.getFullStatsStaffAttendanceByYear(year);
    }

    //General
    @Roles(UserRoles.ROOT, UserRoles.SUPERVISOR)
    @Get('/:year/general')
    async fetchByArea(
        @Param('year', YearValidationPipe) year: number,
    ){
        return this.rawDataService.getAreasForTheFinalBossReport(year);
    }

    //Details from students
    @Roles(UserRoles.ROOT, UserRoles.SUPERVISOR)
    @Get('/:year/details')
    async fetchByDetails(
        @Param('year', YearValidationPipe) year: number,
    ){
        return this.rawDataService.getDetailedAttendanceFromStudents(year);
    }

    //By Account
    @Get('/')
    async fetchByAccount(
        @GetUser('idArea') areaId: number
    ){
        return this.rawDataService.generalReportByArea(areaId);
    }
}
