import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UserFactory } from '../../../domain/UserFactory';
import { AuthenticateUserCommand } from './authenticate-user.command';
import { JwtService } from '@nestjs/jwt';
import { SecurityService } from '../../services/security.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMessage } from '../../../../meetings/domain/error.enum';
import { AuthenticateUserResponseDto } from '../../../interfaces/dtos/responses/authenticate-user-response.dto';

@CommandHandler(AuthenticateUserCommand)
export class AuthenticateUserHandler
  implements ICommandHandler<AuthenticateUserCommand>
{
  constructor(
    private readonly userFactory: UserFactory,
    private readonly eventPublisher: EventPublisher,
    private jwtService: JwtService,
    private securityService: SecurityService,
  ) {}
  async execute({
    authenticateUserRequest,
    sessionId,
  }: AuthenticateUserCommand): Promise<AuthenticateUserResponseDto> {
    const user = await this.securityService.findOneByUsername(
      authenticateUserRequest.username,
    );

    const validate = this.securityService.validatePassword(
      authenticateUserRequest.password,
      user.hash,
      user.salt,
    );
    if (!validate) {
      throw new HttpException(
        ErrorMessage.CREDENTIALS_ERROR,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const payload = {
      username: user.username,
      sub: user._id,
      isGuest: false,
      sessionId: sessionId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
