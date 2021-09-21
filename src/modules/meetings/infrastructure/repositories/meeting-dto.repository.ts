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

  // async getAllMeetingParticipants(_id: string): Promise<MeetingMemberDto[]> {
  //   const meeting = await this.meetingModel.findById(_id).lean();
  //   const participants = meeting.activeMembers;
  //   return participants.map((p) => {
  //     if (p.userType === 'PARTICIPANT') {
  //       return p;
  //     }
  //   });
  // }
  async find(_id: string): Promise<MeetingDto> {
    const meeting = await this.meetingModel
      .findOne({
        _id: _id,
        active: true,
      })
      .populate({ path: 'activeMembers' });
    console.log(meeting);
    return meeting;
  }
  async findAttr(entityFilterQuery: MeetingDocument): Promise<MeetingDto> {
    return this.meetingModel.findOne(entityFilterQuery);
  }
}
