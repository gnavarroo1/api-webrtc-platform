import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from './forgot-password.command';
import { SecurityService } from '../../services/security.service';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordCommand>
{
  constructor(private readonly securityService: SecurityService) {}
  async execute({
    forgotPasswordResquest,
  }: ForgotPasswordCommand): Promise<any> {
    return this.securityService.forgotPasswordHandler(
      forgotPasswordResquest.email,
    );
  }
}
