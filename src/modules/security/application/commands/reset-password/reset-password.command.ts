import { ResetPasswordRequestDto } from '../../../interfaces/dtos/requests/reset-password-request.dto';

export class ResetPasswordCommand {
  constructor(public readonly resetPasswordDto: ResetPasswordRequestDto) {}
}
