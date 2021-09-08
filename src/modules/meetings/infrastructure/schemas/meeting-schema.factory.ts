import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EntitySchemaFactory } from '../../../../shared/entity-schema.factory';
import { MeetingSchema } from './meeting.schema';

import { Meeting } from '../../domain/aggregates/Meeting';

@Injectable()
export class MeetingSchemaFactory
  implements EntitySchemaFactory<MeetingSchema, Meeting>
{
  create(entity: Meeting): MeetingSchema {
    return {
      _id: new ObjectId(entity.getId()),
      name: entity.getName(),
      meetingCreatorId: entity.getMeetingCreatorId(),
      participants: entity.getParticipants(),
      creationDate: new Date(),
      roomCode: '',
      active: entity.getActive(),
    };
  }

  createFromSchema(entitySchema: MeetingSchema): Meeting {
    return new Meeting(
      entitySchema._id.toHexString(),
      entitySchema.name,
      entitySchema.meetingCreatorId,
      entitySchema.participants,
      entitySchema.active,
    );
  }
}
