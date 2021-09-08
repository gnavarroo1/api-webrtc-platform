export class UserDto {
  readonly _id: string;
  readonly alias: string;
  readonly hasAudio: boolean = true;
  readonly hasVideo: boolean = true;
  readonly userType: string;
  readonly socketId: string;
  readonly active: boolean = true;
}
