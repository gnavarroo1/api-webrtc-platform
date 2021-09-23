import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveMeetingMemberRequest {
  @IsString()
  @IsNotEmpty()
  readonly socketId: string;
}
