import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { UserRoles } from 'src/common/enums';
import { ThematicsService } from './thematics.service';
import { ThematicDto } from './dto/thematic.dto';
import { IntParamPipe } from 'src/common/pipes';

@Controller('thematics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ThematicsController {
    constructor( private thematicService: ThematicsService ){}

    @Get()
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    getThematics(){
        return this.thematicService.getThematics()
    }

    @Post()
    @Roles(UserRoles.ROOT)
    createThematic(
        @Body() dto: ThematicDto
    ){
        return this.thematicService.createThematic(dto);
    }

    @Patch(':thematicId')
    @Roles(UserRoles.ROOT)
    updatedThematic(
        @Param('thematicId', IntParamPipe) thematicId: number,
        @Body() dto: ThematicDto
    ){
        return this.thematicService.updateThematic(thematicId, dto);
    }

    @Delete(':thematicId')
    @Roles(UserRoles.ROOT)
    deleteThematic(
        @Param('thematicId', IntParamPipe) thematicId: number
    ){
        return this.thematicService.deleteThematic(thematicId)
    }
}
