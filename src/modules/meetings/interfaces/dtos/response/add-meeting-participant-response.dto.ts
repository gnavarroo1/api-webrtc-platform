import { UserDto } from '../user.dto';

export class AddMeetingParticipantResponse {
  readonly participants: UserDto[];
  readonly alias: string;
  readonly isMeetingCreator: boolean;
  readonly hasAudio: boolean;
  readonly hasVideo: boolean;
  readonly userType: string;
}
