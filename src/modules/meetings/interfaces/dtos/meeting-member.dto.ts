import { Types } from 'mongoose';

export class MeetingMemberDto {
  readonly canScreenShare: boolean;
  readonly isScreenSharing: boolean;
  readonly produceVideoEnabled: boolean;
  readonly produceAudioEnabled: boolean;
  readonly produceVideoAllowed: boolean;
  readonly produceAudioAllowed: boolean;
  readonly _id: Types.ObjectId;
  readonly userId: string;
  readonly nickname: string;
  readonly memberType: string;
  readonly meetingId: string;
}
