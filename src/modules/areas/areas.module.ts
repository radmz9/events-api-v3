import { Module } from '@nestjs/common';
import { AreasService } from './areas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaEntity } from './entity/areas.entity';
import { AreasController } from './areas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AreaEntity])],
  providers: [AreasService],
  controllers: [AreasController]
})
export class AreasModule {}
