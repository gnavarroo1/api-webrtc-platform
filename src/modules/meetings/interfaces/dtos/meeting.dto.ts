import { Types } from 'mongoose';

export class MeetingDto {
  readonly _id?: string;
  readonly name?: string;
  readonly meetingCreatorId?: Types.ObjectId;
  readonly activeMembers?: any;
}
