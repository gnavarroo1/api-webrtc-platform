import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../application/commands/create-user/create-user.command';
import { CreateUserRequest } from '../dtos/requests/create-user-request.dto';
import { GenerateGuestTokenCommand } from '../../application/commands/generateGuestToken/generate-guest-token.command';
import { AuthenticateUserRequestDto } from '../dtos/requests/authenticate-user-request.dto';
import { AuthenticateUserCommand } from '../../application/commands/authenticate-user/authenticate-user.command';
import { AuthenticateUserResponseDto } from '../dtos/responses/authenticate-user-response.dto';

@Controller('api')
export class SecurityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  private logger: Logger = new Logger('SECURITY CONTROLLER');

  @Get('create-guess-token')
  async createGuessToken(): Promise<any> {
    return this.commandBus.execute<GenerateGuestTokenCommand, void>(
      new GenerateGuestTokenCommand(),
    );
  }

  // @UseGuards(JwtAuthGuard)
  @Post('sign-up')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Request() req,
    @Body() createUserRequest: CreateUserRequest,
  ): Promise<any> {
    return this.commandBus.execute<CreateUserCommand, void>(
      new CreateUserCommand(createUserRequest),
    );
  }

  // @UseGuards(JwtAuthGuard)
  @Post('login')
  async login(
    @Request() req,
    @Body() user: AuthenticateUserRequestDto,
  ): Promise<any> {
    let sessionId;
    if (req.user) {
      sessionId = req.user.sessionId;
    }

    return this.commandBus.execute<
      AuthenticateUserCommand,
      AuthenticateUserResponseDto
    >(new AuthenticateUserCommand(user, sessionId));
  }
}
