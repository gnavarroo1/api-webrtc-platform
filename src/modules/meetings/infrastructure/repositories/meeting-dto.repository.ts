import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MeetingDto } from '../../interfaces/dtos/meeting.dto';
import { MeetingDocument } from '../../../../shared/infrastructure/schemas/meeting.schema';

@Injectable()
export class MeetingDtoRepository {
  constructor(
    @InjectModel(MeetingDocument.name)
    private readonly meetingModel: Model<MeetingDocument>,
  ) {}

  async find(_id: string): Promise<MeetingDto> {
    return await this.meetingModel
      .findOne({
        _id: _id,
        isActive: true,
      })
      .populate({ path: 'activeMembers' });
  }
  async findAttr(entityFilterQuery: MeetingDocument): Promise<MeetingDto> {
    return this.meetingModel.findOne(entityFilterQuery);
  }
}
