import { Controller, Body, Get, Post, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PlacesService } from './places.service';
import { UserRoles } from 'src/common/enums';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators';
import { PlaceDto } from './dto/place.dto';
import { IntParamPipe } from 'src/common/pipes';

@Controller('places')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlacesController {
    constructor(private placeService: PlacesService){}
    
    @Get()
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    getPlaces(){
        return this.placeService.getPlaces();
    }

    @Post()
    @Roles(UserRoles.ROOT)
    createPlace(
        @Body() dto: PlaceDto
    ){
        return this.placeService.createPlace(dto);
    }

    @Patch(':placeId')
    @Roles(UserRoles.ROOT)
    updatePlace(
        @Param('placeId', IntParamPipe) placeId: number,
        @Body() dto: PlaceDto
    ){
        return this.placeService.updatePlace(placeId, dto);
    }

    @Delete(':placeId')
    @Roles(UserRoles.ROOT)
    deletePlace(
        @Param('placeId', IntParamPipe) placeId: number
    ){
        return this.placeService.deletePlace(placeId);
    }
}