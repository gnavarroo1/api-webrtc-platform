import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityService } from '../../services/security.service';
import { VerifyEmailCommand } from './verify-email.command';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(private readonly securityService: SecurityService) {}
  execute({ verifyEmailRequest }: VerifyEmailCommand): Promise<any> {
    return this.securityService.verifyEmailHandler(verifyEmailRequest);
  }
}
