import { Body, Controller, Get, Param, StreamableFile, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UsersService } from './users.service';
import { GetUser, Public, Roles } from 'src/common/decorators';
import { UserRoles } from 'src/common/enums';
import { CodeParamPipe } from 'src/common/pipes/code-param.pipe';
import { ReportsService } from '../reports/reports.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(
        private userService: UsersService,
        private reportService: ReportsService
    ){}

    // User
    @Get(':code')
    @Public()
    getUser(
        @Param('code', CodeParamPipe) code: string
    ){
        return this.userService.getAttendanceByUser(code);
    }

    @Get('/:code/access')
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_DPTO)
    searchUser(
        @Param('code', CodeParamPipe) code: string,
        @GetUser('role') role: string,
        @GetUser('idArea') areaId: number
    ){
        return this.userService.findUserBycode(code, role, areaId);
    }

    //Generate PDF Report
    @Get('/report/:code')
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_DPTO)
    async getUserReportPDF(
        @Param('code', CodeParamPipe) code: string, 
    ): Promise<StreamableFile>{
        try {
            const data = await this.userService.getAttendanceByUser(code);
            const pdf = await this.reportService.generateUserReportEvents(data);
            const date = new Date().toLocaleDateString('es-MX').replaceAll('/','-');

            return new StreamableFile(pdf, {
                type: 'application/pdf',
                disposition: `inline; filename="EVENTOS-${data.nombre}-${date}.pdf"`
            });
        } catch (error) {
            console.log(`Error: `, error)
            throw error;
        }

    }
}
