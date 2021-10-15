import { Types } from 'mongoose';
import { MeetingMemberDto } from './meeting-member.dto';

export class MeetingDto {
  readonly _id?: string;
  readonly isBroadcasting: boolean;
  readonly isActive: boolean;
  readonly meetingCreatorId?: Types.ObjectId;
  readonly activeMembers?: MeetingMemberDto[];
  readonly activeViewers?: MeetingMemberDto[];
}
