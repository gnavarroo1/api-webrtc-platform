export class UserDto {
  readonly username: string;
  readonly email: string;
  readonly _id: string;
  readonly verified: boolean;
  readonly salt: string;
  readonly hash: string;
}
