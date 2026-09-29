import { Module } from '@nestjs/common';
import { ThematicsService } from './thematics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThematicEntity } from './entity/themetic.entity';
import { ThematicsController } from './thematics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ThematicEntity])],
  providers: [ThematicsService],
  controllers: [ThematicsController]
})
export class ThematicsModule {}
