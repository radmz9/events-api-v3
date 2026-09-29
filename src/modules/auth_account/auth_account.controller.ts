import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthAccountService } from './auth_account.service';
import { AuthAccountDto } from './dto/auth_account.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser, Roles } from 'src/common/decorators';
import { UserRoles } from 'src/common/enums';
import { IntParamPipe } from 'src/common/pipes';
import { ChangeUserDto } from './dto/change_user.dto';
import { ChangePasswordDto } from './dto/change_password.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthAccountController {
    constructor(private authAccountService: AuthAccountService){}

    @Get()
    @Roles(UserRoles.ROOT)
    getAuthAccounts(){
        return this.authAccountService.getAuthAccounts();
    }

    @Get('/profile')
    getProfile(
        @GetUser('sub') accountId: number
    ){
        return this.authAccountService.getProfile(accountId)
    }

    @Get('/unused/areas')
    @Roles(UserRoles.ROOT)
    getAvailableAreas(){
        return this.authAccountService.getAvailableAreas()
    }

    @Get('/unused/staff')
    @Roles(UserRoles.ROOT)
    getAvailableStaff(){
        return this.authAccountService.getAvailableStaff()
    }

    @Post()
    @Roles(UserRoles.ROOT)
    createAuthAccount(
        @Body() dto: AuthAccountDto
    ){
        return this.authAccountService.createAuthAccount(dto);
    }

    @Patch(':accountId')
    @Roles(UserRoles.ROOT)
    changeManagedUser(
        @Param('accountId', IntParamPipe) accountId: number,
        @Body() dto: ChangeUserDto
    ){
        return this.authAccountService.changeManagedUser(accountId,dto)
    }

    @Patch('/reset/password')
    changePassword(
        @Body() dto: ChangePasswordDto,
        @GetUser('sub') accountId: number
    ){
        return this.authAccountService.changePassword(accountId, dto);
    }

    @Delete(':accountId')
    @Roles(UserRoles.ROOT)
    deleteAccount(
        @Param('accountId', IntParamPipe) accountId: number
    ){
        return this.authAccountService.deleteAccount(accountId)
    }
}
