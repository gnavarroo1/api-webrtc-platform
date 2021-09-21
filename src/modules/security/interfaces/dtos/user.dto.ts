export class UserDto {
  readonly _id: string;
  readonly salt: string;
  readonly hash: string;
}
