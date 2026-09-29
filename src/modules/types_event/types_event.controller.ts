import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { UserRoles } from 'src/common/enums';
import { TypesEventService } from './types_event.service';
import { TypeEventDto } from './dto/types_event.dto';
import { IntParamPipe } from 'src/common/pipes';

@Controller('types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TypesEventController {
    constructor( private typeService: TypesEventService ){}

    @Get()
    @Roles(UserRoles.ROOT, UserRoles.COORDI, UserRoles.JEFE_AREA, UserRoles.JEFE_DPTO)
    getTypes(){
        return this.typeService.getTypes()
    }

    @Post()
    @Roles(UserRoles.ROOT)
    createType(
        @Body() dto: TypeEventDto
    ){
        return this.typeService.createType(dto)
    }

    @Patch(':typeId')
    @Roles(UserRoles.ROOT)
    updateType(
        @Param('typeId', IntParamPipe) typeId: number,
        @Body() dto: TypeEventDto
    ){
        return this.typeService.updateType(typeId, dto);
    }

    @Delete(':typeId')
    @Roles(UserRoles.ROOT)
    deleteType(
        @Param('typeId', IntParamPipe) typeId: number
    ){
        return this.typeService.deleteType(typeId);
    }
}
