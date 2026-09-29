import { Module } from '@nestjs/common';
import { CalendarsService } from './calendars.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEntity } from './entity/calendar.entity';
import { CalendarsController } from './calendars.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEntity])],
  providers: [CalendarsService],
  controllers: [CalendarsController]
})
export class CalendarsModule {}
