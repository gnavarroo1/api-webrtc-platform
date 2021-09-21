import { Body, Controller, Headers, Logger, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../application/commands/create-user/create-user.command';
import { CreateUserRequest } from '../dtos/requests/create-user-request.dto';
import { randomUUID } from 'crypto';

@Controller('api')
export class SecurityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  private logger: Logger = new Logger('SECURITY CONTROLLER');
  @Post('sign-up')
  // @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Headers() headers,
    @Body() createUserRequest: CreateUserRequest,
  ): Promise<any> {
    return await this.commandBus.execute<CreateUserCommand, void>(
      new CreateUserCommand(createUserRequest, headers),
    );
  }
  @Post('partial-sign-up')
  async createAnonUser(@Headers() headers, @Body() req): Promise<any> {
    const tmp = {
      username: randomUUID(),
      firstName: randomUUID(),
      lastName: randomUUID(),
      email: randomUUID(),
      password: randomUUID(),
      isTemporary: true,
    };
    return await this.commandBus.execute<CreateUserCommand, void>(
      new CreateUserCommand(tmp, headers),
    );
  }
}
