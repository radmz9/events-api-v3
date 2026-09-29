import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AreasService } from './areas.service';
import { UserRoles } from 'src/common/enums';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators';
import { CreateAreaDto } from './dto/create-area.dto';
import { IntParamPipe } from 'src/common/pipes';
import { UpdateAreaDto } from './dto/update-area.dto';

@Controller('areas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreasController {
    constructor(private areasService: AreasService){}

    @Get()
    @Roles(UserRoles.ROOT)
    getAllAreas(){
        return this.areasService.getAllAreas();
    }

    @Get('/type/career')
    fetchCareers(){
        return this.areasService.getAreas(1);
    }

    @Get('/type/department')
    @Roles(UserRoles.ROOT, UserRoles.JEFE_DPTO)
    fetchDepartments(){
        return this.areasService.getAreas(2);
    }

    @Get('/type/area')
    fetchAreas(){
        return this.areasService.getAreas(3);
    }

    @Get('/type/supervision')
    fetSupervisions(){
        return this.areasService.getAreas(4);
    }

    //CUD
    @Post()
    @Roles(UserRoles.ROOT)
    createArea(
        @Body() areaDto: CreateAreaDto
    ){
        return this.areasService.createArea(areaDto)
    }

    @Patch(':areaId')
    @Roles(UserRoles.ROOT)
    updateArea(
        @Param('areaId', IntParamPipe) areaId: number,
        @Body() areaDto: UpdateAreaDto
    ){
        return this.areasService.updateArea(areaId, areaDto);
    }

    @Delete(':areaId')
    @Roles(UserRoles.ROOT)
    deleteArea(
        @Param('areaId', IntParamPipe) areaId: number
    ){
        return this.areasService.deleteArea(areaId);
    }
}
