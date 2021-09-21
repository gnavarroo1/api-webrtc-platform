import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityRepository } from '../../../../shared/generics/base-entity.repository';
import { MeetingMemberDocument } from '../../../../shared/infrastructure/schemas/meeting-member.schema';
import { MeetingMemberDocumentFactory } from '../factories/meeting-member-document.factory';
import { MeetingMember } from '../../domain/aggregates/meeting-member.aggregate';

@Injectable()
export class MeetingMemberEntityRepository extends BaseEntityRepository<
  MeetingMemberDocument,
  MeetingMember
> {
  constructor(
    @InjectModel(MeetingMemberDocument.name)
    meetingMemberModel: Model<MeetingMemberDocument>,
    meetingMemberDocumentFactory: MeetingMemberDocumentFactory,
  ) {
    super(meetingMemberModel, meetingMemberDocumentFactory);
  }
}
