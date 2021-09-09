export class CreateUserRequest {
  readonly username: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly password: string;
  isTemporary?: boolean = false;
}
