import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MeetingDto } from '../../interfaces/dtos/meeting.dto';
import { MeetingSchema } from '../schemas/meeting.schema';
import { UserDto } from '../../interfaces/dtos/user.dto';

@Injectable()
export class MeetingDtoRepository {
  constructor(
    @InjectModel(MeetingSchema.name)
    private readonly meetingModel: Model<MeetingSchema>,
  ) {}

  async getAllMeetingParticipants(_id: string): Promise<UserDto[]> {
    const meeting = await this.meetingModel.findById(_id).lean();
    const participants = meeting.participants;
    return participants.map((p) => {
      if (p.userType === 'PARTICIPANT') {
        return p;
      }
    });
  }
  async find(_id: string): Promise<MeetingDto> {
    return await this.meetingModel.findOne({
      _id: _id,
      active: true,
    });
  }
  async findAttr(entityFilterQuery: MeetingSchema): Promise<MeetingDto> {
    return await this.meetingModel.findOne(
      entityFilterQuery,
    );
  }
}
