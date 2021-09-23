import { CreateUserHandler } from './create-user/create-user.handler';
import { GenerateGuestTokenHandler } from './generateGuestToken/generate-guest-token.handler';
import { AuthenticateUserHandler } from './authenticate-user/authenticate-user.handler';

export const UserCommandHandlers = [
  GenerateGuestTokenHandler,
  CreateUserHandler,
  AuthenticateUserHandler,
];
