import { Module } from '@nestjs/common';
import { ModalitiesService } from './modalities.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModalityEntity } from './entity/modality.entity';
import { ModalitiesController } from './modalities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ModalityEntity])],
  controllers: [ModalitiesController],
  providers: [ModalitiesService]
})
export class ModalitiesModule {}
