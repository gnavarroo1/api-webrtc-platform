import {
  Body,
  Controller,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../application/commands/create-user/create-user.command';
import { CreateUserRequest } from '../dtos/requests/create-user-request.dto';
import { AuthenticateUserRequestDto } from '../dtos/requests/authenticate-user-request.dto';
import { AuthenticateUserCommand } from '../../application/commands/authenticate-user/authenticate-user.command';
import { AuthenticateUserResponseDto } from '../dtos/responses/authenticate-user-response.dto';
import { ForgotPasswordRequestDto } from '../dtos/requests/forgot-password-request.dto';
import { ForgotPasswordCommand } from '../../application/commands/forgot-password/forgot-password.command';
import { ResetPasswordRequestDto } from '../dtos/requests/reset-password-request.dto';
import { ResetPasswordCommand } from '../../application/commands/reset-password/reset-password.command';
import { ResendConfirmationEmailDto } from '../dtos/requests/resend-confirmation-email.dto';
import { ResendConfirmationEmailCommand } from '../../application/commands/resend-confirmation-email/resend-confirmation-email.command';
import { VerifyEmailRequestDto } from '../dtos/requests/verify-email-request.dto';
import { VerifyEmailCommand } from '../../application/commands/verify-email/verify-email.command';

@Controller('api')
export class SecurityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  private logger: Logger = new Logger('SECURITY CONTROLLER');

  // @UseGuards(JwtAuthGuard)
  @Post('sign-up')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createUserRequest: CreateUserRequest): Promise<any> {
    return this.commandBus.execute<CreateUserCommand, void>(
      new CreateUserCommand(createUserRequest),
    );
  }

  // @UseGuards(JwtAuthGuard)
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() user: AuthenticateUserRequestDto): Promise<any> {
    return this.commandBus.execute<
      AuthenticateUserCommand,
      AuthenticateUserResponseDto
    >(new AuthenticateUserCommand(user));
  }

  @Post('forgot-password')
  @UsePipes(new ValidationPipe({ transform: true }))
  async forgotPassword(
    @Body() forgotPasswordRequest: ForgotPasswordRequestDto,
  ): Promise<any> {
    return this.commandBus.execute<ForgotPasswordCommand, void>(
      new ForgotPasswordCommand(forgotPasswordRequest),
    );
  }
  @Post('reset-password')
  @UsePipes(new ValidationPipe({ transform: true }))
  async resetPassword(
    @Body() resetPasswordRequest: ResetPasswordRequestDto,
  ): Promise<any> {
    return this.commandBus.execute<ResetPasswordCommand, void>(
      new ResetPasswordCommand(resetPasswordRequest),
    );
  }

  @Post('resend-confirmation-email')
  @UsePipes(new ValidationPipe({ transform: true }))
  async reSendConfirmationEmail(
    @Body() resendConfirmationEmailDto: ResendConfirmationEmailDto,
  ): Promise<any> {
    return this.commandBus.execute<ResendConfirmationEmailCommand, void>(
      new ResendConfirmationEmailCommand(resendConfirmationEmailDto),
    );
  }

  @Post('verify-email')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verifyEmail(
    @Body() verifyEmailRequest: VerifyEmailRequestDto,
  ): Promise<any> {
    return this.commandBus.execute<VerifyEmailCommand, void>(
      new VerifyEmailCommand(verifyEmailRequest),
    );
  }
}
