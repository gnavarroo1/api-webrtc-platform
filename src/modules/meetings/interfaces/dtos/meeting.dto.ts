import { Types } from 'mongoose';

export class MeetingDto {
  readonly _id?: string;
  readonly isBroadcasting: boolean;
  readonly isActive: boolean;
  readonly meetingCreatorId?: Types.ObjectId;
  readonly activeMembers?: any;
}
