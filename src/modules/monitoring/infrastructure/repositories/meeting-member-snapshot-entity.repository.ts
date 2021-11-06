import { Injectable } from '@nestjs/common';
import { BaseEntityRepository } from '../../../../shared/generics/base-entity.repository';
import { MeetingMemberSnapshotDocument } from '../../../../shared/infrastructure/schemas/meeting-member-snapshot.schema';
import { MeetingMemberSnapshot } from '../../domain/aggregates/member-snapshot.aggregate';
import { InjectModel } from '@nestjs/mongoose';
import { MeetingMemberSnapshotDocumentFactory } from '../factories/meeting-member-snapshot-document.factory';
import { Model } from 'mongoose';

@Injectable()
export class MeetingMemberSnapshotEntityRepository extends BaseEntityRepository<
  MeetingMemberSnapshotDocument,
  MeetingMemberSnapshot
> {
  constructor(
    @InjectModel(MeetingMemberSnapshotDocument.name)
    meetingMemberSnapshotModel: Model<MeetingMemberSnapshotDocument>,
    meetingMemberSnapshotDocumentFactory: MeetingMemberSnapshotDocumentFactory,
  ) {
    super(meetingMemberSnapshotModel, meetingMemberSnapshotDocumentFactory);
  }
}
