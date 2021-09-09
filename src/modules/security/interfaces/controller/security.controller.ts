import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
  Headers,
  Logger,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../application/commands/create-user/create-user.command';
import { CreateUserRequest } from '../dtos/requests/create-user-request.dto';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
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
    console.log(createUserRequest);
    return await this.commandBus.execute<CreateUserCommand, void>(
      new CreateUserCommand(createUserRequest, headers),
    );
  }
  @Post('partial-sign-up')
  async createAnonUser(@Headers() headers, @Body() req): Promise<any> {
    this.logger.log(headers);
    const tmp = {
      username: randomUUID(),
      firstName: randomUUID(),
      lastName: randomUUID(),
      email: randomUUID(),
      password: randomUUID(),
      isTemporary: true,
    };
    this.logger.log(tmp);
    return await this.commandBus.execute<CreateUserCommand, void>(
      new CreateUserCommand(tmp, headers),
    );
  }
}
