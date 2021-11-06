import { Injectable } from '@nestjs/common';
import { EntitySchemaFactory } from '../../../../shared/generics/entity-schema.factory';
import { MeetingMemberSnapshotDocument } from '../../../../shared/infrastructure/schemas/meeting-member-snapshot.schema';
import { MeetingMemberSnapshot } from '../../domain/aggregates/member-snapshot.aggregate';
import { ObjectId } from 'mongodb';

@Injectable()
export class MeetingMemberSnapshotDocumentFactory
  implements
    EntitySchemaFactory<MeetingMemberSnapshotDocument, MeetingMemberSnapshot>
{
  create(entity: MeetingMemberSnapshot): MeetingMemberSnapshotDocument {
    return {
      _id: new ObjectId(entity.id),
      meetingId: new ObjectId(entity.meetingId),
      meetingMemberId: new ObjectId(entity.meetingMemberId),
      p2pSnapshots: entity.p2pSnapshots,
      sfuSnapshots: entity.sfuSnapshots,
    };
  }

  createFromSchema(
    entitySchema: MeetingMemberSnapshotDocument,
  ): MeetingMemberSnapshot {
    return new MeetingMemberSnapshot(
      entitySchema._id.toHexString(),
      entitySchema.meetingMemberId.toHexString(),
      entitySchema.meetingId.toHexString(),
      entitySchema.p2pSnapshots,
      entitySchema.sfuSnapshots,
    );
  }
}
