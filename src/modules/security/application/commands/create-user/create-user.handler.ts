import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UserFactory } from '../../../domain/UserFactory';
import { CreateUserCommand } from './create-user.command';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

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
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(createUserRequest.password, salt, 10000, 512, 'sha512')
      .toString('hex');
    const user = this.eventPublisher.mergeObjectContext(
      await this.userFactory.create(
        createUserRequest.username,
        createUserRequest.email,
        createUserRequest.firstname,
        createUserRequest.lastname,
        createUserRequest.isTemporary,
        salt,
        hash,
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
