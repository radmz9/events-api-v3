import { Module } from '@nestjs/common';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../events/entity/event.entity';
import { OutsiderEntity } from '../outsiders/entity/outsider.entity';
import { RecordEntity } from './entity/record.entity';
import { UserEntity } from '../users/entity/users.entity';
import { ReportsService } from '../reports/reports.service';
import { RawDataService } from './raw-data.service';
import { OdsEntity } from '../ods/entity/ods.entity';
import { AreaEntity } from '../areas/entity/areas.entity';
import { TypeEventEntity } from '../types_event/entity/types_event.entity';
import { JwtService } from '@nestjs/jwt';
import { ReportsController } from './reports/reports.controller';
import { ReportsService as RecordReportService } from './reports/reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    AreaEntity,
    EventEntity,
    OutsiderEntity,
    RecordEntity,
    UserEntity,
    OdsEntity,
    TypeEventEntity
  ])
  ],
  providers: [RecordsService, RawDataService, ReportsService, RecordReportService, JwtService],
  controllers: [RecordsController, ReportsController]
})
export class RecordsModule {}
