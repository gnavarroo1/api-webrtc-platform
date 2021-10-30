import { ForgotPasswordRequestDto } from '../../../interfaces/dtos/requests/forgot-password-request.dto';

export class ForgotPasswordCommand {
  constructor(
    public readonly forgotPasswordResquest: ForgotPasswordRequestDto,
  ) {}
}
