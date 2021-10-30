import { Injectable } from '@nestjs/common';
import { EntitySchemaFactory } from '../../../../shared/generics/entity-schema.factory';
import { MeetingMemberDocument } from '../../../../shared/infrastructure/schemas/meeting-member.schema';
import { MeetingMember } from '../../domain/aggregates/meeting-member.aggregate';
import { ObjectId } from 'mongodb';
import { MediaCapabilities } from '../../../../shared/types/common.types';

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
      isScreenSharing: entity.isScreenSharing,
      canScreenShare: entity.canScreenShare,
      connectionType: entity.connectionType,
      produceAudioAllowed: entity.produceAudioAllowed,
      produceAudioEnabled: entity.produceAudioEnabled,
      produceVideoAllowed: entity.produceVideoAllowed,
      produceVideoEnabled: entity.produceVideoEnabled,
    };
  }

  createFromSchema(entitySchema: MeetingMemberDocument): MeetingMember {
    const mediaCapabilities: MediaCapabilities = {
      _isScreenSharing: entitySchema.isScreenSharing,
      _connectionType: entitySchema.connectionType,
      _produceAudioEnabled: entitySchema.produceAudioEnabled,
      _produceAudioAllowed: entitySchema.produceAudioAllowed,
      _produceVideoEnabled: entitySchema.produceVideoEnabled,
      _produceVideoAllowed: entitySchema.produceVideoAllowed,
      _canScreenShare: entitySchema.canScreenShare,
    };
    return new MeetingMember(
      entitySchema._id.toHexString(),
      entitySchema.userId.toHexString(),
      entitySchema.meetingId.toHexString(),
      entitySchema.socketId,
      entitySchema.nickname,
      entitySchema.memberType,
      mediaCapabilities,
      entitySchema.isActive,
    );
  }
}
