import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { UserRoles } from 'src/common/enums';
import { OdsService } from './ods.service';
import { OdsDto } from './dto/ods.dto';
import { IntParamPipe } from 'src/common/pipes';

@Controller('ods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OdsController {
    constructor( private odsService: OdsService ){}
    
    @Get()
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    getOds(){
        return this.odsService.getOds();
    }
    
    @Post()
    @Roles(UserRoles.ROOT)
    createOds(
        @Body() dto: OdsDto
    ){
        return this.odsService.createOds(dto)
    }

    @Patch(':odsId')
    @Roles(UserRoles.ROOT)
    updateOds(
        @Param('odsId', IntParamPipe) odsId: number,
        @Body() dto: OdsDto
    ){
        return this.odsService.updateOds(odsId, dto)
    }

    @Delete(':odsId')
    @Roles(UserRoles.ROOT)
    deleteOds(
        @Param('odsId', IntParamPipe) odsId: number,
    ){
        return this.odsService.deleteOds(odsId)
    }
}
