import { Types } from 'mongoose';

export class MeetingMemberDto {
  readonly _id: Types.ObjectId;
  readonly nickname: string;
  readonly hasAudio: boolean = true;
  readonly hasVideo: boolean = true;
  readonly userType: string;
  readonly socketId: string;
  readonly active: boolean = true;
}
