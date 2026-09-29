import { Module } from '@nestjs/common';
import { AuthAccountService } from './auth_account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthAccountEntity } from './entity/auth_account.entity';
import { AreaEntity } from '../areas/entity/areas.entity';
import { UserEntity } from '../users/entity/users.entity';
import { AuthAccountController } from './auth_account.controller';
import { RolesAdminEntity } from '../roles_admin/entity/roles_admin.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([AuthAccountEntity]),
    TypeOrmModule.forFeature([AreaEntity]),
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forFeature([RolesAdminEntity])
  ],
  providers: [AuthAccountService],
  controllers: [AuthAccountController]
})
export class AuthAccountModule {}
