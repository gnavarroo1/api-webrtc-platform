import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityService } from '../../services/security.service';
import { ResendConfirmationEmailCommand } from './resend-confirmation-email.command';

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailHandler
  implements ICommandHandler<ResendConfirmationEmailCommand>
{
  constructor(private readonly securityService: SecurityService) {}
  execute({
    resendConfirmationEmailDto,
  }: ResendConfirmationEmailCommand): Promise<any> {
    return this.securityService.reSendVerificationEmail(
      resendConfirmationEmailDto,
    );
  }
}
