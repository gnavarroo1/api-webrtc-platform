import { Types } from 'mongoose';

export class MeetingMemberDto {
  readonly _id: Types.ObjectId;
  readonly nickname: string;
  readonly memberType: string;
  readonly socketId: string;
}
