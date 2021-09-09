import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UserFactory } from '../../../domain/UserFactory';
import { CreateUserCommand } from './create-user.command';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';

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
    const isTemporary = createUserRequest.isTemporary;
    try {
      const user = this.eventPublisher.mergeObjectContext(
        await this.userFactory.create(
          createUserRequest.username,
          createUserRequest.email,
          createUserRequest.firstName,
          createUserRequest.lastName,
          isTemporary,
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
    } catch (e) {
      switch (e.name) {
        case 'ValidationError':
          break;
        case 'MongoError':
          const msg = [];
          if ('keyValue' in e) {
            Object.keys(e.keyValue).forEach((key) => {
              msg.push(
                `Invalid ${key}. The ${key} '${e.keyValue[key]}' already exists on the system.`,
              );
            });
            throw new HttpException(
              {
                type: 'DUPLICATE',
                msg: msg,
                e: e,
              },
              HttpStatus.CONFLICT,
            );
          }
      }

      throw new HttpException(
        {
          payload: createUserRequest,
          error: e,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
