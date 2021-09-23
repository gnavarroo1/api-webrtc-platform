import { AuthenticateUserRequestDto } from '../../../interfaces/dtos/requests/authenticate-user-request.dto';

export class AuthenticateUserCommand {
  constructor(
    public readonly authenticateUserRequest: AuthenticateUserRequestDto,
    public readonly sessionId: string,
  ) {}
}
