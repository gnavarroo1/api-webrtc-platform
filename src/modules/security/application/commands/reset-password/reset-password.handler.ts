import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from './reset-password.command';
import { SecurityService } from '../../services/security.service';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(private readonly securityService: SecurityService) {}

  execute({ resetPasswordDto }: ResetPasswordCommand): Promise<any> {
    return this.securityService.resetPasswordHandler(resetPasswordDto);
  }
}
