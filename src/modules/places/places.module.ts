import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlacesEntity } from './entity/places.entity';
import { PlacesController } from './places.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlacesEntity])],
  providers: [PlacesService],
  controllers: [PlacesController]
})
export class PlacesModule {}
