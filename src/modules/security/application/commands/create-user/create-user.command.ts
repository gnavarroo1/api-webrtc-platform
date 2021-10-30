import { CreateUserRequest } from '../../../interfaces/dtos/requests/create-user-request.dto';

export class CreateUserCommand {
  constructor(public readonly createUserRequest: CreateUserRequest) {}
}
