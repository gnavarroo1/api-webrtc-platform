import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class AddMeetingMemberRequest {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsString()
  @IsNotEmpty()
  readonly meetingId: string;

  @IsString()
  @IsNotEmpty()
  readonly nickname: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['BOTH', 'CONSUMER', 'PRODUCER'])
  readonly memberType: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['MESH', 'SFU'])
  readonly connectionType: string;
}
