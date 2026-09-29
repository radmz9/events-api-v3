import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { UserRoles } from 'src/common/enums';
import { SedesService } from './sedes.service';
import { SedeDto } from './dto/sede.dto';
import { IntParamPipe } from 'src/common/pipes';

@Controller('sedes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SedesController {
    constructor( private sedesService: SedesService){}

    @Get()
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    getSedes(){
        return this.sedesService.getSedes();
    }

    @Post()
    @Roles(UserRoles.ROOT)
    createSede(
        @Body() dto: SedeDto
    ){
        return this.sedesService.createSede(dto)
    }

    @Patch(':sedeId')
    @Roles(UserRoles.ROOT)
    updateSede(
        @Param('sedeId', IntParamPipe) sedeId: number,
        @Body() dto: SedeDto
    ){
        return this.sedesService.updateSede(sedeId, dto)
    }

    @Delete(':sedeId')
    @Roles(UserRoles.ROOT)
    deleteSede(
        @Param('sedeId', IntParamPipe) sedeId: number
    ){
        return this.sedesService.deleteSede(sedeId)
    }
}
