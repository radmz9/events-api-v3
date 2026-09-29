import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entity/event.entity';
import { EventsController } from './events.controller';
import { AreaEntity } from '../areas/entity/areas.entity';
import { TypeEventEntity } from '../types_event/entity/types_event.entity';
import { OdsEntity } from '../ods/entity/ods.entity';
import { ThematicEntity } from '../thematics/entity/themetic.entity';
import { ModalityEntity } from '../modalities/entity/modality.entity';
import { SedeEntity } from '../sedes/entity/sede.entity';
import { JwtService } from '@nestjs/jwt';
import { ReportsService } from '../reports/reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    AreaEntity, 
    EventEntity,
    OdsEntity,
    ModalityEntity,
    SedeEntity,
    ThematicEntity,
    TypeEventEntity,
  ])],
  providers: [EventsService, JwtService, ReportsService],
  controllers: [EventsController]
})
export class EventsModule {}
