import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UserFactory } from '../../../domain/UserFactory';
import { CreateUserCommand } from './create-user.command';
import { SecurityService } from '../../services/security.service';
import { HttpException, HttpStatus } from '@nestjs/common';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly eventPublisher: EventPublisher,
    private securityService: SecurityService,
  ) {}
  async execute({ createUserRequest }: CreateUserCommand): Promise<any> {
    const { salt, hash } = this.securityService.getSaltHashPassword(
      createUserRequest.password,
    );
    const username = createUserRequest.username.toLowerCase();
    const email = createUserRequest.email.toLowerCase();

    const result = await this.securityService.findDuplicate(username, email);

    if (result.length > 0) {
      const errors: Record<string, any> = {};
      result.forEach((user) => {
        if (user.username === username) {
          errors.username = {
            duplicate: 'username is already registered',
          };
        }
        if (user.email === email) {
          errors.email = { duplicate: 'email is already registered' };
        }
      });
      throw new HttpException(
        { validationMessage: errors },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = this.eventPublisher.mergeObjectContext(
      await this.userFactory.create(
        username,
        email,
        createUserRequest.firstName,
        createUserRequest.lastName,
        salt,
        hash,
      ),
    );
    user.commit();
    return {
      data: {
        username: username,
        email: email,
      },
    };
  }
}
