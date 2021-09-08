export class UserDto {
  readonly _id: string;
  readonly alias?: string;
  readonly hasAudio: boolean;
  readonly hasVideo: boolean;
  readonly userType: string;
}
