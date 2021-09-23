import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMeetingMemberRequest {
  @IsNotEmpty()
  @IsString()
  readonly meetingId: string;
  @IsNotEmpty()
  @IsString()
  readonly meetingMemberId: string;

  @IsOptional()
  @IsBoolean()
  @IsIn(['BOTH', 'CONSUMER', 'PRODUCER'])
  readonly memberType?: string;

  @IsOptional()
  @IsBoolean()
  readonly produceAudioAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly produceVideoAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly produceAudioEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly produceVideoEnabled?: boolean;

  @IsOptional()
  @IsString()
  readonly nickname?: string;
}
