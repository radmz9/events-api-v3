import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser, Roles } from 'src/common/decorators';
import { UserRoles } from 'src/common/enums';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { CodeParamPipe } from 'src/common/pipes/code-param.pipe';
import { BaseUserDto } from '../dto/base-user.dto';
import { IntParamPipe } from 'src/common/pipes';
import { StaffService } from './staff.service';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ROOT, UserRoles.JEFE_DPTO)
export class StaffController {
    constructor(
        private staffService: StaffService
    ){}

    @Get('/professors')
    getProfessors(){
        return this.staffService.fetchUsersByType(4);
    }

    @Get('/administratives')
    getAdministratives(){
        return this.staffService.fetchUsersByType(5);
    }

    //Fetch one
    @Get('/:code/details')    
    fetchOne(
        @Param('code', CodeParamPipe) code: string,
        @GetUser('role') role: string
    ){
        return this.staffService.fetchOne(code, role)
    }

    @Get('/:code/events')
    fetchUserEvents(
        @Param('code', CodeParamPipe) code: string,
        @GetUser('role') role: string
    ){
        return this.staffService.fetchUserSummaryEvents(code, role)
    }

    //CUD
    @Post()
    createUser(
        @Body() dto: BaseUserDto
    ){
        return this.staffService.createUser(dto)
    }

    @Patch('/user/:userId')
    updateUser(
        @Param('userId', IntParamPipe) userId: number,
        @Body() dto: BaseUserDto
    ){
        return this.staffService.updateUser(userId, dto)
    }

    @Delete('/user/:userId')
    deleteUser(
        @Param('userId', IntParamPipe) userId: number
    ){
        return this.staffService.deleteUser(userId)
    }
}
