import { Module } from '@nestjs/common';
import { SedesService } from './sedes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SedeEntity } from './entity/sede.entity';
import { SedesController } from './sedes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SedeEntity])],
  providers: [SedesService],
  controllers: [SedesController]
})
export class SedesModule {}
