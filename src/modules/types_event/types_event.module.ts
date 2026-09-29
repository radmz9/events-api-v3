import { Module } from '@nestjs/common';
import { TypesEventService } from './types_event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeEventEntity } from './entity/types_event.entity';
import { TypesEventController } from './types_event.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TypeEventEntity])],
  providers: [TypesEventService],
  controllers: [TypesEventController]
})
export class TypesEventModule {}
