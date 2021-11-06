import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SharedModule } from '../../shared/shared.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MeetingMemberSnapshotDocument,
  MeetingMemberSnapshotSchema,
} from '../../shared/infrastructure/schemas/meeting-member-snapshot.schema';
import { MonitoringController } from './interfaces/rest/monitoring.controller';
import { MeetingMemberSnapshotEntityRepository } from './infrastructure/repositories/meeting-member-snapshot-entity.repository';
import { MeetingMemberSnapshotDtoRepository } from './infrastructure/repositories/meeting-member-snapshot-dto.repository';
import { MeetingMemberSnapshotDocumentFactory } from './infrastructure/factories/meeting-member-snapshot-document.factory';
import { MeetingMemberSnapshotFactory } from './domain/meeting-member-snapshot.factory';
import { MonitoringCommandHandlers } from './applications/commands';
import { MonitoringService } from './applications/services/monitoring.service';
import { MonitoringQueryHandlers } from './applications/queries';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: MeetingMemberSnapshotDocument.name,
        schema: MeetingMemberSnapshotSchema,
      },
    ]),
    SharedModule,
    ConfigModule,
  ],
  controllers: [MonitoringController],
  providers: [
    MeetingMemberSnapshotEntityRepository,
    MeetingMemberSnapshotDtoRepository,
    MeetingMemberSnapshotDocumentFactory,
    MeetingMemberSnapshotFactory,
    ...MonitoringCommandHandlers,
    ...MonitoringQueryHandlers,
    MonitoringService,
  ],
  exports: [MonitoringService],
})
export class MonitoringModule {}
