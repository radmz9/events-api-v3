import { Module } from '@nestjs/common';
import { SetupService } from './setup.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthAccountEntity } from '../auth_account/entity/auth_account.entity';
import { UserEntity } from '../users/entity/users.entity';
import { AreaEntity } from '../areas/entity/areas.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthAccountEntity]),
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forFeature([AreaEntity])
  ],
  providers: [SetupService],
  exports: [SetupService]
})
export class SetupModule {}
