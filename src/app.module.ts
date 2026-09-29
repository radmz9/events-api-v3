import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AreasModule } from './modules/areas/areas.module';
import { CalendarsModule } from './modules/calendars/calendars.module';
import { PlacesModule } from './modules/places/places.module';
import { ModalitiesModule } from './modules/modalities/modalities.module';
import { OdsModule } from './modules/ods/ods.module';
import { UsersModule } from './modules/users/users.module';
import { AuthAccountModule } from './modules/auth_account/auth_account.module';
import { SetupModule } from './modules/setup/setup.module';
import { SedesModule } from './modules/sedes/sedes.module';
import { ThematicsModule } from './modules/thematics/thematics.module';
import { TypesEventModule } from './modules/types_event/types_event.module';
import { EventsModule } from './modules/events/events.module';
import { RecordsModule } from './modules/records/records.module';
// import { ReportsModule } from './modules/reports/reports.module';
import { CsvModule } from './modules/csv/csv.module';
import { BackupModule } from './modules/backup/backup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    AuthModule,
    AreasModule,
    CalendarsModule,
    PlacesModule,
    ModalitiesModule,
    OdsModule,
    UsersModule,
    AuthAccountModule,
    SetupModule,
    SedesModule,
    ThematicsModule,
    TypesEventModule,
    EventsModule,
    RecordsModule,
    // ReportsModule,
    CsvModule,
    BackupModule,
  ],
})
export class AppModule {}
