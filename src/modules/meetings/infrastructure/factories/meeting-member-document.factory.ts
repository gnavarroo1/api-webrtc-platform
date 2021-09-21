import { Injectable } from '@nestjs/common';
import { EntitySchemaFactory } from '../../../../shared/generics/entity-schema.factory';
import { MeetingMemberDocument } from '../../../../shared/infrastructure/schemas/meeting-member.schema';
import { MeetingMember } from '../../domain/aggregates/meeting-member.aggregate';
import { ObjectId } from 'mongodb';

@Injectable()
export class MeetingMemberDocumentFactory
  implements EntitySchemaFactory<MeetingMemberDocument, MeetingMember>
{
  create(entity: MeetingMember): MeetingMemberDocument {
    return {
      _id: new ObjectId(entity.id),
      userId: new ObjectId(entity.userId),
      meetingId: new ObjectId(entity.meetingId),
      nickname: entity.nickname,
      socketId: entity.socketId,
      memberType: entity.memberType,
      isActive: entity.isActive,
    };
  }

  createFromSchema(entitySchema: MeetingMemberDocument): MeetingMember {
    return new MeetingMember(
      entitySchema._id.toHexString(),
      entitySchema.userId.toHexString(),
      entitySchema.meetingId.toHexString(),
      entitySchema.socketId,
      entitySchema.nickname,
      entitySchema.memberType,
      entitySchema.isActive,
    );
  }
}
