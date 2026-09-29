import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/users.entity';
import { UsersController } from './users.controller';
import { AreaEntity } from '../areas/entity/areas.entity';
import { CalendarEntity } from '../calendars/entity/calendar.entity';
import { SedeEntity } from '../sedes/entity/sede.entity';
import { RecordEntity } from '../records/entity/record.entity';
import { ReportsService } from '../reports/reports.service';
import { StudentsController } from './students/students.controller';
import { StaffController } from './staff/staff.controller';
import { StudentsService } from './students/students.service';
import { StaffService } from './staff/staff.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    UserEntity,
    AreaEntity,
    CalendarEntity,
    SedeEntity,
    RecordEntity
  ])],
  providers: [UsersService, ReportsService, StudentsService, StaffService],
  controllers: [UsersController, StudentsController, StaffController]
})
export class UsersModule {}
