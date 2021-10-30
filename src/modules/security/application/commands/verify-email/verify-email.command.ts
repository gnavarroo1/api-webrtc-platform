import { VerifyEmailRequestDto } from '../../../interfaces/dtos/requests/verify-email-request.dto';

export class VerifyEmailCommand {
  constructor(public readonly verifyEmailRequest: VerifyEmailRequestDto) {}
}
