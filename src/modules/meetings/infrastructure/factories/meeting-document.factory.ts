import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EntitySchemaFactory } from '../../../../shared/generics/entity-schema.factory';
import { MeetingDocument } from '../../../../shared/infrastructure/schemas/meeting.schema';

import { Meeting } from '../../domain/aggregates/meeting.aggregate';

@Injectable()
export class MeetingDocumentFactory
  implements EntitySchemaFactory<MeetingDocument, Meeting>
{
  create(entity: Meeting): MeetingDocument {
    return {
      _id: new ObjectId(entity.getId()),
      meetingCreatorId: new ObjectId(entity.getMeetingCreatorId()),
      // activeMembers: entity.getParticipants(),
      roomCode: '',
      active: entity.getActive(),
    };
  }

  createFromSchema(entitySchema: MeetingDocument): Meeting {
    return new Meeting(
      entitySchema._id.toHexString(),
      entitySchema.meetingCreatorId.toHexString(),
      // entitySchema.activeMembers,
      entitySchema.active,
    );
  }
}
