import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UserFactory } from '../../../domain/UserFactory';
import { CreateUserCommand } from './create-user.command';
import { JwtService } from '@nestjs/jwt';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly eventPublisher: EventPublisher,
    private jwtService: JwtService,
  ) {}
  async execute({
    createUserRequest,
    headers,
  }: CreateUserCommand): Promise<any> {
    // console.log(headers);
    const user = this.eventPublisher.mergeObjectContext(
      await this.userFactory.create(
        createUserRequest.username,
        createUserRequest.email,
        createUserRequest.firstname,
        createUserRequest.lastname,
        createUserRequest.isTemporary,
        createUserRequest.password,
      ),
    );
    user.commit();
    const payload = {
      username: user.username,
      sub: user.id,
      isTemporary: user.isTemporary,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
