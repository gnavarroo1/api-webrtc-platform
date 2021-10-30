import { ResendConfirmationEmailDto } from '../../../interfaces/dtos/requests/resend-confirmation-email.dto';

export class ResendConfirmationEmailCommand {
  constructor(
    public readonly resendConfirmationEmailDto: ResendConfirmationEmailDto,
  ) {}
}
