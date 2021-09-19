import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MeetingMemberDocument } from '../../../../shared/infrastructure/schemas/meeting-member.schema';
import { Model } from 'mongoose';

@Injectable()
export class MeetingMemberDtoRepository {
  constructor(
    @InjectModel(MeetingMemberDocument.name)
    private readonly meetingMemberModel: Model<MeetingMemberDocument>,
  ) {}
}
