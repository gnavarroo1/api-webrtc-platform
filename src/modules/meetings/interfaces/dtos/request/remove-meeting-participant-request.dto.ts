import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveMeetingParticipantRequest {
  @IsString()
  @IsNotEmpty()
  readonly userToken: string;

  @IsString()
  @IsNotEmpty()
  readonly socketId: string;
}
