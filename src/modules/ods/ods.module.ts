import { Module } from '@nestjs/common';
import { OdsService } from './ods.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OdsEntity } from './entity/ods.entity';
import { OdsController } from './ods.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OdsEntity])],
  providers: [OdsService],
  controllers: [OdsController],
})
export class OdsModule {}
