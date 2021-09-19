import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityRepository } from '../../../../shared/generics/base-entity.repository';
import { MeetingDocument } from '../../../../shared/infrastructure/schemas/meeting.schema';
import { Meeting } from '../../domain/aggregates/meeting.aggregate';
import { MeetingDocumentFactory } from '../factories/meeting-document.factory';

@Injectable()
export class MeetingEntityRepository extends BaseEntityRepository<
  MeetingDocument,
  Meeting
> {
  constructor(
    @InjectModel(MeetingDocument.name)
    meetingModel: Model<MeetingDocument>,
    meetingDocumentFactory: MeetingDocumentFactory,
  ) {
    super(meetingModel, meetingDocumentFactory);
  }
}
