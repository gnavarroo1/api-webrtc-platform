import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UserFactory } from '../../../domain/UserFactory';
import { CreateUserCommand } from './create-user.command';
import { JwtService } from '@nestjs/jwt';
import { SecurityService } from '../../services/security.service';
import { randomUUID } from 'crypto';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly eventPublisher: EventPublisher,
    private jwtService: JwtService,
    private securityService: SecurityService,
  ) {}
  async execute({
    createUserRequest,
    sessionId,
  }: CreateUserCommand): Promise<any> {
    const { salt, hash } = this.securityService.getSaltHashPassword(
      createUserRequest.password,
    );
    const user = this.eventPublisher.mergeObjectContext(
      await this.userFactory.create(
        createUserRequest.username,
        createUserRequest.email,
        createUserRequest.firstName,
        createUserRequest.lastName,
        salt,
        hash,
      ),
    );
    user.commit();

    const payload = {
      username: user.username,
      sub: user.id,
      isGuest: false,
      sessionId: sessionId ? sessionId : randomUUID(),
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
