import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingEntityRepository } from './infrastructure/repositories/meeting-entity.repository';
import { MeetingDtoRepository } from './infrastructure/repositories/meeting-dto.repository';
import { MeetingDocumentFactory } from './infrastructure/factories/meeting-document.factory';
import { MeetingFactory } from './domain/meeting.factory';
import { MeetingCommandHandlers } from './application/commands';
import { MeetingQueryHandlers } from './application/queries';
import { MeetingController } from './interfaces/rest/meeting.controller';
import { MeetingGateway } from './interfaces/socket/meeting.gateway';
import {
  MeetingMemberDocument,
  MeetingMemberSchema,
} from '../../shared/infrastructure/schemas/meeting-member.schema';
import {
  MeetingDocument,
  MeetingSchema,
} from '../../shared/infrastructure/schemas/meeting.schema';
import { MeetingMemberEntityRepository } from './infrastructure/repositories/meeting-member-entity.repository';
import { MeetingMemberDtoRepository } from './infrastructure/repositories/meeting-member-dto.repository';
import { MeetingMemberDocumentFactory } from './infrastructure/factories/meeting-member-document.factory';
import { MeetingMemberFactory } from './domain/meeting-member.factory';
import { SharedModule } from '../../shared/shared.module';
import { MeetingEventHandlers } from './application/events';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: MeetingDocument.name,
        schema: MeetingSchema,
      },
      {
        name: MeetingMemberDocument.name,
        schema: MeetingMemberSchema,
      },
    ]),
    SharedModule,
  ],
  controllers: [MeetingController],
  providers: [
    MeetingEntityRepository,
    MeetingDtoRepository,
    MeetingDocumentFactory,
    MeetingFactory,
    MeetingMemberEntityRepository,
    MeetingMemberDtoRepository,
    MeetingMemberDocumentFactory,
    MeetingMemberFactory,
    ...MeetingCommandHandlers,
    ...MeetingQueryHandlers,
    ...MeetingEventHandlers,
    MeetingGateway,
  ],
})
export class MeetingsModule {}
