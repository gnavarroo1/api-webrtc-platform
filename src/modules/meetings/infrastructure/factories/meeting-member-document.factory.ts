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
      sessionUserId: new ObjectId(entity.sessionUserId),
      userId: new ObjectId(entity.userId),
      meetingId: new ObjectId(entity.meetingId),
      nickname: entity.nickname,
      socketId: entity.socketId,
      memberType: entity.memberType,
      isActive: entity.isActive,
      produceAudioAllowed: entity.produceAudioAllowed,
      produceAudioEnabled: entity.produceAudioEnabled,
      produceVideoAllowed: entity.produceVideoAllowed,
      produceVideoEnabled: entity.produceVideoEnabled,
    };
  }

  createFromSchema(entitySchema: MeetingMemberDocument): MeetingMember {
    const mediaCapabilities = {
      _produceAudioEnabled: entitySchema.produceAudioEnabled,
      _produceAudioAllowed: entitySchema.produceAudioAllowed,
      _produceVideoEnabled: entitySchema.produceVideoEnabled,
      _produceVideoAllowed: entitySchema.produceVideoAllowed,
    };
    return new MeetingMember(
      entitySchema._id.toHexString(),
      entitySchema.userId.toHexString(),
      entitySchema.sessionUserId.toHexString(),
      entitySchema.meetingId.toHexString(),
      entitySchema.socketId,
      entitySchema.nickname,
      entitySchema.memberType,
      mediaCapabilities,
      entitySchema.isActive,
    );
  }
}
