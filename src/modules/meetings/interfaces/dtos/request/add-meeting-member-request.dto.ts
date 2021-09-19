import { IsNotEmpty, IsString } from 'class-validator';

export class AddMeetingMemberRequest {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsString()
  @IsNotEmpty()
  readonly meetingId: string;

  readonly nickname: string;

  @IsString()
  @IsNotEmpty()
  readonly memberType: string;
}
