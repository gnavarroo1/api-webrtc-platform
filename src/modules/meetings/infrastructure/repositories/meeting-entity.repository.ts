import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityRepository } from '../../../../shared/base-entity.repository';
import { MeetingSchema } from '../schemas/meeting.schema';
import { Meeting } from '../../domain/aggregates/Meeting';
import { MeetingSchemaFactory } from '../schemas/meeting-schema.factory';

@Injectable()
export class MeetingEntityRepository extends BaseEntityRepository<
  MeetingSchema,
  Meeting
> {
  constructor(
    @InjectModel(MeetingSchema.name)
    meetingModel: Model<MeetingSchema>,
    meetingSchemaFactory: MeetingSchemaFactory,
  ) {
    super(meetingModel, meetingSchemaFactory);
  }
}
