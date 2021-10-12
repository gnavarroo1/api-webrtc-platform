import { Types } from 'mongoose';

export class MeetingMemberDto {
  readonly isScreenSharing: boolean;
  readonly produceVideoEnabled: boolean;
  readonly produceAudioEnabled: boolean;
  readonly produceVideoAllowed: boolean;
  readonly produceAudioAllowed: boolean;
  readonly _id: Types.ObjectId;
  readonly sessionUserId: string;
  readonly userId: string;
  readonly nickname: string;
  readonly memberType: string;
}
