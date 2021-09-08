export class CreateUserRequest {
  readonly username: string;
  readonly email: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly password: string;
  isTemporary?: boolean = false;
}
