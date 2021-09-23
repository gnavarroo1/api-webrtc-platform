export class UserDto {
  readonly username: string;
  readonly _id: string;
  readonly salt: string;
  readonly hash: string;
}
