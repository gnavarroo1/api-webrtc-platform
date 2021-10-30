import { CreateUserHandler } from './create-user/create-user.handler';
import { AuthenticateUserHandler } from './authenticate-user/authenticate-user.handler';
import { ForgotPasswordHandler } from './forgot-password/forgot-password.handler';
import { VerifyEmailHandler } from './verify-email/verify-email.handler';
import { ResetPasswordHandler } from './reset-password/reset-password.handler';
import { ResendConfirmationEmailHandler } from './resend-confirmation-email/resend-confirmation-email.handler';

export const UserCommandHandlers = [
  CreateUserHandler,
  AuthenticateUserHandler,
  ForgotPasswordHandler,
  VerifyEmailHandler,
  ResetPasswordHandler,
  ResendConfirmationEmailHandler,
];
