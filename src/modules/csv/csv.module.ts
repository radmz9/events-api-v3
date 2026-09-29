import { Module } from '@nestjs/common';
import { CsvService } from './csv.service';
import { CsvController } from './csv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entity/users.entity';
import { AreaEntity } from '../areas/entity/areas.entity';
import { CalendarEntity } from '../calendars/entity/calendar.entity';
import { SedeEntity } from '../sedes/entity/sede.entity';
import { EventEntity } from '../events/entity/event.entity';
import { RecordEntity } from '../records/entity/record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    UserEntity,
    AreaEntity,
    CalendarEntity,
    SedeEntity,
    EventEntity,
    RecordEntity
  ])],
  providers: [CsvService],
  controllers: [CsvController]
})
export class CsvModule {}
