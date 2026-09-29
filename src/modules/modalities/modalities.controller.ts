import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { UserRoles } from 'src/common/enums';
import { ModalitiesService } from './modalities.service';
import { ModalityDto } from './dto/modality.dto';
import { IntParamPipe } from 'src/common/pipes';

@Controller('modalities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModalitiesController {
    constructor( private modService: ModalitiesService){}
    
    @Get()
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    getModalities(){
        return this.modService.getModalities()
    }
    
    @Post()
    @Roles(UserRoles.ROOT)
    createModality(
        @Body() dto: ModalityDto
    ){
        return this.modService.createModality(dto)
    }

    @Patch(':modalityId')
    @Roles(UserRoles.ROOT)
    updateModality(
        @Param('modalityId', IntParamPipe) modalityId: number,
        @Body() dto: ModalityDto
    ){
        return this.modService.updateModality(modalityId, dto)
    }

    @Delete(':modalityId')
    @Roles(UserRoles.ROOT)
    deleteModality(
        @Param('modalityId', IntParamPipe) modalityId: number,
    ){
        return this.modService.deleteModality(modalityId)
    }
}
